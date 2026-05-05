
import { Category, Wallet } from '../types/finance';

export interface CsvRow {
  tanggal: string;
  jenisTransaksi: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
  dompet: string;
}

export interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryName: string;
  walletName: string;
  date: Date;
  rawRow: CsvRow;
  // Resolved after mapping
  categoryId?: string;
  walletId?: string;
  error?: string;
}

export interface CsvParseResult {
  success: boolean;
  data: ParsedTransaction[];
  errors: string[];
  totalRows: number;
}

/**
 * Parse a date string in various Indonesian formats.
 * Supports: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, DD Apr 2026, etc.
 */
function parseIndonesianDate(dateStr: string): Date | null {
  const cleaned = dateStr.trim();

  // Map Indonesian month abbreviations to month indices
  const monthMap: Record<string, number> = {
    'jan': 0, 'januari': 0,
    'feb': 1, 'februari': 1,
    'mar': 2, 'maret': 2,
    'apr': 3, 'april': 3,
    'mei': 4, 'may': 4,
    'jun': 5, 'juni': 5,
    'jul': 6, 'juli': 6,
    'agu': 7, 'agustus': 7, 'aug': 7,
    'sep': 8, 'september': 8,
    'okt': 9, 'oktober': 9, 'oct': 9,
    'nov': 10, 'november': 10,
    'des': 11, 'desember': 11, 'dec': 11,
  };

  // Try DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]);
    const month = parseInt(slashMatch[2]) - 1;
    const year = parseInt(slashMatch[3]);
    return new Date(year, month, day);
  }

  // Try "DD Mon YYYY" or "DD Month YYYY" (e.g. "05 Apr 2026")
  const textMatch = cleaned.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/i);
  if (textMatch) {
    const day = parseInt(textMatch[1]);
    const monthKey = textMatch[2].toLowerCase();
    const year = parseInt(textMatch[3]);
    const month = monthMap[monthKey];
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  // Try YYYY-MM-DD (ISO)
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }

  // Fallback: try native Date parsing
  const fallback = new Date(cleaned);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

/**
 * Parse amount string: remove dots (thousand separator), handle commas as decimals.
 * e.g., "300,000" or "300.000" or "300000" → 300000
 */
function parseAmount(amountStr: string): number {
  let cleaned = amountStr.trim();
  // Remove currency symbols and whitespace
  cleaned = cleaned.replace(/[Rr][Pp]\.?\s*/g, '');
  cleaned = cleaned.replace(/\s/g, '');

  // If it has dots as thousand separators (e.g., 300.000)
  // Detect: if there are multiple dots or dot followed by 3 digits → thousand separator
  const dotCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;

  if (dotCount > 0 && commaCount === 0) {
    // Dots are thousand separators
    cleaned = cleaned.replace(/\./g, '');
  } else if (commaCount > 0 && dotCount === 0) {
    // Commas might be thousand separators or decimal
    // If comma is followed by exactly 3 digits at end → thousand separator
    if (/,\d{3}($|\D)/.test(cleaned)) {
      cleaned = cleaned.replace(/,/g, '');
    } else {
      cleaned = cleaned.replace(/,/g, '.');
    }
  } else if (dotCount > 0 && commaCount > 0) {
    // Mixed: assume last separator is decimal
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Comma is decimal: 1.000,50
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Dot is decimal: 1,000.50
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.abs(num);
}

/**
 * Parse CSV content string into rows.
 * Handles quoted fields and various line endings.
 */
function parseCsvContent(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  return lines.map(line => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === ';') && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    
    return fields;
  });
}

/**
 * Try to detect which column index maps to which field.
 * Based on the screenshot columns: Tanggal, Jenis Transaksi, Kategori, Deskripsi/Keterangan, Jumlah (Rp), Dompet
 */
function detectColumnMapping(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {
    tanggal: -1,
    jenisTransaksi: -1,
    kategori: -1,
    deskripsi: -1,
    jumlah: -1,
    dompet: -1,
  };

  const normalized = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  normalized.forEach((header, index) => {
    if (header.includes('tanggal') || header.includes('date') || header.includes('tgl')) {
      mapping.tanggal = index;
    } else if (header.includes('jenis') || header.includes('tipe') || header.includes('type') || header.includes('transaksi')) {
      mapping.jenisTransaksi = index;
    } else if (header.includes('kategori') || header.includes('category')) {
      mapping.kategori = index;
    } else if (header.includes('deskripsi') || header.includes('keterangan') || header.includes('description') || header.includes('catatan') || header.includes('note')) {
      mapping.deskripsi = index;
    } else if (header.includes('jumlah') || header.includes('amount') || header.includes('nominal') || header.includes('rp')) {
      mapping.jumlah = index;
    } else if (header.includes('dompet') || header.includes('wallet') || header.includes('akun') || header.includes('account')) {
      mapping.dompet = index;
    }
  });

  return mapping;
}

