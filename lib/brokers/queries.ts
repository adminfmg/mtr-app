import { createClient } from '@/lib/shared/supabase/server';
import { Broker } from '@/types/broker';

export async function getBrokers(): Promise<Broker[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('score', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return [];
  }

  return data as Broker[];
}