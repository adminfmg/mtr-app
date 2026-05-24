import { createClient } from '@/lib/shared/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import { ReviewsTable } from './ReviewsTable';
import { ReviewsFilters } from './ReviewsFilters';
import { ReviewsPagination } from './ReviewsPagination';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
  source?: string;
  broker_uuid?: string;
  rating?: string;
  q?: string;
  page?: string;
  per_page?: string;
}

const ALLOWED_PER_PAGE = [20, 50, 100, 500];

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.status || '';
  const source = params.source || '';
  const brokerUuid = params.broker_uuid || '';
  const ratingRaw = parseInt(params.rating || '0', 10);
  const rating = [1, 2, 3, 4, 5].includes(ratingRaw) ? ratingRaw : 0;
  const searchQuery = params.q?.trim() || '';

  const perPageRaw = parseInt(params.per_page || '20', 10);
  const perPage = ALLOWED_PER_PAGE.includes(perPageRaw) ? perPageRaw : 20;
  const pageRaw = parseInt(params.page || '1', 10);
  const page = pageRaw > 0 ? pageRaw : 1;

  const supabase = createClient();

  // Fetch broker list buat filter dropdown
  const { data: brokers } = await supabase
    .from('brokers')
    .select('uuid, name')
    .is('deleted_at', null)
    .eq('is_published', true)
    .order('name', { ascending: true });

  // Count total (filtered)
  let countQuery = supabase
    .from('broker_reviews')
    .select('*', { count: 'exact', head: true });

  if (status) countQuery = countQuery.eq('status', status);
  if (source) countQuery = countQuery.eq('source', source);
  if (brokerUuid) countQuery = countQuery.eq('broker_uuid', brokerUuid);
  if (rating) countQuery = countQuery.eq('rating', rating);
  if (searchQuery) {
    countQuery = countQuery.or(
      `guest_name.ilike.%${searchQuery}%,guest_email.ilike.%${searchQuery}%,review_text.ilike.%${searchQuery}%`
    );
  }

  const { count: totalCount } = await countQuery;
  const total = totalCount || 0;

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  const from = (currentPage - 1) * perPage;
  const to = from + perPage - 1;

  // Fetch paginated reviews
  let dataQuery = supabase
    .from('broker_reviews')
    .select('*, brokers!inner(name, slug)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) dataQuery = dataQuery.eq('status', status);
  if (source) dataQuery = dataQuery.eq('source', source);
  if (brokerUuid) dataQuery = dataQuery.eq('broker_uuid', brokerUuid);
  if (rating) dataQuery = dataQuery.eq('rating', rating);
  if (searchQuery) {
    dataQuery = dataQuery.or(
      `guest_name.ilike.%${searchQuery}%,guest_email.ilike.%${searchQuery}%,review_text.ilike.%${searchQuery}%`
    );
  }

  const { data: reviews } = await dataQuery;

  const { count: pendingCount } = await supabase
    .from('broker_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const showingFrom = total === 0 ? 0 : from + 1;
  const showingTo = Math.min(from + perPage, total);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm mt-1" style={{ color: '#7A8FA6' }}>
            {total} reviews total
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

      <ReviewsFilters
        brokers={brokers || []}
        currentStatus={status}
        currentSource={source}
        currentBrokerUuid={brokerUuid}
        currentRating={rating}
        currentSearch={searchQuery}
      />

      <ReviewsTable reviews={reviews || []} />

      <ReviewsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        total={total}
        showingFrom={showingFrom}
        showingTo={showingTo}
        currentStatus={status}
        currentSource={source}
        currentBrokerUuid={brokerUuid}
        currentRating={rating}
        currentSearch={searchQuery}
      />
    </div>
  );
}