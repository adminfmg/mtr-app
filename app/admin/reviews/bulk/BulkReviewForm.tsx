'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Broker {
  uuid: string;
  name: string;
  slug: string;
  rank: number | null;
}

interface Sample {
  rating: number;
  guest_name: string;
  guest_email: string;
  review_text: string;
}

export function BulkReviewForm({ brokers }: { brokers: Broker[] }) {
  const router = useRouter();

  // Broker picker
  const [search, setSearch] = useState('');
  const [selectedUuid, setSelectedUuid] = useState('');

  // Distribution
  const [star5, setStar5] = useState('');
  const [star4, setStar4] = useState('');
  const [star3, setStar3] = useState('');
  const [star2, setStar2] = useState('');
  const [star1, setStar1] = useState('');

  // Flow
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<{ total: number; sample: Sample[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selected = brokers.find((b) => b.uuid === selectedUuid);

  const filtered = useMemo(() => {
    if (!search) return brokers.slice(0, 20);
    const q = search.toLowerCase();
    return brokers.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 20);
  }, [brokers, search]);

  const n5 = parseInt(star5) || 0;
  const n4 = parseInt(star4) || 0;
  const n3 = parseInt(star3) || 0;
  const n2 = parseInt(star2) || 0;
  const n1 = parseInt(star1) || 0;
  const totalReviews = n5 + n4 + n3 + n2 + n1;

  function validate(): string | null {
    if (!selectedUuid) return 'Please select a broker.';
    if (totalReviews < 1) return 'Total reviews must be at least 1.';
    if (totalReviews > 10000) return 'Max 10,000 reviews per batch.';
    if ([n5, n4, n3, n2, n1].some((n) => n < 0)) return 'Star counts cannot be negative.';
    return null;
  }

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) return setError(validationError);

    setPreviewing(true);
    try {
      const res = await fetch('/api/admin/reviews/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker_uuid: selectedUuid,
          distribution: { 5: n5, 4: n4, 3: n3, 2: n2, 1: n1 },
          preview: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Preview failed.');
        return;
      }

      setPreview({ total: data.total, sample: data.sample });
    } catch {
      setError('Network error.');
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/reviews/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker_uuid: selectedUuid,
          distribution: { 5: n5, 4: n4, 3: n3, 2: n2, 1: n1 },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submit failed.');
        return;
      }

      setSuccess(`Successfully inserted ${data.total} reviews. Batch ID: ${data.batch_id.slice(0, 8)}...`);
      setPreview(null);
      setStar5('');
      setStar4('');
      setStar3('');
      setStar2('');
      setStar1('');
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setPreview(null);
    setError(null);
  }

  // STAR ICON
  function StarIcon({ size = 24 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    );
  }

  return (
    <div className="max-w-3xl">
      <form
        onSubmit={handlePreview}
        className="p-5 rounded-xl mb-6"
        style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
      >
        {/* Broker picker */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">
            Broker <span style={{ color: '#E53E3E' }}>*</span>
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedUuid('');
            }}
            placeholder="Search broker name..."
            className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:border-[#00A86B]"
            style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
          />
          {!selectedUuid && search && (
            <div
              className="mt-2 rounded max-h-60 overflow-y-auto"
              style={{ background: '#0A1220', border: '1px solid #1A2E45' }}
            >
              {filtered.length === 0 ? (
                <div className="p-2 text-xs" style={{ color: '#7A8FA6' }}>
                  No matches.
                </div>
              ) : (
                filtered.map((b) => (
                  <button
                    key={b.uuid}
                    type="button"
                    onClick={() => {
                      setSelectedUuid(b.uuid);
                      setSearch(b.name);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:opacity-80"
                    style={{ color: '#E8EDF4', background: 'transparent' }}
                  >
                    {b.name}{' '}
                    <span style={{ color: '#7A8FA6' }}>· rank {b.rank ?? '—'}</span>
                  </button>
                ))
              )}
            </div>
          )}
          {selected && (
            <div className="text-xs mt-1" style={{ color: '#00A86B' }}>
              Selected: {selected.name}
            </div>
          )}
        </div>

        {/* Distribution */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-3">
            Rating Distribution <span style={{ color: '#E53E3E' }}>*</span>
          </label>
          <div className="space-y-2">
            {[
              { star: 5, value: star5, set: setStar5 },
              { star: 4, value: star4, set: setStar4 },
              { star: 3, value: star3, set: setStar3 },
              { star: 2, value: star2, set: setStar2 },
              { star: 1, value: star1, set: setStar1 },
            ].map(({ star, value, set }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex gap-0.5 w-32">
                  {Array.from({ length: star }, (_, i) => (
                    <StarIcon key={i} size={18} />
                  ))}
                </div>
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-3 py-1.5 rounded text-sm focus:outline-none focus:border-[#00A86B]"
                  style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }}
                />
              </div>
            ))}
          </div>

          {totalReviews > 0 && (
            <div
              className="mt-3 p-3 rounded text-sm flex items-center justify-between"
              style={{ background: '#0A1220', border: '1px solid #1A2E45' }}
            >
              <span style={{ color: '#7A8FA6' }}>Total Reviews:</span>
              <span className="font-bold text-lg" style={{ color: '#00A86B' }}>
                {totalReviews.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded text-sm border"
            style={{
              background: 'rgba(229,62,62,0.12)',
              borderColor: 'rgba(229,62,62,0.45)',
              color: '#E53E3E',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="mb-4 p-3 rounded text-sm border"
            style={{
              background: 'rgba(0,168,107,0.12)',
              borderColor: 'rgba(0,168,107,0.45)',
              color: '#00A86B',
            }}
          >
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={previewing || !selectedUuid || totalReviews < 1}
            className="px-5 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#00A86B', color: '#fff' }}
          >
            {previewing ? 'Loading preview...' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/reviews')}
            className="px-5 py-2 rounded font-medium border"
            style={{ borderColor: 'rgba(255,255,255,0.22)', color: '#7A8FA6' }}
          >
            Back
          </button>
        </div>
      </form>

      {/* PREVIEW MODAL */}
      {preview && (
        <div
          className="p-5 rounded-xl"
          style={{ background: '#0F1825', border: '1px solid #00A86B' }}
        >
          <h3 className="text-lg font-bold mb-1" style={{ color: '#00A86B' }}>
            Preview
          </h3>
          <p className="text-sm mb-4" style={{ color: '#7A8FA6' }}>
            About to insert <strong style={{ color: '#E8EDF4' }}>{preview.total.toLocaleString()}</strong> reviews
            for <strong style={{ color: '#E8EDF4' }}>{selected?.name}</strong>. Sample of 5 generated entries:
          </p>

          <div className="space-y-3 mb-5">
            {preview.sample.map((s, i) => (
                <div
                key={i}
                className="p-3 rounded text-sm"
                style={{ background: '#0A1220', border: '1px solid #1A2E45' }}
                >
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5 w-28">
                    {Array.from({ length: s.rating }, (_, j) => (
                        <StarIcon key={j} size={14} />
                    ))}
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: '#E8EDF4' }}>{s.guest_name}</div>
                    <div className="text-xs truncate" style={{ color: '#7A8FA6' }}>{s.guest_email}</div>
                    </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#a9bcde' }}>
                    {s.review_text}
                </p>
                </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#00A86B', color: '#fff' }}
            >
              {submitting ? `Inserting ${preview.total.toLocaleString()} reviews...` : `Confirm & Insert ${preview.total.toLocaleString()} Reviews`}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="px-5 py-2 rounded font-medium border"
              style={{ borderColor: 'rgba(255,255,255,0.22)', color: '#7A8FA6' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}