'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function IbAffiliatesTable({ affiliates, startNumber }: { affiliates: any[]; startNumber: number }) {
  const router = useRouter();

  async function handleTogglePublish(uuid: string, current: boolean) {
    await fetch(`/api/admin/ib-affiliates/${uuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !current }),
    });
    router.refresh();
  }

  async function handleDelete(uuid: string) {
    if (!confirm('Hapus program IB ini?')) return;
    await fetch(`/api/admin/ib-affiliates/${uuid}`, { method: 'DELETE' });
    router.refresh();
  }

  // Filter out deleted items for display
  const activeAffiliates = affiliates.filter(a => !a.deleted_at);

  return (
    <div className="rounded-xl overflow-auto" style={{ background: '#0F1825', border: '1px solid #1A2E45' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#0A1220', color: '#7A8FA6' }}>
            <th className="text-left p-3">Rank</th>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Master Broker</th>
            <th className="text-left p-3">CPA / Rebate</th>
            <th className="text-left p-3">Published</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeAffiliates.length === 0 ? (
            <tr><td colSpan={6} className="p-6 text-center" style={{ color: '#7A8FA6' }}>No data available.</td></tr>
          ) : (
            activeAffiliates.map((ib) => (
              <tr key={ib.uuid} style={{ borderTop: '1px solid #1A2E45' }}>
                <td className="p-3">{ib.rank || '—'}</td>
                <td className="p-3 font-medium">{ib.name}</td>
                <td className="p-3" style={{ color: '#7A8FA6' }}>
                  {ib.brokers ? ib.brokers.name : <span style={{color: '#E53E3E'}}>Unlinked</span>}
                </td>
                <td className="p-3">{ib.cpa || '—'} / {ib.rebate || '—'}</td>
                <td className="p-3">
                  <button onClick={() => handleTogglePublish(ib.uuid, !!ib.is_published)} className="px-2 py-1 rounded text-xs" style={{ background: ib.is_published ? '#00A86B' : '#1A2E45', color: '#fff' }}>
                    {ib.is_published ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/ib-affiliates/${ib.uuid}`} className="px-2 py-1 rounded text-xs" style={{ background: '#1A2E45', color: '#E8EDF4' }}>Edit</Link>
                  <button onClick={() => handleDelete(ib.uuid)} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(229, 62, 62, 0.2)', color: '#E53E3E' }}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}