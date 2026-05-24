import Link from 'next/link';
import { getBrokersAdminPaginated } from '@/lib/admin/queries';
import { getAdminUser } from '@/lib/admin/auth';
import { BrokersTable } from './BrokersTable';
import { BrokersPagination } from './BrokersPagination';

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  per_page?: string;
}

const ALLOWED_PER_PAGE = [20, 50, 100, 500];

export default async function BrokersListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getAdminUser();

  const perPageRaw = parseInt(params.per_page || '20', 10);
  const perPage = ALLOWED_PER_PAGE.includes(perPageRaw) ? perPageRaw : 20;
  const pageRaw = parseInt(params.page || '1', 10);
  const page = pageRaw > 0 ? pageRaw : 1;

  const { brokers, total } = await getBrokersAdminPaginated(page, perPage);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const showingTo = Math.min(currentPage * perPage, total);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Brokers</h1>
          <p className="text-sm mt-1" style={{ color: '#7A8FA6' }}>
            {total} brokers total (including soft-deleted).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session?.role === 'owner' && (
            <Link
              href="/admin/brokers/import"
              className="px-4 py-2 rounded font-medium"
              style={{
                background: 'transparent',
                color: '#E8EDF4',
                border: '1px solid #1A2E45',
              }}
            >
              ⬆ Import CSV
            </Link>
          )}
          <Link
            href="/admin/brokers/new"
            className="px-4 py-2 rounded font-medium"
            style={{ background: '#00A86B', color: '#fff' }}
          >
            + Add Broker
          </Link>
        </div>
      </div>

      <BrokersTable brokers={brokers} startNumber={showingFrom} />

      <BrokersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        total={total}
        showingFrom={showingFrom}
        showingTo={showingTo}
      />
    </div>
  );
}