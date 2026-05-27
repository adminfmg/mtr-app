import { createClient } from '@/lib/shared/supabase/server';
import { Broker } from '@/types/broker';

/**
 * Ambil semua broker (termasuk soft-deleted, buat admin view).
 */
export async function getAllBrokersAdmin(): Promise<Broker[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .order('rank', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Admin fetch error:', error.message);
    return [];
  }
  return data as Broker[];
}

/**
 * Ambil broker dengan pagination (buat admin view).
 */
export async function getBrokersAdminPaginated(
  page: number,
  perPage: number
): Promise<{ brokers: Broker[]; total: number }> {
  const supabase = createClient();

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Count total
  const { count } = await supabase
    .from('brokers')
    .select('*', { count: 'exact', head: true });

  // Fetch paginated
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .order('rank', { ascending: true, nullsFirst: false })
    .range(from, to);

  if (error) {
    console.error('Admin paginated fetch error:', error.message);
    return { brokers: [], total: 0 };
  }

  return { brokers: data as Broker[], total: count || 0 };
}

export async function getBrokerByUuid(uuid: string): Promise<Broker | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('uuid', uuid)
    .maybeSingle();

  if (error) {
    console.error('Get broker error:', error.message);
    return null;
  }
  return data as Broker | null;
}

export async function getAdminStats() {
  const supabase = createClient();
  const [total, active, deleted, published, hidden] = await Promise.all([
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }),
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }).not('deleted_at', 'is', null),
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }).is('deleted_at', null).eq('is_published', true),
    supabase.from('brokers').select('uuid', { count: 'exact', head: true }).is('deleted_at', null).eq('is_published', false),
  ]);
  return {
    total: total.count || 0,
    active: active.count || 0,
    deleted: deleted.count || 0,
    published: published.count || 0,
    hidden: hidden.count || 0,
  };
}

// --- TAMBAHAN UNTUK IB AFFILIATES ---

export async function getIbAffiliatesAdminPaginated(
  page: number,
  perPage: number
) {
  const supabase = createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { count } = await supabase
    .from('ib_affiliates')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('ib_affiliates')
    .select('*, brokers(name, is_published)') // Tarik nama broker buat ditampilin di tabel
    .order('rank', { ascending: true, nullsFirst: false })
    .range(from, to);

  if (error) {
    console.error('IB Affiliates paginated fetch error:', error.message);
    return { ibAffiliates: [], total: 0 };
  }

  return { ibAffiliates: data || [], total: count || 0 };
}

export async function getIbAffiliateByUuid(uuid: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ib_affiliates')
    .select('*')
    .eq('uuid', uuid)
    .maybeSingle();

  if (error) console.error('Get IB Affiliate error:', error.message);
  return data;
}

export async function getBrokersForIbDropdown() {
  const supabase = createClient();
  // KHUSUS DROPDOWN: Ambil semua yang belum dihapus (termasuk yang is_published: false)
  const { data, error } = await supabase
    .from('brokers')
    .select('uuid, name, is_published')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) console.error('Fetch brokers for dropdown error:', error.message);
  return data || [];
}