/**
 * Main CSV parse function
 */
export function parseCsvFile(content: string): CsvParseResult {
  const errors: string[] = [];
  const rows = parseCsvContent(content);

  if (rows.length < 2) {
    return { success: false, data: [], errors: ['File CSV kosong atau hanya berisi header'], totalRows: 0 };
  }

  const headers = rows[0];
  const columnMapping = detectColumnMapping(headers);

  // Check required columns
  if (columnMapping.tanggal === -1) errors.push('Kolom "Tanggal" tidak ditemukan');
  if (columnMapping.jumlah === -1) errors.push('Kolom "Jumlah" tidak ditemukan');
  if (columnMapping.deskripsi === -1) errors.push('Kolom "Deskripsi/Keterangan" tidak ditemukan');

  if (errors.length > 0) {
    return { success: false, data: [], errors, totalRows: rows.length - 1 };
  }

  const dataRows = rows.slice(1);
  const parsed: ParsedTransaction[] = [];

  dataRows.forEach((row, index) => {
    const rowNum = index + 2; // 1-indexed, skip header

    // Skip empty rows
    if (row.every(cell => cell.trim() === '')) return;

    const tanggal = row[columnMapping.tanggal] || '';
    const jenisTransaksi = columnMapping.jenisTransaksi !== -1 ? (row[columnMapping.jenisTransaksi] || '') : '';
    const kategori = columnMapping.kategori !== -1 ? (row[columnMapping.kategori] || '') : '';
    const deskripsi = row[columnMapping.deskripsi] || '';
    const jumlahStr = row[columnMapping.jumlah] || '0';
    const dompet = columnMapping.dompet !== -1 ? (row[columnMapping.dompet] || '').trim() : '';

    // Parse date
    const date = parseIndonesianDate(tanggal);
    if (!date) {
      parsed.push({
        type: 'expense',
        amount: 0,
        description: deskripsi,
        categoryName: kategori,
        walletName: dompet,
        date: new Date(),
        rawRow: { tanggal, jenisTransaksi, kategori, deskripsi, jumlah: 0, dompet },
        error: `Baris ${rowNum}: Format tanggal "${tanggal}" tidak dikenali`,
      });
      return;
    }

    // Parse type
    const typeLower = jenisTransaksi.toLowerCase().trim();
    let type: 'income' | 'expense' = 'expense';
    if (typeLower.includes('pemasukan') || typeLower.includes('masuk') || typeLower.includes('income')) {
      type = 'income';
    }

    // Parse amount
    const amount = parseAmount(jumlahStr);
    if (amount <= 0) {
      parsed.push({
        type,
        amount: 0,
        description: deskripsi,
        categoryName: kategori,
        walletName: dompet,
        date,
        rawRow: { tanggal, jenisTransaksi, kategori, deskripsi, jumlah: 0, dompet },
        error: `Baris ${rowNum}: Jumlah "${jumlahStr}" tidak valid`,
      });
      return;
    }

    parsed.push({
      type,
      amount,
      description: deskripsi,
      categoryName: kategori,
      walletName: dompet,
      date,
      rawRow: { tanggal, jenisTransaksi, kategori, deskripsi, jumlah: amount, dompet },
    });
  });

  return {
    success: true,
    data: parsed,
    errors,
    totalRows: dataRows.length,
  };
}

/**
 * Match parsed category names with existing categories (case-insensitive).
 * Returns a map of unique CSV category names to matched category IDs.
 */
export function matchCategories(
  parsedData: ParsedTransaction[],
  existingCategories: Category[]
): Map<string, string | null> {
  const uniqueNames = [...new Set(parsedData.map(p => p.categoryName).filter(Boolean))];
  const result = new Map<string, string | null>();

  uniqueNames.forEach(name => {
    const match = existingCategories.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    );
    result.set(name, match ? match.id : null);
  });

  return result;
}

/**
 * Returns true if the parsed CSV has a Dompet column (at least one row has a wallet name).
 */
export function hasCsvWalletColumn(parsedData: ParsedTransaction[]): boolean {
  return parsedData.some(p => p.walletName && p.walletName.trim() !== '');
}

/**
 * Match parsed wallet names with existing wallets (case-insensitive).
 * Returns a map of unique CSV wallet names to matched wallet IDs (null if no match).
 */
export function matchWallets(
  parsedData: ParsedTransaction[],
  existingWallets: Wallet[]
): Map<string, string | null> {
  const uniqueNames = [...new Set(parsedData.map(p => p.walletName).filter(Boolean))];
  const result = new Map<string, string | null>();

  uniqueNames.forEach(name => {
    const match = existingWallets.find(
      w => w.name.toLowerCase() === name.toLowerCase()
    );
    result.set(name, match ? match.id : null);
  });

  return result;
}
