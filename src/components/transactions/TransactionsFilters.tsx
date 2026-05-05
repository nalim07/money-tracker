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
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-green-100 dark:border-gray-700">
      <CardContent className="p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
            <Label htmlFor="search" className="text-sm">Cari</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 sm:h-10"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Tipe</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Dompet</Label>
            <Select value={filterWallet} onValueChange={setFilterWallet}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Dompet</SelectItem>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Kategori</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Dari</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 sm:h-10"
            />
          </div>

          <div>
            <Label className="text-sm">Sampai</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 sm:h-10"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-3 sm:mt-4">
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="flex items-center gap-2 h-9 sm:h-10 text-sm"
          >
            <FilterIcon className="w-4 h-4" />
            Reset Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
