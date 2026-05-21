'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Broker } from '@/types/broker';

export function BrokersTable({ brokers }: { brokers: Broker[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'deleted' | 'hidden'>('all');

  const filtered = useMemo(() => {
    let r = brokers;

    if (search) {
      const q = search.toLowerCase();
      r = r.filter((b) => b.name.toLowerCase().includes(q));
    }

    if (filter === 'active') {
      r = r.filter((b) => !b.deleted_at);
    }

    if (filter === 'deleted') {
      r = r.filter((b) => b.deleted_at);
    }

    if (filter === 'hidden') {
      r = r.filter((b) => !b.deleted_at && b.is_published === false);
    }

    return [...r].sort((a, b) => {
      const scoreA = Number(a.score ?? 0);
      const scoreB = Number(b.score ?? 0);

      return scoreB - scoreA;
    });
  }, [brokers, search, filter]);

  async function handleSoftDelete(uuid: string, name: string) {
    if (!confirm(`Soft delete "${name}"? Broker bisa di-restore nanti.`)) return;
    const res = await fetch(`/api/admin/brokers/${uuid}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      alert('Gagal: ' + (err.error || 'unknown'));
      return;
    }
    router.refresh();
  }

  async function handleRestore(uuid: string) {
    const res = await fetch(`/api/admin/brokers/${uuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleted_at: null }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Gagal: ' + (err.error || 'unknown'));
      return;
    }
    router.refresh();
  }

  async function handleTogglePublish(uuid: string, current: boolean) {
    const res = await fetch(`/api/admin/brokers/${uuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !current }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Gagal: ' + (err.error || 'unknown'));
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search broker name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded"
          style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'deleted' | 'hidden')}
          className="px-3 py-2 rounded"
          style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
        >
          <option value="all">All</option>
          <option value="active">Active only</option>
          <option value="hidden">Hidden from website</option>
          <option value="deleted">Soft-deleted only</option>
        </select>
      </div>

      <div
        className="rounded-xl overflow-auto"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#0A1220', color: '#7A8FA6' }}>
              <th className="text-left p-3">Rank</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Score</th>
              <th className="text-left p-3">Tier</th>
              <th className="text-left p-3">Published</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center" style={{ color: '#7A8FA6' }}>
                  No brokers match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((b, index) => (
                <tr key={b.uuid} style={{ borderTop: '1px solid #1A2E45' }}>
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{b.name}</td>
                  <td className="p-3">
                    {b.score !== null && b.score !== undefined
                      ? Number(b.score).toFixed(3)
                      : '—'}
                  </td>
                  <td className="p-3">{b.regulation_tier ?? '—'}</td>
                  <td className="p-3">
                    {b.deleted_at ? (
                      <span style={{ color: '#7A8FA6' }}>—</span>
                    ) : (
                      <button
                        onClick={() => handleTogglePublish(b.uuid, !!b.is_published)}
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          background: b.is_published ? '#00A86B' : '#1A2E45',
                          color: '#fff',
                        }}
                      >
                        {b.is_published ? 'Yes' : 'No'}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    {b.deleted_at ? (
                      <span style={{ color: '#E53E3E' }}>Deleted</span>
                    ) : (
                      <span style={{ color: '#00A86B' }}>Active</span>
                    )}
                  </td>
                  <td className="p-3 flex gap-2">
                    {!b.deleted_at ? (
                      <>
                        <Link
                          href={`/admin/brokers/${b.uuid}`}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: '#1A2E45', color: '#E8EDF4' }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleSoftDelete(b.uuid, b.name)}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: 'rgba(229, 62, 62, 0.2)', color: '#E53E3E' }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(b.uuid)}
                        className="px-2 py-1 rounded text-xs"
                        style={{ background: '#00A86B', color: '#fff' }}
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
