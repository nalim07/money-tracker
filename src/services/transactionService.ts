
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '../types/finance';

export const transactionService = {
  async fetchAll() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Transaction fetch error:', error);
      throw error;
    }
    
    return data;
  },

  async create(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        wallet: transaction.wallet,
        date: `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}-${String(transaction.date.getDate()).padStart(2, '0')}`,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Transaction>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};
    
    if (updates.type) updateData.type = updates.type;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category;
    if (updates.wallet) updateData.wallet = updates.wallet;
    if (updates.date) updateData.date = `${updates.date.getFullYear()}-${String(updates.date.getMonth() + 1).padStart(2, '0')}-${String(updates.date.getDate()).padStart(2, '0')}`;

    const { error } = await supabase
      .from('transactions')
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

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};
