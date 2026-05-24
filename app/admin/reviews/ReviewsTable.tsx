'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  broker_uuid: string;
  rating: number;
  review_text: string;
  guest_name: string;
  guest_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  source: 'visitor' | 'admin';
  created_at: string;
  brokers: { name: string; slug: string };
}

interface Props {
  reviews: Review[];
}

export function ReviewsTable({ reviews }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed');
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed');
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div
        className="border border-dashed rounded-lg p-10 text-center"
        style={{ borderColor: 'rgba(255,255,255,0.22)', color: '#7A8FA6' }}
      >
        No reviews found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: '#7A8FA6' }} className="text-left border-b border-[rgba(255,255,255,0.12)]">
            <th className="py-3 px-2">Broker</th>
            <th className="py-3 px-2">Rating</th>
            <th className="py-3 px-2">Guest</th>
            <th className="py-3 px-2">Review</th>
            <th className="py-3 px-2">Status</th>
            <th className="py-3 px-2">Source</th>
            <th className="py-3 px-2">Created</th>
            <th className="py-3 px-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="border-b border-[rgba(255,255,255,0.06)] align-top">
              <td className="py-3 px-2 font-medium">{r.brokers.name}</td>
              <td className="py-3 px-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={i <= r.rating ? '#FFC107' : 'none'}
                      stroke="#FFC107"
                      strokeWidth="1.5"
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
              </td>
              <td className="py-3 px-2">
                <div>{r.guest_name}</div>
                {r.guest_email && (
                  <div className="text-xs mt-0.5" style={{ color: '#7A8FA6' }}>
                    {r.guest_email}
                  </div>
                )}
              </td>
              <td className="py-3 px-2 max-w-xs">
                <div className="line-clamp-3 whitespace-pre-wrap">{r.review_text}</div>
              </td>
              <td className="py-3 px-2">
                <StatusBadge status={r.status} />
              </td>
              <td className="py-3 px-2">
                <span style={{ color: r.source === 'admin' ? '#00A86B' : '#7A8FA6' }}>
                  {r.source}
                </span>
              </td>
              <td className="py-3 px-2 text-xs whitespace-nowrap" style={{ color: '#7A8FA6' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-2 text-right whitespace-nowrap">
                <div className="flex gap-2 justify-end">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleAction(r.id, 'approved')}
                      disabled={busy === r.id}
                      className="px-2 py-1 text-xs rounded font-medium disabled:opacity-50"
                      style={{ background: '#00A86B', color: '#fff' }}
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleAction(r.id, 'rejected')}
                      disabled={busy === r.id}
                      className="px-2 py-1 text-xs rounded font-medium disabled:opacity-50"
                      style={{ background: '#D69E2E', color: '#fff' }}
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={busy === r.id}
                    className="px-2 py-1 text-xs rounded font-medium disabled:opacity-50"
                    style={{ background: '#E53E3E', color: '#fff' }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const colors = {
    pending: { bg: 'rgba(214,158,46,0.12)', text: '#D69E2E' },
    approved: { bg: 'rgba(0,168,107,0.12)', text: '#00A86B' },
    rejected: { bg: 'rgba(229,62,62,0.12)', text: '#E53E3E' },
  }[status];
  return (
    <span
      className="text-xs px-2 py-1 rounded-full"
      style={{ background: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  );
}