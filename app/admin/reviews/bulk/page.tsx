import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import { BulkReviewForm } from './BulkReviewForm';

export const dynamic = 'force-dynamic';

export default async function BulkReviewPage() {
  await requireAdmin();

  const supabase = createClient();
  const { data: brokers } = await supabase
    .from('brokers')
    .select('uuid, name, slug, rank')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('name', { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bulk Add Reviews</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA6' }}>
          Generate multiple reviews at once with random guest names. Auto-approved on submit.
        </p>
      </div>

      <BulkReviewForm brokers={brokers || []} />
    </div>
  );
}