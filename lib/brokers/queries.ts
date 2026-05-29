import { createClient } from '@/lib/shared/supabase/server';
import { Broker } from '@/types/broker';
import { client } from '@/sanity/client';

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

export async function getBrokerBySlug(slug: string): Promise<Broker | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .eq('is_published', true)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Supabase error (getBrokerBySlug):', error.message);
    }
    return null;
  }
  
  return data as Broker;
}

export async function getBrokerReview(uuid: string) {
  try {
    const query = `*[_type == "brokerReview" && brokerUuid == $uuid && status == "published"][0]`;
    const review = await client.fetch(
      query,
      { uuid },
      { cache: 'no-store' }
    );
    return review;
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return null;
  }
}

/**
 * Lightweight query untuk sitemap.
 * Cuma return slug + updated_at, ga full broker object.
 */
export async function getPublishedBrokerSlugs(): Promise<
  { slug: string; updated_at: string | null }[]
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('brokers')
    .select('slug, updated_at')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Supabase error (getPublishedBrokerSlugs):', error.message);
    return [];
  }

  return data ?? [];
}
