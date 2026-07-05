import React from 'react';
import { Search, Filter as FilterIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Category, Wallet } from '../../types/finance';

interface TransactionsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  filterWallet: string;
  setFilterWallet: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  clearFilters: () => void;
  wallets: Wallet[];
  categories: Category[];
}

export default function TransactionsFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterWallet,
  setFilterWallet,
  filterCategory,
  setFilterCategory,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  clearFilters,
  wallets,
  categories
}: TransactionsFiltersProps) {
  return (
    <Card className="bg-card border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <CardContent className="p-0 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Cari */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-3 xl:col-span-1">
            <Label htmlFor="search" className="text-xs font-bold text-muted-foreground mb-1 block">Cari</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-xl border-gray-200 focus-visible:ring-[#FFB400]"
              />
            </div>
          </div>
          
          {/* Tipe */}
          <div>
            <Label className="text-xs font-bold text-muted-foreground mb-1 block">Tipe</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-10 rounded-xl border-gray-200 focus:ring-[#FFB400] font-semibold text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs sm:text-sm font-semibold">Semua Tipe</SelectItem>
                <SelectItem value="income" className="text-xs sm:text-sm font-semibold text-[#2ECC71]">Pemasukan</SelectItem>
                <SelectItem value="expense" className="text-xs sm:text-sm font-semibold text-[#FF5C5C]">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dompet */}
          <div>
            <Label className="text-xs font-bold text-muted-foreground mb-1 block">Dompet</Label>
            <Select value={filterWallet} onValueChange={setFilterWallet}>
              <SelectTrigger className="h-10 rounded-xl border-gray-200 focus:ring-[#FFB400] font-semibold text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs sm:text-sm font-semibold">Semua Dompet</SelectItem>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id} className="text-xs sm:text-sm font-semibold">
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kategori */}
          <div>
            <Label className="text-xs font-bold text-muted-foreground mb-1 block">Kategori</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-10 rounded-xl border-gray-200 focus:ring-[#FFB400] font-semibold text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs sm:text-sm font-semibold">Semua Kategori</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name} className="text-xs sm:text-sm font-semibold">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dari Tanggal */}
          <div>
            <Label className="text-xs font-bold text-muted-foreground mb-1 block">Dari</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 rounded-xl border-gray-200 focus-visible:ring-[#FFB400]"
            />
          </div>

          {/* Sampai Tanggal */}
          <div>
            <Label className="text-xs font-bold text-muted-foreground mb-1 block">Sampai</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 rounded-xl border-gray-200 focus-visible:ring-[#FFB400]"
            />
          </div>
        </div>
        
        {/* Reset Button */}
        <div className="flex justify-end pt-1">
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="flex items-center gap-2 h-9 rounded-xl text-xs font-bold border-gray-200 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
