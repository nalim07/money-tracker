
import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFinance } from '../contexts/FinanceContext';
import { parseCsvFile, matchCategories, matchWallets, hasCsvWalletColumn, ParsedTransaction } from '../utils/csvImport';
import { downloadExampleCSV } from '../utils/csvExport';
import { toast } from 'sonner';

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = 'upload' | 'preview' | 'mapping' | 'importing' | 'done';

export default function ImportCSVDialog({ open, onOpenChange }: ImportCSVDialogProps) {
  const { wallets, categories, addTransaction, addCategory, refreshData } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>('upload');
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [categoryMapping, setCategoryMapping] = useState<Map<string, string | null>>(new Map());
  const [walletMapping, setWalletMapping] = useState<Map<string, string | null>>(new Map());
  const [csvHasWallet, setCsvHasWallet] = useState(false);
  // Fallback: single wallet when CSV has no Dompet column
  const [fallbackWallet, setFallbackWallet] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const resetState = useCallback(() => {
    setStep('upload'); setParsedData([]); setParseErrors([]);
    setCategoryMapping(new Map()); setWalletMapping(new Map());
    setCsvHasWallet(false); setFallbackWallet('');
    setImportProgress(0); setImportedCount(0); setFailedCount(0);
    setIsDragging(false); setFileName('');
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) resetState();
    onOpenChange(isOpen);
  }, [onOpenChange, resetState]);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      toast.error('Format file tidak didukung. Gunakan file .csv'); return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCsvFile(content);
      if (!result.success) { setParseErrors(result.errors); toast.error('Gagal membaca file CSV'); return; }
      const validData = result.data.filter(d => !d.error);
      setParsedData(result.data);
      setParseErrors(result.data.filter(d => d.error).map(d => d.error!));
      setCategoryMapping(matchCategories(validData, categories));
      const hasWallet = hasCsvWalletColumn(validData);
      setCsvHasWallet(hasWallet);
      if (hasWallet) setWalletMapping(matchWallets(validData, wallets));
      setStep('preview');
    };
    reader.readAsText(file);
  }, [categories, wallets]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0]; if (file) processFile(file);
  }, [processFile]);

  const validData = parsedData.filter(d => !d.error);
  const unmatchedCategories = [...categoryMapping.entries()].filter(([, id]) => id === null);
  const unmatchedWallets = [...walletMapping.entries()].filter(([, id]) => id === null);

  const handleStartImport = async () => {
    if (!csvHasWallet && !fallbackWallet) {
      toast.error('Pilih dompet tujuan terlebih dahulu'); return;
    }
    if (csvHasWallet && unmatchedWallets.length > 0) {
      const unresolved = unmatchedWallets.filter(([, id]) => id === null);
      if (unresolved.length > 0) {
        toast.error(`Dompet belum dipetakan: ${unresolved.map(([n]) => n).join(', ')}`); return;
      }
    }

    setStep('importing');
    let imported = 0; let failed = 0;

    // Create missing categories
    for (const [catName, catId] of categoryMapping.entries()) {
      if (!catId && catName) {
        try {
          const txs = validData.filter(t => t.categoryName === catName);
          const hasIncome = txs.some(t => t.type === 'income');
          const hasExpense = txs.some(t => t.type === 'expense');
          let catType: 'income' | 'expense' | 'both' = 'expense';
          if (hasIncome && hasExpense) catType = 'both';
          else if (hasIncome) catType = 'income';
          await addCategory({ name: catName, type: catType, color: generateColor(catName), icon: 'tag' });
        } catch { console.error(`Failed to create category: ${catName}`); }
      }
    }

    await refreshData();
    await new Promise(r => setTimeout(r, 500));

    // Get latest walletMapping (in case user updated it)
    const currentWalletMap = walletMapping;

    for (let i = 0; i < validData.length; i++) {
      const item = validData[i];
      // Resolve wallet: from per-row mapping, or fallback
      let resolvedWallet = fallbackWallet;
      if (csvHasWallet && item.walletName) {
        resolvedWallet = currentWalletMap.get(item.walletName) || fallbackWallet;
      }

      if (!resolvedWallet) { failed++; }
      else {
        try {
          await addTransaction({
            type: item.type, amount: item.amount,
            description: item.description, category: item.categoryName,
            wallet: resolvedWallet, date: item.date,
          });
          imported++;
        } catch { failed++; }
      }

      setImportProgress(Math.round(((i + 1) / validData.length) * 100));
      setImportedCount(imported); setFailedCount(failed);
      if (i % 5 === 0) await new Promise(r => setTimeout(r, 100));
    }
    setStep('done');
  };

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const stepOrder: ImportStep[] = ['upload', 'preview', 'mapping', 'importing', 'done'];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Import CSV
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload file CSV dari spreadsheet Anda'}
            {step === 'preview' && 'Preview data yang akan diimport'}
            {step === 'mapping' && 'Sesuaikan dompet dan kategori'}
            {step === 'importing' && 'Mengimport data...'}
            {step === 'done' && 'Import selesai!'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 px-1">
          {(['upload', 'preview', 'mapping', 'importing'] as ImportStep[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${step === s ? 'text-emerald-500' : stepOrder.indexOf(step) > i ? 'text-emerald-400/60' : 'text-muted-foreground/40'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === s ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : stepOrder.indexOf(step) > i ? 'border-emerald-400/40 text-emerald-400/60' : 'border-muted-foreground/20 text-muted-foreground/40'}`}>
                  {stepOrder.indexOf(step) > i ? '✓' : i + 1}
                </div>
                <span className="hidden sm:inline">{s === 'upload' ? 'Upload' : s === 'preview' ? 'Preview' : s === 'mapping' ? 'Mapping' : 'Import'}</span>
              </div>
              {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground/30 shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' : 'border-muted-foreground/20 hover:border-emerald-500/50 hover:bg-emerald-500/5'}`}
              >
                <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileSelect} className="hidden" />
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragging ? 'bg-emerald-500/20 scale-110' : 'bg-muted/50'}`}>
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">{isDragging ? 'Lepas file di sini...' : 'Drag & drop file CSV di sini'}</p>
                    <p className="text-xs text-muted-foreground">atau klik untuk memilih file</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">.csv</Badge>
                </div>
              </div>
              {/* Download example */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Belum tahu formatnya?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 px-2"
                  onClick={(e) => { e.stopPropagation(); downloadExampleCSV(); }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Contoh CSV
                </Button>
              </div>
            </>
          )}

          {/* STEP 2: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">{validData.length} data valid • {parseErrors.length} error {csvHasWallet && '• Kolom Dompet terdeteksi ✓'}</p>
                </div>
              </div>

              {parseErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-500">{parseErrors.length} baris bermasalah (akan dilewati)</span>
                  </div>
                  <ScrollArea className="max-h-20">
                    {parseErrors.map((err, i) => <p key={i} className="text-xs text-red-400 mb-0.5">{err}</p>)}
                  </ScrollArea>
                </div>
              )}

              <ScrollArea className="h-[280px] rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Tanggal</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Tipe</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Kategori</th>
                      {csvHasWallet && <th className="text-left p-2 text-xs font-medium text-muted-foreground">Dompet</th>}
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Deskripsi</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validData.slice(0, 50).map((item, i) => (
                      <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                        <td className="p-2 text-xs whitespace-nowrap">{item.date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-2">
                          <Badge variant="secondary" className={`text-xs ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {item.type === 'income' ? 'Masuk' : 'Keluar'}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs">{item.categoryName || '-'}</td>
                        {csvHasWallet && <td className="p-2 text-xs">{item.walletName || '-'}</td>}
                        <td className="p-2 text-xs max-w-[150px] truncate">{item.description}</td>
                        <td className="p-2 text-xs text-right font-mono">{fmt(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validData.length > 50 && <p className="text-xs text-center text-muted-foreground py-2">... dan {validData.length - 50} data lainnya</p>}
              </ScrollArea>

              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={resetState}>Ganti File</Button>
                <Button onClick={() => setStep('mapping')} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={validData.length === 0}>
                  Lanjut <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4 pb-2">
              {/* Wallet mapping */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Pemetaan Dompet {!csvHasWallet && <span className="text-red-500">*</span>}
                </label>
                {csvHasWallet ? (
                  <>
                    <p className="text-xs text-muted-foreground">Cocokkan nama dompet dari CSV ke dompet di aplikasi. Dompet yang tidak cocok, pilih manual.</p>
                    <div className="h-[160px] overflow-y-auto rounded-lg border border-border p-3 scrollbar-thin">
                      <div className="space-y-2">
                        {[...walletMapping.entries()].map(([csvName, matchedId]) => {
                          const matchedWallet = wallets.find(w => w.id === matchedId);
                          return (
                            <div key={csvName} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                              <span className="text-sm flex-1 min-w-0 truncate font-medium">{csvName}</span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                              {matchedWallet ? (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: matchedWallet.color }} />
                                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />{matchedWallet.name}
                                  </Badge>
                                </div>
                              ) : (
                                <Select
                                  value={walletMapping.get(csvName) || ''}
                                  onValueChange={(val) => setWalletMapping(prev => new Map(prev).set(csvName, val))}
                                >
                                  <SelectTrigger className="w-40 h-7 text-xs">
                                    <SelectValue placeholder="Pilih dompet..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {wallets.map(w => (
                                      <SelectItem key={w.id} value={w.id}>
                                        <div className="flex items-center gap-2">
                                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                                          {w.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Kolom Dompet tidak ditemukan di CSV. Pilih satu dompet untuk semua transaksi.</p>
                    <Select value={fallbackWallet} onValueChange={setFallbackWallet}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih dompet..." />
                      </SelectTrigger>
                      <SelectContent>
                        {wallets.map(w => (
                          <SelectItem key={w.id} value={w.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: w.color }} />
                              {w.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>

              {/* Category mapping */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pemetaan Kategori</label>
                <p className="text-xs text-muted-foreground">Kategori baru akan dibuat otomatis jika belum ada.</p>
                <div className="h-[160px] overflow-y-auto rounded-lg border border-border p-3">
                  <div className="space-y-2">
                    {[...categoryMapping.entries()].map(([csvName, matchedId]) => {
                      const matchedCat = categories.find(c => c.id === matchedId);
                      return (
                        <div key={csvName} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                          <span className="text-sm flex-1 min-w-0 truncate">{csvName}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          {matchedCat ? (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />{matchedCat.name}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs shrink-0">+ Buat baru</Badge>
                          )}
                        </div>
                      );
                    })}
                    {categoryMapping.size === 0 && <p className="text-sm text-muted-foreground text-center py-4">Tidak ada kategori terdeteksi</p>}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 rounded-lg bg-muted/30 grid grid-cols-2 gap-1.5 text-xs">
                <span className="text-muted-foreground">Total transaksi:</span>
                <span className="font-medium">{validData.length}</span>
                <span className="text-muted-foreground">Pemasukan:</span>
                <span className="font-medium text-emerald-500">{validData.filter(d => d.type === 'income').length} ({fmt(validData.filter(d => d.type === 'income').reduce((s, d) => s + d.amount, 0))})</span>
                <span className="text-muted-foreground">Pengeluaran:</span>
                <span className="font-medium text-red-500">{validData.filter(d => d.type === 'expense').length} ({fmt(validData.filter(d => d.type === 'expense').reduce((s, d) => s + d.amount, 0))})</span>
                <span className="text-muted-foreground">Kategori baru:</span>
                <span className="font-medium text-amber-500">{unmatchedCategories.length}</span>
              </div>

              <div className="flex justify-between gap-2 pt-2 pb-1">
                <Button variant="outline" onClick={() => setStep('preview')}>Kembali</Button>
                <Button
                  onClick={handleStartImport}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={csvHasWallet ? unmatchedWallets.some(([, id]) => !id) : !fallbackWallet}
                >
                  Import {validData.length} Transaksi
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Importing */}
          {step === 'importing' && (
            <div className="space-y-6 py-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Mengimport data...</p>
                <p className="text-sm text-muted-foreground mt-1">{importedCount + failedCount} dari {validData.length} transaksi</p>
              </div>
              <div className="w-full space-y-2">
                <Progress value={importProgress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{importProgress}%</span>
                  <div className="flex gap-3">
                    <span className="text-emerald-500">✓ {importedCount} berhasil</span>
                    {failedCount > 0 && <span className="text-red-500">✕ {failedCount} gagal</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Done */}
          {step === 'done' && (
            <div className="space-y-6 py-8 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${failedCount === 0 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                {failedCount === 0 ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <AlertTriangle className="w-10 h-10 text-amber-500" />}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{failedCount === 0 ? 'Import Berhasil!' : 'Import Selesai dengan Peringatan'}</p>
                <p className="text-sm text-muted-foreground mt-1">{importedCount} berhasil{failedCount > 0 && `, ${failedCount} gagal`}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                  <p className="text-2xl font-bold text-emerald-500">{importedCount}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Berhasil</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 text-center">
                  <p className="text-2xl font-bold text-red-500">{failedCount}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Gagal</p>
                </div>
              </div>
              <Button onClick={() => handleOpenChange(false)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Selesai</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateColor(name: string): string {
  const colors = ['#10B981','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#EC4899','#06B6D4','#84CC16','#F97316','#14B8A6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
