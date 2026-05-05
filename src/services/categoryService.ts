
import { supabase } from '@/integrations/supabase/client';
import { Category } from '../types/finance';

export const categoryService = {
  async fetchAll() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Category fetch error:', error);
      throw error;
    }
    
    return data;
  },

  async create(category: Omit<Category, 'id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Category>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.type) updateData.type = updates.type;
    if (updates.color) updateData.color = updates.color;
    if (updates.icon) updateData.icon = updates.icon;

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async delete(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Try deleting with user_id filter first (normal case)
    const { error, count } = await supabase
      .from('categories')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    // If no rows deleted, category might have been created without user_id (legacy data)
    // Try deleting by id only as fallback
    if (count === 0) {
      const { error: fallbackError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (fallbackError) throw fallbackError;
    }
  }
};
