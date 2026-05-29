'use client';
import { useState } from 'react';

export default function ProfileForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMsg({ text: 'All fields are required', tone: 'err' });
      return;
    }

    if (newPassword.length < 8) {
      setMsg({ text: 'New password must be at least 8 characters', tone: 'err' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg({ text: 'New password and confirmation do not match', tone: 'err' });
      return;
    }

    if (newPassword === currentPassword) {
      setMsg({ text: 'New password must be different from current password', tone: 'err' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to change password');

      setMsg({ text: 'Password updated successfully', tone: 'ok' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setMsg({ text: (e as Error).message, tone: 'err' });
    } finally {
      setLoading(false);
    }
  }

  const card: React.CSSProperties = {
    background: 'var(--mtr-card)',
    border: '1px solid var(--mtr-border)',
    borderRadius: 'var(--mtr-radius)',
  };
  const inputStyle: React.CSSProperties = {
    background: 'var(--mtr-inner)',
    border: '1px solid var(--mtr-border)',
    color: 'var(--mtr-text)',
  };
  const btnPrimary: React.CSSProperties = {
    background: 'var(--mtr-green)',
    color: '#fff',
    border: 0,
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-5" style={card}>
      <h2 className="text-base font-semibold mb-4">Change Password</h2>

      {msg && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm"
          style={{
            background:
              msg.tone === 'ok'
                ? 'rgba(0, 168, 107, 0.1)'
                : 'rgba(229, 62, 62, 0.1)',
            borderLeft: `4px solid ${
              msg.tone === 'ok' ? 'var(--mtr-green)' : 'var(--mtr-red)'
            }`,
            color: msg.tone === 'ok' ? 'var(--mtr-green)' : 'var(--mtr-red)',
          }}
        >
          {msg.text}
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <label
            className="block text-xs font-semibold mb-1"
            style={{ color: 'var(--mtr-muted)' }}
          >
            Current Password
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            style={inputStyle}
            autoComplete="current-password"
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold mb-1"
            style={{ color: 'var(--mtr-muted)' }}
          >
            New Password
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            style={inputStyle}
            autoComplete="new-password"
          />
          <p className="text-xs mt-1" style={{ color: 'var(--mtr-muted)' }}>
            Minimum 8 characters.
          </p>
        </div>

        <div>
          <label
            className="block text-xs font-semibold mb-1"
            style={{ color: 'var(--mtr-muted)' }}
          >
            Confirm New Password
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 rounded text-sm"
            style={inputStyle}
            autoComplete="new-password"
          />
        </div>

        <label
          className="flex items-center gap-2 text-xs cursor-pointer"
          style={{ color: 'var(--mtr-muted)' }}
        >
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
          />
          Show passwords
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
            style={btnPrimary}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </form>
  );
}
