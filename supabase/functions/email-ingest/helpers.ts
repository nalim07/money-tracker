export type TransactionType = "income" | "expense";

export const ALLOWED_SOURCES = new Map([
  ["jago", "Jago"],
  ["bca", "BCA"],
  ["line bank", "LINE Bank"],
  ["hana bank", "Hana Bank"],
  ["hanabank", "Hana Bank"],
  ["saqu", "Bank Saqu"],
  ["bank saqu", "Bank Saqu"],
  ["seabank", "SeaBank"],
  ["blu", "blu by BCA"],
  ["blu by bca", "blu by BCA"],
]);

export function fallbackCategoryNames(type: TransactionType): string[] {
  return type === "expense"
    ? ["Lain-lain"]
    : ["Pemasukan Lain", "Lainnya", "Lain-lain"];
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function parseIdrAmount(value: number | string | undefined): number | null {
  if (typeof value === "number") return Number.isSafeInteger(value) && value > 0 ? value : null;
  if (!value) return null;

  const match = value.match(/(?:\bIDR|\bRp)\s*([\d.,]+)/i);
  if (!match?.[1]) return null;

  const raw = match[1];
  const dot = raw.lastIndexOf(".");
  const comma = raw.lastIndexOf(",");
  let rupiah = raw;

  if (dot >= 0 && comma >= 0) {
    rupiah = comma > dot ? raw.slice(0, comma).replace(/\./g, "") : raw.slice(0, dot).replace(/,/g, "");
  } else {
    const separator = dot >= 0 ? "." : comma >= 0 ? "," : "";
    if (separator) {
      const parts = raw.split(separator);
      rupiah = parts.at(-1)?.length === 2 ? parts.slice(0, -1).join("") : parts.join("");
    }
  }

  const amount = Number.parseInt(rupiah, 10);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

export function detectType(subject = "", body = ""): TransactionType | null {
  const text = `${subject} ${body}`.toLowerCase();
  const incomeHints = ["transaksi masuk", "dana masuk", "deposit", "diterima", "incoming", "kredit"];
  const expenseHints = ["transaksi keluar", "pembayaran", "bayar", "paid", "debit", "tarik", "transfer keluar"];

  if (incomeHints.some((hint) => text.includes(hint))) return "income";
  if (expenseHints.some((hint) => text.includes(hint))) return "expense";
  return null;
}

export function toDateOnly(date: string | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export function findCanonical<T extends { name: string }>(items: T[], requested: string): T | null {
  const requestedLower = requested.trim().toLowerCase();
  const requestedNormalized = normalize(requested);

  return items.find((item) => item.name.trim().toLowerCase() === requestedLower)
    ?? items.find((item) => normalize(item.name) === requestedNormalized)
    ?? items.find((item) => normalize(item.name).includes(requestedNormalized) || requestedNormalized.includes(normalize(item.name)))
    ?? null;
}
