import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IconSelector } from '@/components/IconSelector';
import { CategoryIcon } from '@/components/CategoryIcon';
import EditCategoryForm from '@/components/EditCategoryForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Category } from '@/types/finance';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const colorOptions = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
];

type FilterType = 'all' | 'income' | 'expense';

const CategoryManager: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useFinance();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense' | 'both',
    color: '#F59E0B',
    icon: '🏷️',
  });

  const filteredCategories = categories.filter(cat => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'income') return cat.type === 'income' || cat.type === 'both';
    if (activeFilter === 'expense') return cat.type === 'expense' || cat.type === 'both';
    return true;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Pemasukan';
      case 'expense': return 'Pengeluaran';
      case 'both': return 'Keduanya';
      default: return type;
    }
  };

  const isDuplicateCategory = (name: string, excludeId?: string): boolean => {
    const normalizedName = name.trim().toLowerCase();
    return categories.some(
      (cat) => cat.name.trim().toLowerCase() === normalizedName && cat.id !== excludeId
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama kategori tidak boleh kosong');
      return;
    }

    if (isDuplicateCategory(form.name)) {
      toast.error('Kategori dengan nama ini sudah ada');
      return;
    }

    addCategory(form);
    setForm({ name: '', type: 'expense', color: '#F59E0B', icon: '🏷️' });
    setShowDialog(false);
    toast.success('Kategori berhasil ditambahkan');
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Kelola Kategori
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-finance-primary hover:bg-finance-secondary">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category-name">Nama Kategori</Label>
                <Input
                  id="category-name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Kesehatan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category-type">Tipe Kategori</Label>
                <Select 
                  value={form.type} 
                  onValueChange={(value: 'income' | 'expense' | 'both') => 
                    setForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                    <SelectItem value="income">Pemasukan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <IconSelector
                selectedIcon={form.icon}
                onIconSelect={(icon) => setForm(prev => ({ ...prev, icon }))}
              />

              <div>
                <Label>Warna</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded-lg border-2 ${
                        form.color === color ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setForm(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-finance-primary hover:bg-finance-secondary">
                  Simpan
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeFilter === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveFilter('income')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeFilter === 'income'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setActiveFilter('expense')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeFilter === 'expense'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Pengeluaran
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <CategoryIcon icon={category.icon} color={category.color} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getTypeLabel(category.type)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingCategory(category)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      {editingCategory && (
        <EditCategoryForm
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title={`Hapus kategori "${deletingCategory?.name}"?`}
        description="Tindakan ini tidak dapat dibatalkan. Kategori yang sudah dihapus tidak bisa dikembalikan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={async () => {
          if (!deletingCategory) return;
          try {
            await deleteCategory(deletingCategory.id);
            toast.success(`Kategori "${deletingCategory.name}" berhasil dihapus`);
          } catch (e) {
            toast.error('Gagal menghapus kategori. Mungkin kategori ini sedang digunakan.');
          } finally {
            setDeletingCategory(null);
          }
        }}
      />
    </Card>
  );
};

export default CategoryManager;
