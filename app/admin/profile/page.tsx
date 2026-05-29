import { getAdminUser } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  const session = await getAdminUser();
  if (!session) redirect('/admin/login');

  const { user, role } = session;
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleString() : '—';
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : '—';

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--mtr-muted)' }}>
          Manage your account credentials.
        </p>
      </div>

      {/* Account info — read only */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: 'var(--mtr-card)',
          border: '1px solid var(--mtr-border)',
          borderRadius: 'var(--mtr-radius)',
        }}
      >
        <h2 className="text-base font-semibold mb-4">Account</h2>

        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--mtr-muted)' }}>Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--mtr-muted)' }}>Role</dt>
            <dd>
              <span
                className="px-2 py-0.5 text-xs rounded"
                style={{
                  background: role === 'owner' ? 'var(--mtr-green)' : 'var(--mtr-border)',
                  color: '#fff',
                }}
              >
                {role}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--mtr-muted)' }}>Account created</dt>
            <dd>{createdAt}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--mtr-muted)' }}>Last sign in</dt>
            <dd>{lastSignIn}</dd>
          </div>
        </dl>
      </div>

      {/* Change password */}
      <ProfileForm />
    </div>
  );
}
