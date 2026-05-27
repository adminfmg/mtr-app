import Link from 'next/link';
import { getIbAffiliatesAdminPaginated } from '@/lib/admin/queries';
import { getAdminUser } from '@/lib/admin/auth';
import { IbAffiliatesTable } from './IbAffiliatesTable';
import { IbAffiliatesPagination } from './IbAffiliatesPagination';

export const dynamic = 'force-dynamic';

export default async function IbAffiliatesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string }>;
}) {
  const params = await searchParams;
  await getAdminUser();

  const perPage = parseInt(params.per_page || '20', 10);
  const page = Math.max(1, parseInt(params.page || '1', 10));

  const { ibAffiliates, total } = await getIbAffiliatesAdminPaginated(page, perPage);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const showingTo = Math.min(currentPage * perPage, total);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">IB Affiliates</h1>
          <p className="text-sm mt-1" style={{ color: '#7A8FA6' }}>{total} programs found.</p>
        </div>
        <Link href="/admin/ib-affiliates/new" className="px-4 py-2 rounded font-medium" style={{ background: '#00A86B', color: '#fff' }}>
          + Add IB Program
        </Link>
      </div>

      <IbAffiliatesTable affiliates={ibAffiliates} startNumber={showingFrom} />
      <IbAffiliatesPagination currentPage={currentPage} totalPages={totalPages} perPage={perPage} total={total} showingFrom={showingFrom} showingTo={showingTo} />
    </div>
  );
}