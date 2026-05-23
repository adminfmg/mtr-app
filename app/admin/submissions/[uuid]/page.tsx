'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Inquiry, InquiryStatus } from '@/types/inquiry';

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    fetchInquiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  async function fetchInquiry() {
    setLoading(true);
    const res = await fetch(`/api/admin/submissions/${uuid}`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Not found');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setInquiry(data.inquiry);

    // Auto-mark as read kalau status masih 'new'
    if (data.inquiry?.status === 'new') {
      await updateStatus('read', true);
    }
    setLoading(false);
  }

  async function updateStatus(newStatus: InquiryStatus, silent = false) {
    if (!silent) setUpdating(true);
    const res = await fetch(`/api/admin/submissions/${uuid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const err = await res.json();
      if (!silent) {
        alert(err.error || 'Update gagal');
        setUpdating(false);
      }
      return;
    }
    const data = await res.json();
    setInquiry(data.inquiry);
    if (!silent) {
      setUpdating(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  }

  async function handleDelete() {
    if (!inquiry) return;
    const ok = window.confirm(
      'Permanent delete? Data ga bisa di-pulihin.\n\nKlik OK untuk hapus permanent.'
    );
    if (!ok) return;

    const res = await fetch(`/api/admin/submissions/${uuid}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Delete gagal');
      return;
    }
    router.push('/admin/submissions');
  }

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ color: '#7A8FA6' }}>
        Loading...
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="p-8" style={{ color: '#E53E3E' }}>
        {error || 'Submission not found'}
        <div className="mt-4">
          <Link href="/admin/submissions" style={{ color: '#00A86B' }}>
            ← Back to submissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {savedToast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: '#00A86B',
            color: '#fff',
            padding: '0.75rem 1.25rem',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0, 168, 107, 0.3)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          ✓ Status updated
        </div>
      )}

      <div className="mb-4">
        <Link
          href="/admin/submissions"
          className="text-sm"
          style={{ color: '#7A8FA6' }}
        >
          ← Back to submissions
        </Link>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: '#E8EDF4' }}>
          {inquiry.name}
        </h1>
        <StatusBadge status={inquiry.status} />
      </div>
      <p className="text-sm mb-6" style={{ color: '#7A8FA6' }}>
        {formatDate(inquiry.created_at)} · {formTypeLabel(inquiry.form_type)} form
      </p>

      {/* Contact info */}
      <Section title="Contact">
        <Field label="Name">{inquiry.name}</Field>
        <Field label="Email">
          <a href={`mailto:${inquiry.email}`} style={{ color: '#00A86B' }}>
            {inquiry.email}
          </a>
        </Field>
        <Field label="Phone">{inquiry.phone_number || '-'}</Field>
      </Section>

      {/* Form-type specific fields */}
      <Section title="Form Details">
        <Field label="Form Type">{formTypeLabel(inquiry.form_type)}</Field>
        {inquiry.topic && <Field label="Topic">{inquiry.topic}</Field>}
        {inquiry.website_url && (
          <Field label="Website URL">
            <a
              href={inquiry.website_url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              style={{ color: '#00A86B' }}
            >
              {inquiry.website_url}
            </a>
          </Field>
        )}
        {inquiry.ib_affiliate_type && (
          <Field label="IB/Affiliate Type">{inquiry.ib_affiliate_type}</Field>
        )}
      </Section>

      {/* Message */}
      <div
        className="mb-6 p-4 rounded-xl"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
          Message
        </h3>
        <div
          style={{
            background: '#0A1220',
            border: '1px solid #1A2E45',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            color: '#E8EDF4',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            minHeight: 80,
          }}
        >
          {inquiry.message || '(no message)'}
        </div>
      </div>

      {/* Action: status + delete */}
      <div
        className="mb-6 p-4 rounded-xl"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
          Status & Actions
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          <StatusButton
            current={inquiry.status}
            target="new"
            onClick={updateStatus}
            disabled={updating}
          />
          <StatusButton
            current={inquiry.status}
            target="read"
            onClick={updateStatus}
            disabled={updating}
          />
          <StatusButton
            current={inquiry.status}
            target="replied"
            onClick={updateStatus}
            disabled={updating}
          />
          <StatusButton
            current={inquiry.status}
            target="archived"
            onClick={updateStatus}
            disabled={updating}
          />
          {inquiry.status === 'archived' && (
            <button
              onClick={handleDelete}
              className="px-3 py-2 rounded text-sm font-medium ml-auto"
              style={{
                background: 'transparent',
                color: '#E53E3E',
                border: '1px solid #E53E3E',
              }}
            >
              Delete Permanently
            </button>
          )}
        </div>
        <p className="text-xs mt-3" style={{ color: '#7A8FA6' }}>
          Submission yang udah <strong>archived</strong> bisa di-delete permanent.
          Yang lain pindah ke archived dulu sebelum bisa di-hapus.
        </p>
      </div>

      {/* Reply quick action */}
      <div
        className="p-4 rounded-xl"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
          Reply
        </h3>
        <a
          href={`mailto:${inquiry.email}?subject=Re: Your MTR ${formTypeLabel(inquiry.form_type)} Submission`}
          className="inline-block px-4 py-2 rounded font-medium"
          style={{ background: '#00A86B', color: '#fff' }}
        >
          ✉ Reply via Email
        </a>
        <p className="text-xs mt-2" style={{ color: '#7A8FA6' }}>
          Buka di email client default. Jangan lupa update status ke <strong>replied</strong> setelah follow-up.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mb-6 p-4 rounded-xl"
      style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs mb-1" style={{ color: '#7A8FA6' }}>
        {label}
      </div>
      <div style={{ color: '#E8EDF4' }}>{children}</div>
    </div>
  );
}

function StatusButton({
  current,
  target,
  onClick,
  disabled,
}: {
  current: InquiryStatus;
  target: InquiryStatus;
  onClick: (s: InquiryStatus) => void;
  disabled: boolean;
}) {
  const isActive = current === target;
  const colors: Record<InquiryStatus, string> = {
    new: '#00A86B',
    read: '#3B82F6',
    replied: '#A78BFA',
    archived: '#7A8FA6',
  };
  return (
    <button
      onClick={() => onClick(target)}
      disabled={disabled || isActive}
      className="px-3 py-1.5 rounded text-xs font-medium uppercase disabled:opacity-50"
      style={{
        background: isActive ? colors[target] : 'transparent',
        color: isActive ? '#fff' : colors[target],
        border: `1px solid ${colors[target]}`,
        cursor: isActive ? 'default' : 'pointer',
      }}
    >
      {target}
    </button>
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
      className="px-3 py-1 rounded text-xs font-medium uppercase"
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

function formTypeLabel(type: string): string {
  return type === 'ib_affiliate' ? 'IB/Affiliate' : type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
