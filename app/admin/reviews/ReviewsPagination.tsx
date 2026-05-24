'use client';

import { useRouter } from 'next/navigation';

interface Props {
  currentPage: number;
  totalPages: number;
  perPage: number;
  total: number;
  showingFrom: number;
  showingTo: number;
  currentStatus: string;
  currentSource: string;
  currentBrokerUuid: string;
  currentRating: number;
  currentSearch: string;
}

const PER_PAGE_OPTIONS = [20, 50, 100, 500];

export function ReviewsPagination({
  currentPage,
  totalPages,
  perPage,
  total,
  showingFrom,
  showingTo,
  currentStatus,
  currentSource,
  currentBrokerUuid,
  currentRating,
  currentSearch,
}: Props) {
  const router = useRouter();

  function buildUrl(updates: Record<string, string | number>) {
    const params = new URLSearchParams();
    const merged: Record<string, string> = {
      status: currentStatus,
      source: currentSource,
      broker_uuid: currentBrokerUuid,
      rating: currentRating ? String(currentRating) : '',
      q: currentSearch,
      page: String(currentPage),
      per_page: String(perPage),
      ...Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, String(v)])),
    };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/admin/reviews?${params.toString()}`;
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages || p === currentPage) return;
    router.push(buildUrl({ page: p }));
  }

  function changePerPage(newPerPage: number) {
    // Reset ke page 1 kalau ganti per page
    router.push(buildUrl({ per_page: newPerPage, page: 1 }));
  }

  if (total === 0) return null;

  return (
    <div
      className="mt-4 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
      style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
    >
      {/* Left: Showing X to Y of Z */}
      <div className="text-sm" style={{ color: '#7A8FA6' }}>
        Showing <strong style={{ color: '#E8EDF4' }}>{showingFrom}</strong> to{' '}
        <strong style={{ color: '#E8EDF4' }}>{showingTo}</strong> of{' '}
        <strong style={{ color: '#E8EDF4' }}>{total}</strong> reviews
      </div>

      {/* Center: Prev / Page X of Y / Next */}
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded border disabled:opacity-30 disabled:cursor-not-allowed transition"
          style={{ borderColor: 'rgba(255,255,255,0.22)', color: '#7A8FA6' }}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span style={{ color: '#E8EDF4' }}>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded border disabled:opacity-30 disabled:cursor-not-allowed transition"
          style={{ borderColor: 'rgba(255,255,255,0.22)', color: '#7A8FA6' }}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      {/* Right: Show per page */}
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: '#7A8FA6' }}>Show per page</span>
        <select
          value={perPage}
          onChange={(e) => changePerPage(parseInt(e.target.value, 10))}
          className="px-3 py-1.5 rounded text-sm focus:outline-none focus:border-[#00A86B]"
          style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
        >
          {PER_PAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}