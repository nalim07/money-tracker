
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconSelector } from './IconSelector';
import { Category } from '../types/finance';

interface EditCategoryFormProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditCategoryForm: React.FC<EditCategoryFormProps> = ({
  category,
  open,
  onOpenChange,
}) => {
  const { updateCategory } = useFinance();
  
  const [formData, setFormData] = useState({
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
  });

  const colorOptions = [
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    updateCategory(category.id, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category-name">Nama Kategori</Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Kesehatan"
              required
            />
          </div>

          <div>
            <Label htmlFor="category-type">Tipe Kategori</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'income' | 'expense' | 'both') => 
                setFormData(prev => ({ ...prev, type: value }))
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
            selectedIcon={formData.icon}
            onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
          />

          <div>
            <Label>Warna</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-10 h-10 rounded-lg border-2 ${
                    formData.color === color ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-finance-primary hover:bg-finance-secondary">
              Simpan Perubahan
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryForm;
