import { createClient } from '@/lib/shared/supabase/server';
import { IbAffiliate } from '@/types/ibAffiliate';

export async function getIbAffiliates(): Promise<IbAffiliate[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('ib_affiliates')
    .select('*, brokers(logo_url, color, domain)')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('rank', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('IB Affiliates fetch error:', error.message);
    return [];
  }

  return data;
}