'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inquiry, InquiryFormType, InquiryStatus } from '@/types/inquiry';

type FilterFormType = InquiryFormType | 'all';
type FilterStatus = InquiryStatus | 'all';
type SortOrder = 'newest' | 'oldest';

interface Counts {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
  by_form_type: {
    trader: number;
    broker: number;
    ib_affiliate: number;
  };
}

export default function SubmissionsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState<FilterFormType>('all');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortOrder>('newest');

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formType, status, sort]);

  async function fetchInquiries() {
    setLoading(true);
    const params = new URLSearchParams({ form_type: formType, status, sort });
    const res = await fetch(`/api/admin/submissions?${params.toString()}`);
    const data = await res.json();
    setInquiries(data.inquiries || []);
    setCounts(data.counts || null);
    setLoading(false);
  }

  return (
    <div className="max-w-full">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#E8EDF4' }}>
        Submissions
      </h1>
      <p className="text-sm mb-6" style={{ color: '#7A8FA6' }}>
        Form submission dari halaman publik (Get Listed, Contact, IB/Affiliate).
      </p>

      {/* Counts badge */}
      {counts && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge label="Total" value={counts.total} />
          <Badge label="New" value={counts.new} color="#00A86B" />
          <Badge label="Read" value={counts.read} color="#3B82F6" />
          <Badge label="Replied" value={counts.replied} color="#A78BFA" />
          <Badge label="Archived" value={counts.archived} color="#7A8FA6" />
        </div>
      )}

      {/* Filter bar */}
      <div
        className="mb-4 p-4 rounded-xl flex flex-wrap gap-4 items-end"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        <FilterGroup label="Form Type">
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value as FilterFormType)}
            style={selectStyle}
          >
            <option value="all">All</option>
            <option value="trader">Trader ({counts?.by_form_type.trader || 0})</option>
            <option value="broker">Broker ({counts?.by_form_type.broker || 0})</option>
            <option value="ib_affiliate">IB/Affiliate ({counts?.by_form_type.ib_affiliate || 0})</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FilterStatus)}
            style={selectStyle}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Sort">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            style={selectStyle}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </FilterGroup>

        <button
          onClick={fetchInquiries}
          className="px-3 py-2 rounded text-sm"
          style={{ background: '#1A2E45', color: '#E8EDF4' }}
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center" style={{ color: '#7A8FA6' }}>
          Loading...
        </div>
      ) : inquiries.length === 0 ? (
        <div
          className="p-8 text-center rounded-xl"
          style={{ background: '#0F1825', border: '1px solid #1A2E45', color: '#7A8FA6' }}
        >
          Ga ada submission dengan filter ini.
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-xl"
          style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1A2E45' }}>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Topic / Note</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr
                  key={inq.uuid}
                  style={{ borderBottom: '1px solid #1A2E45' }}
                  className="hover:bg-[#0A1220]"
                >
                  <Td>
                    <span style={{ color: '#7A8FA6' }}>{formatDate(inq.created_at)}</span>
                  </Td>
                  <Td>
                    <FormTypeBadge type={inq.form_type} />
                  </Td>
                  <Td>{inq.name}</Td>
                  <Td>
                    <a
                      href={`mailto:${inq.email}`}
                      style={{ color: '#00A86B' }}
                      className="hover:underline"
                    >
                      {inq.email}
                    </a>
                  </Td>
                  <Td>
                    <span style={{ color: '#7A8FA6' }}>
                      {inq.topic || inq.ib_affiliate_type || '-'}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge status={inq.status} />
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/submissions/${inq.uuid}`}
                      className="px-3 py-1 rounded text-xs font-medium"
                      style={{ background: '#00A86B', color: '#fff' }}
                    >
                      View
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: '#0A1220',
  border: '1px solid #1A2E45',
  color: '#E8EDF4',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.375rem',
  minWidth: 140,
};

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Badge({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div
      className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
      style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
    >
      <span style={{ color: '#7A8FA6' }}>{label}</span>
      <span
        className="px-2 py-0.5 rounded-md text-xs font-bold"
        style={{ background: color || '#1A2E45', color: '#fff' }}
      >
        {value}
      </span>
    </div>
  );
}

function FormTypeBadge({ type }: { type: InquiryFormType }) {
  const labels: Record<InquiryFormType, string> = {
    trader: 'Trader',
    broker: 'Broker',
    ib_affiliate: 'IB/Affiliate',
  };
  const colors: Record<InquiryFormType, string> = {
    trader: '#3B82F6',
    broker: '#00A86B',
    ib_affiliate: '#A78BFA',
  };
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: `${colors[type]}20`, color: colors[type], border: `1px solid ${colors[type]}40` }}
    >
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const colors: Record<InquiryStatus, string> = {
    new: '#00A86B',
    read: '#3B82F6',
    replied: '#A78BFA',
    archived: '#7A8FA6',
  };
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium uppercase"
      style={{
        background: `${colors[status]}20`,
        color: colors[status],
        border: `1px solid ${colors[status]}40`,
      }}
    >
      {status}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left px-4 py-3 text-xs font-semibold"
      style={{ color: '#7A8FA6' }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-3" style={{ color: '#E8EDF4' }}>
      {children}
    </td>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
