import { supabase } from '../supabaseClient';

// Service layer for all Supabase data fetching
// Centralised helpers make it easy to switch to realtime or add caching later.

export const fetchFeatures = async () => {
  const { data, error } = await supabase.from('features').select('*');
  if (error) throw error;
  return data;
};

export const fetchMarketItems = async () => {
  const { data, error } = await supabase.from('market_items').select('*');
  if (error) throw error;
  return data;
};

export const fetchUserLands = async (userId) => {
  const { data, error } = await supabase
    .from('lands')
    .select('*')
    .eq('owner_id', userId);
  if (error) throw error;
  return data;
};

export const fetchUserTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchKYCStatus = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data?.kyc_status;
};

// Realtime subscription helpers – used by dashboards
export const subscribeToTable = (table, userId, callback) => {
  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: `owner_id=eq.${userId}` },
      callback
    )
    .subscribe();
  return channel;
};
