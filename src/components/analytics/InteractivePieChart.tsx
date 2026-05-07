
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction, Category, Wallet } from '../../types/finance';

interface InteractivePieChartProps {
  title: string;
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  type: 'income' | 'expense';
  formatCurrency: (amount: number) => string;
}

type ViewMode = 'category' | 'wallet';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const InteractivePieChart: React.FC<InteractivePieChartProps> = ({
  title,
  transactions,
  categories,
  wallets,
  type,
  formatCurrency
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [showTable, setShowTable] = useState(false);

  const chartData = useMemo(() => {
    if (viewMode === 'category') {
      return categories
        .filter(cat => cat.type === type || cat.type === 'both')
        .map(category => {
          const total = transactions
            .filter(t => t.type === type && t.category === category.id)
            .reduce((sum, t) => sum + t.amount, 0);
          return {
            name: category.name,
            value: total,
            color: category.color,
          };
        })
        .filter(item => item.value > 0);
    } else {
      return wallets
        .map(wallet => {
          const total = transactions
            .filter(t => t.type === type && t.wallet === wallet.id)
            .reduce((sum, t) => sum + t.amount, 0);
          return {
            name: wallet.name,
            value: total,
            color: wallet.color,
          };
        })
        .filter(item => item.value > 0);
    }
  }, [viewMode, transactions, categories, wallets, type]);

  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if slice is too small
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const handleChartClick = () => {
    setShowTable(!showTable);
  };

  return (
    <Card className="bg-card backdrop-blur-sm border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-full sm:w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Kategori</SelectItem>
              <SelectItem value="wallet">Dompet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <div
              className="cursor-pointer"
              onClick={handleChartClick}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Jumlah']}
                    labelFormatter={(label) => `${viewMode === 'category' ? 'Kategori' : 'Dompet'}: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Klik grafik untuk {showTable ? 'menyembunyikan' : 'menampilkan'} detail
              </p>
            </div>

            {showTable && (
              <div className="animate-fade-in">
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">
                          {viewMode === 'category' ? 'Kategori' : 'Dompet'}
                        </TableHead>
                        <TableHead className="font-semibold text-center">%</TableHead>
                        <TableHead className="font-semibold text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chartData
                        .sort((a, b) => b.value - a.value)
                        .map((item, index) => {
                          const percentage = ((item.value / totalAmount) * 100).toFixed(1);
                          return (
                            <TableRow key={index} className="hover:bg-muted/30">
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-4 h-4 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span>{item.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-mono">
                                {percentage}%
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold">
                                {formatCurrency(item.value)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      <TableRow className="bg-muted/50 border-t-2 border-border">
                        <TableCell className="font-bold">Total</TableCell>
                        <TableCell className="text-center font-bold">100%</TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {formatCurrency(totalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">Belum ada data</p>
              <p className="text-sm">
                Belum ada data {type === 'income' ? 'pemasukan' : 'pengeluaran'} bulan ini
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractivePieChart;
