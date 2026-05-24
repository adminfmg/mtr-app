import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import { ReviewsTable } from './ReviewsTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
  source?: string;
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.status || '';
  const source = params.source || '';

  const supabase = createClient();
  let query = supabase
    .from('broker_reviews')
    .select('*, brokers!inner(name, slug)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);

  const { data: reviews } = await query;

  const { count: pendingCount } = await supabase
    .from('broker_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm mt-1" style={{ color: '#7A8FA6' }}>
          {reviews?.length || 0} reviews shown
          {pendingCount ? ` • ${pendingCount} pending` : ''}
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/admin/reviews/bulk"
          className="px-4 py-2 rounded font-medium border"
          style={{ borderColor: '#00A86B', color: '#00A86B' }}
        >
          Bulk Add
        </Link>
        <Link
          href="/admin/reviews/new"
          className="px-4 py-2 rounded font-medium"
          style={{ background: '#00A86B', color: '#fff' }}
        >
          + Add Review
        </Link>
      </div>
    </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <FilterGroup
          label="Status"
          current={status}
          options={[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          paramKey="status"
          otherParam={source ? `&source=${source}` : ''}
        />
        <FilterGroup
          label="Source"
          current={source}
          options={[
            { value: '', label: 'All' },
            { value: 'visitor', label: 'Visitor' },
            { value: 'admin', label: 'Admin' },
          ]}
          paramKey="source"
          otherParam={status ? `&status=${status}` : ''}
        />
      </div>

      <ReviewsTable reviews={reviews || []} />
    </div>
  );
}

function FilterGroup({
  label,
  current,
  options,
  paramKey,
  otherParam,
}: {
  label: string;
  current: string;
  options: { value: string; label: string }[];
  paramKey: string;
  otherParam: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm" style={{ color: '#7A8FA6' }}>
        {label}:
      </span>
      <div className="flex gap-1">
        {options.map((opt) => {
          const href = `/admin/reviews?${paramKey}=${opt.value}${otherParam}`;
          const active = current === opt.value;
          return (
            <Link
              key={opt.value}
              href={href}
              className="text-xs px-3 py-1.5 rounded-full border transition"
              style={{
                background: active ? 'rgba(0,168,107,0.12)' : 'transparent',
                borderColor: active ? '#00A86B' : 'rgba(255,255,255,0.22)',
                color: active ? '#00A86B' : '#7A8FA6',
              }}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}