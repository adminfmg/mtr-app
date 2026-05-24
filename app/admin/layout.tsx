import Link from 'next/link';
import { getAdminUser } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminUser();

  // Kalau ga login, render children tanpa sidebar (buat halaman /admin/login)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#060D18', color: '#E8EDF4' }}>
      <aside
        className="w-64 p-6 flex flex-col gap-1"
        style={{ background: '#0F1825', borderRight: '1px solid #1A2E45' }}
      >
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: '#00A86B' }}>MTR Admin</h1>
          <p className="text-xs mt-1" style={{ color: '#7A8FA6' }}>{session.user.email}</p>
          <span
            className="inline-block mt-1 px-2 py-0.5 text-xs rounded"
            style={{
              background: session.role === 'owner' ? '#00A86B' : '#1A2E45',
              color: '#fff',
            }}
          >
            {session.role}
          </span>
        </div>

        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/brokers">Brokers</NavLink>
        <NavLink href="/admin/boost">Vote Boost</NavLink>
        <NavLink href="/admin/reviews">Reviews</NavLink>
        <NavLink href="/admin/submissions">Submissions</NavLink>

        <div className="mt-auto pt-6 border-t" style={{ borderColor: '#1A2E45' }}>
          <form action="/api/admin/auth" method="POST">
            <input type="hidden" name="action" value="logout" />
            <button type="submit" className="text-sm" style={{ color: '#E53E3E' }}>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 rounded text-sm hover:opacity-80" style={{ color: '#E8EDF4' }}>
      {children}
    </Link>
  );
}
