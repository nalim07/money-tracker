
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '../types/finance';

export const walletService = {
  async fetchAll() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Wallet fetch error:', error);
      throw error;
    }

    return data;
  },

  async create(wallet: Omit<Wallet, 'id' | 'balance'>) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Adding wallet:', wallet);
    const { data, error } = await supabase
      .from('wallets')
      .insert([{
        name: wallet.name,
        color: wallet.color,
        icon: wallet.icon,
        group: wallet.group,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Wallet insert error:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: Partial<Wallet>) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.group !== undefined) updateData.group = updates.group;

    const { error } = await supabase
      .from('wallets')
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

    // First delete all transactions for this wallet
    await supabase
      .from('transactions')
      .delete()
      .eq('wallet', id)
      .eq('user_id', user.id);

    // Then delete the wallet
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};
