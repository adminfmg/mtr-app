'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Broker {
  uuid: string;
  name: string;
}

interface Props {
  brokers: Broker[];
  currentStatus: string;
  currentSource: string;
  currentBrokerUuid: string;
  currentRating: number;
  currentSearch: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'visitor', label: 'Visitor' },
  { value: 'admin', label: 'Admin' },
];

export function ReviewsFilters({
  brokers,
  currentStatus,
  currentSource,
  currentBrokerUuid,
  currentRating,
  currentSearch,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [brokerSearch, setBrokerSearch] = useState('');
  const [brokerOpen, setBrokerOpen] = useState(false);
  const brokerRef = useRef<HTMLDivElement>(null);

  const selectedBroker = brokers.find((b) => b.uuid === currentBrokerUuid);

  const filteredBrokers = useMemo(() => {
    if (!brokerSearch) return brokers.slice(0, 20);
    const q = brokerSearch.toLowerCase();
    return brokers.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 20);
  }, [brokers, brokerSearch]);

  // Build URL helper
  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams();
    const merged: Record<string, string> = {
      status: currentStatus,
      source: currentSource,
      broker_uuid: currentBrokerUuid,
      rating: currentRating ? String(currentRating) : '',
      q: search,
      ...updates,
      page: '1', // reset to page 1 when filter changes
    };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `/admin/reviews?${params.toString()}`;
  }

  // Debounced search submit
  useEffect(() => {
    if (search === currentSearch) return;
    const t = setTimeout(() => {
      router.push(buildUrl({ q: search }));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Close broker dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (brokerRef.current && !brokerRef.current.contains(e.target as Node)) {
        setBrokerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectBroker(uuid: string) {
    router.push(buildUrl({ broker_uuid: uuid }));
    setBrokerOpen(false);
    setBrokerSearch('');
  }

  function clearBroker() {
    router.push(buildUrl({ broker_uuid: '' }));
    setBrokerOpen(false);
    setBrokerSearch('');
  }

  return (
    <div
      className="p-4 rounded-xl mb-4 space-y-3"
      style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
    >
      {/* Row 1: Search + Broker filter */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-3">
        {/* Search box */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: '#7A8FA6' }}>
            Search (name, email, review)
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
            className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:border-[#00A86B]"
            style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
          />
        </div>

        {/* Broker filter (searchable) */}
        <div ref={brokerRef} className="relative">
          <label className="block text-xs mb-1.5" style={{ color: '#7A8FA6' }}>
            Broker
          </label>
          <button
            type="button"
            onClick={() => setBrokerOpen((v) => !v)}
            className="w-full px-3 py-2 rounded text-sm text-left flex items-center justify-between"
            style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
          >
            <span className={selectedBroker ? '' : 'text-[#7A8FA6]'}>
              {selectedBroker ? selectedBroker.name : 'All brokers'}
            </span>
            <span className="text-xs" style={{ color: '#7A8FA6' }}>▾</span>
          </button>

          {brokerOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded shadow-lg z-10 max-h-72 overflow-hidden flex flex-col"
              style={{ background: '#0A1220', border: '1px solid #1A2E45' }}
            >
              <input
                type="text"
                value={brokerSearch}
                onChange={(e) => setBrokerSearch(e.target.value)}
                placeholder="Search broker..."
                autoFocus
                className="w-full px-3 py-2 text-sm focus:outline-none border-b"
                style={{ background: '#060D18', borderColor: '#1A2E45', color: '#E8EDF4' }}
              />
              <div className="overflow-y-auto flex-1">
                {currentBrokerUuid && (
                  <button
                    type="button"
                    onClick={clearBroker}
                    className="block w-full text-left px-3 py-2 text-xs hover:opacity-80"
                    style={{ color: '#E53E3E', background: 'transparent' }}
                  >
                    × Clear selection
                  </button>
                )}
                {filteredBrokers.length === 0 ? (
                  <div className="p-2 text-xs" style={{ color: '#7A8FA6' }}>
                    No matches.
                  </div>
                ) : (
                  filteredBrokers.map((b) => (
                    <button
                      key={b.uuid}
                      type="button"
                      onClick={() => selectBroker(b.uuid)}
                      className="block w-full text-left px-3 py-2 text-sm hover:opacity-80"
                      style={{
                        color: b.uuid === currentBrokerUuid ? '#00A86B' : '#E8EDF4',
                        background: 'transparent',
                      }}
                    >
                      {b.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Status + Rating + Source filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="px-3 py-2 rounded-lg"
          style={{ background: '#0A1220', border: '1px solid #1A2E45' }}
        >
          <FilterGroup
            label="Status"
            current={currentStatus}
            options={STATUS_OPTIONS}
            buildUrl={(value) => buildUrl({ status: value })}
          />
        </div>
        <div
          className="mx-auto px-3 py-2 rounded-lg"
          style={{ background: '#0A1220', border: '1px solid #1A2E45' }}
        >
          <RatingFilter
            current={currentRating}
            buildUrl={(value) => buildUrl({ rating: value ? String(value) : '' })}
          />
        </div>
        <div
          className="px-3 py-2 rounded-lg"
          style={{ background: '#0A1220', border: '1px solid #1A2E45' }}
        >
          <FilterGroup
            label="Source"
            current={currentSource}
            options={SOURCE_OPTIONS}
            buildUrl={(value) => buildUrl({ source: value })}
          />
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  current,
  options,
  buildUrl,
}: {
  label: string;
  current: string;
  options: { value: string; label: string }[];
  buildUrl: (value: string) => string;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: '#7A8FA6' }}>
        {label}:
      </span>
      <div className="flex gap-1">
        {options.map((opt) => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => router.push(buildUrl(opt.value))}
              className="text-xs px-3 py-1.5 rounded-full border transition"
              style={{
                background: active ? 'rgba(0,168,107,0.12)' : 'transparent',
                borderColor: active ? '#00A86B' : 'rgba(255,255,255,0.22)',
                color: active ? '#00A86B' : '#7A8FA6',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RatingFilter({
  current,
  buildUrl,
}: {
  current: number;
  buildUrl: (value: number) => string;
}) {
  const router = useRouter();

  function StarIcon({ size = 12 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="1">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: '#7A8FA6' }}>
        Rating:
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => router.push(buildUrl(0))}
          className="text-xs px-3 py-1.5 rounded-full border transition"
          style={{
            background: current === 0 ? 'rgba(0,168,107,0.12)' : 'transparent',
            borderColor: current === 0 ? '#00A86B' : 'rgba(255,255,255,0.22)',
            color: current === 0 ? '#00A86B' : '#7A8FA6',
          }}
        >
          All
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const active = current === star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => router.push(buildUrl(star))}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition"
              style={{
                background: active ? 'rgba(0,168,107,0.12)' : 'transparent',
                borderColor: active ? '#00A86B' : 'rgba(255,255,255,0.22)',
                color: active ? '#00A86B' : '#7A8FA6',
              }}
            >
              {star}
              <StarIcon />
            </button>
          );
        })}
      </div>
    </div>
  );
}