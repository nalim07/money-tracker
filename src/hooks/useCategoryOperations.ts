
import { useState } from 'react';
import { Category } from '../types/finance';
import { categoryService } from '../services/categoryService';
import { useFinanceToast } from './useFinanceToast';
import { transformCategoryData } from '../utils/financeUtils';

export const useCategoryOperations = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const toast = useFinanceToast();

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const data = await categoryService.create(category);
      const newCategory = transformCategoryData(data);
      setCategories(prev => [...prev, newCategory]);
      toast.showCategoryAdded();
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      toast.showCategoryError();
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await categoryService.update(id, updates);
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, ...updates } : c
      ));
      toast.showCategoryUpdated();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.showCategoryUpdateError();
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.showCategoryDeleted();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.showCategoryDeleteError();
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesResult = await categoryService.fetchAll();
      setCategories(categoriesResult.map(transformCategoryData));
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  };

  return {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loadCategories,
  };
};
