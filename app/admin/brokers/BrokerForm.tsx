'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Broker } from '@/types/broker';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

type Mode = 'create' | 'edit';
type TabKey =
  | 'basic'
  | 'ranking'
  | 'contact'
  | 'trading'
  | 'spreadsWithdrawal'
  | 'features'
  | 'notes'
  | 'web'
  | 'content'
  | 'payments'
  | 'trust'
  | 'offer'
  | 'visibility';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'ranking', label: 'Ranking & Score' },
  { key: 'contact', label: 'Contact' },
  { key: 'trading', label: 'Trading' },
  { key: 'spreadsWithdrawal', label: 'Spreads & Withdrawal' },
  { key: 'features', label: 'Features' },
  { key: 'notes', label: 'Notes' },
  { key: 'web', label: 'Web URLs' },
  { key: 'content', label: 'Content' },
  { key: 'payments', label: 'Payments' },
  { key: 'trust', label: 'Trust' },
  { key: 'offer', label: 'Offer' },
  { key: 'visibility', label: 'Visibility' },
];

export function BrokerForm({ broker, mode }: { broker?: Broker; mode: Mode }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  const initialLogoUrl = broker?.logo_url ?? null;
  const [pendingDirtyLogos, setPendingDirtyLogos] = useState<string[]>([]);

  const [form, setForm] = useState<Partial<Broker>>(
    broker || {
      name: '',
      is_published: true,
      status: 'legitimate',
    }
  );

  function setField<K extends keyof Broker>(key: K, value: Broker[K] | null) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setArrayField(key: keyof Broker, raw: string, sep: string = ',') {
    const arr = raw.split(sep).map((s) => s.trim()).filter(Boolean);
    setForm((f) => ({ ...f, [key]: arr.length ? arr : null }));
  }

  // ============================================================
  // ORPHAN LOGO CLEANUP (preserved from existing)
  // ============================================================
  useEffect(() => {
    if (pendingDirtyLogos.length === 0) return;

    const handler = (e: BeforeUnloadEvent) => {
      for (const url of pendingDirtyLogos) {
        const blob = new Blob([JSON.stringify({ url })], { type: 'application/json' });
        navigator.sendBeacon('/api/admin/brokers/upload-logo/beacon-delete', blob);
      }
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [pendingDirtyLogos]);

  async function deleteOrphans(urls: string[]): Promise<void> {
    await Promise.all(
      urls.map((url) =>
        fetch('/api/admin/brokers/upload-logo', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        }).catch(() => {})
      )
    );
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    setLogoUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    if (form.logo_url && form.logo_url !== initialLogoUrl) {
      formData.append('old_url', form.logo_url);
    }

    const res = await fetch('/api/admin/brokers/upload-logo', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      setLogoError(err.error || 'Upload gagal');
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const { url } = await res.json();
    setField('logo_url', url);
    setPendingDirtyLogos((prev) => {
      const filtered = prev.filter((u) => u !== form.logo_url);
      return [...filtered, url];
    });
    setLogoUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleLogoRemove() {
    if (!form.logo_url) return;
    setLogoError(null);
    setLogoUploading(true);

    const currentUrl = form.logo_url;
    const isDirty = pendingDirtyLogos.includes(currentUrl);

    if (isDirty) {
      const res = await fetch('/api/admin/brokers/upload-logo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        setLogoError(err.error || 'Hapus gagal');
        setLogoUploading(false);
        return;
      }
      setPendingDirtyLogos((prev) => prev.filter((u) => u !== currentUrl));
    }

    setField('logo_url', null);
    setLogoUploading(false);
  }

  async function handleCancel() {
    if (pendingDirtyLogos.length > 0) {
      const ok = window.confirm(
        `Ada ${pendingDirtyLogos.length} logo yang udah ke-upload tapi belum di-save.\n\n` +
          `Klik OK untuk hapus dari storage dan keluar.\n` +
          `Klik Cancel untuk tetap di form.`
      );
      if (!ok) return;
      await deleteOrphans(pendingDirtyLogos);
      setPendingDirtyLogos([]);
    }
    router.back();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = mode === 'create' ? '/api/admin/brokers' : `/api/admin/brokers/${broker!.uuid}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || 'Unknown error');
      setSubmitting(false);
      return;
    }

    const payload = await res.json();

    if (mode === 'edit' && initialLogoUrl && !form.logo_url) {
      await deleteOrphans([initialLogoUrl]);
    }

    setPendingDirtyLogos([]);

    if (mode === 'create') {
      // Create mode: redirect ke list (broker baru belum punya halaman edit di URL ini)
      router.push('/admin/brokers');
      router.refresh();
      return;
    }

    // Edit mode: stay di page + refresh form dengan data terbaru dari server
    if (payload?.broker) {
      setForm(payload.broker);
    }
    setSubmitting(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
    router.refresh();
  }

  const hasUnsavedLogo = pendingDirtyLogos.length > 0;

  return (
    <form onSubmit={handleSubmit} className="max-w-full">
      {/* Toast "Saved" — fixed di pojok kanan atas */}
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
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'mtr-toast-in 0.2s ease-out',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Changes saved
        </div>
      )}
      <style jsx>{`
        @keyframes mtr-toast-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {error && (
        <div
          className="mb-4 p-3 rounded"
          style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E' }}
        >
          {error}
        </div>
      )}

      {/* TABS NAV — single row, horizontal scroll kalau sempit, raised card style */}
      <div className="mb-4 -mx-1 px-1 overflow-x-auto mtr-tabs-scroll">
        <div className="flex gap-2 min-w-max pb-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className="relative px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: isActive ? '#0F1825' : '#0A1220',
                  color: isActive ? '#00A86B' : '#7A8FA6',
                  border: isActive ? '1px solid #00A86B' : '1px solid #1A2E45',
                  boxShadow: isActive
                    ? '0 0 0 1px rgba(0, 168, 107, 0.15), 0 4px 12px rgba(0, 168, 107, 0.1)'
                    : 'none',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: '50%',
                      bottom: -2,
                      transform: 'translateX(-50%)',
                      width: 20,
                      height: 2,
                      background: '#00A86B',
                      borderRadius: 2,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .mtr-tabs-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .mtr-tabs-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .mtr-tabs-scroll::-webkit-scrollbar-thumb {
          background: #1a2e45;
          border-radius: 4px;
        }
      `}</style>

      {/* ===================== BASIC ===================== */}
      {activeTab === 'basic' && (
        <>
          <Section title="Basic Info">
            <Field label="Name *">
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => setField('name', e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Legal Name">
              <input
                type="text"
                value={form.legal_name || ''}
                onChange={(e) => setField('legal_name', e.target.value || null)}
                style={inputStyle}
              />
            </Field>
            <Field label="Founded (year)">
              <input
                type="text"
                value={form.founded_approx || ''}
                onChange={(e) => setField('founded_approx', e.target.value || null)}
                style={inputStyle}
              />
            </Field>
            <Field label="HQ Country">
              <input
                type="text"
                value={form.hq_country || ''}
                onChange={(e) => setField('hq_country', e.target.value || null)}
                style={inputStyle}
              />
            </Field>
            <Field label="Brand Color (hex, e.g. #00A86B)">
              <input
                type="text"
                value={form.color || ''}
                onChange={(e) => setField('color', e.target.value || null)}
                style={inputStyle}
                placeholder="#00A86B"
              />
            </Field>
          </Section>

          {/* Logo upload */}
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
              Logo <span style={{ color: '#7A8FA6', fontWeight: 400 }}>(optional)</span>
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center overflow-hidden"
                style={{
                  width: 80,
                  height: 80,
                  background: '#0A1220',
                  border: '1px solid #1A2E45',
                  borderRadius: 16,
                }}
              >
                {form.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: '#7A8FA6', fontSize: 11 }}>No logo</span>
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                  style={{ display: 'none' }}
                  id="logo-file-input"
                />
                <div className="flex gap-2 flex-wrap">
                  <label
                    htmlFor="logo-file-input"
                    className="px-3 py-2 rounded text-sm font-medium cursor-pointer"
                    style={{
                      background: logoUploading ? '#1A2E45' : '#00A86B',
                      color: '#fff',
                      opacity: logoUploading ? 0.6 : 1,
                      pointerEvents: logoUploading ? 'none' : 'auto',
                    }}
                  >
                    {logoUploading ? 'Uploading...' : form.logo_url ? 'Replace' : 'Choose file'}
                  </label>
                  {form.logo_url && !logoUploading && (
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className="px-3 py-2 rounded text-sm"
                      style={{
                        background: 'transparent',
                        color: '#E53E3E',
                        border: '1px solid #E53E3E',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs mt-2" style={{ color: '#7A8FA6' }}>
                  PNG, JPG, WEBP, atau SVG. Max 2MB. Kalau kosong, otomatis pake Clearbit/favicon.
                </p>
                {hasUnsavedLogo && (
                  <p className="text-xs mt-1" style={{ color: '#D69E2E' }}>
                    ⚠ Logo belum tersimpan. Klik &quot;Save Changes&quot; untuk simpan.
                  </p>
                )}
                {logoError && (
                  <p className="text-xs mt-1" style={{ color: '#E53E3E' }}>
                    {logoError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===================== RANKING & SCORE ===================== */}
      {activeTab === 'ranking' && (
        <Section title="Ranking & Score">
          <Field label="Rank">
            <input
              type="number"
              value={form.rank ?? ''}
              onChange={(e) => setField('rank', e.target.value ? parseInt(e.target.value, 10) : null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Score (0-10)">
            <input
              type="text"
              inputMode="decimal"
              value={
                form.score !== null && form.score !== undefined
                  ? Number(form.score).toFixed(3)
                  : ''
              }
              onChange={(e) => setField('score', e.target.value ? Number(e.target.value).toFixed(3) as any : null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Regulation Tier">
            <select
              value={form.regulation_tier || ''}
              onChange={(e) => setField('regulation_tier', e.target.value || null)}
              style={inputStyle}
            >
              <option value="">— Unrated —</option>
              <option value="Tier-1">Tier-1</option>
              <option value="Tier-2">Tier-2</option>
              <option value="Tier-3">Tier-3</option>
            </select>
          </Field>
          <Field label="Regulation (comma-separated, e.g. FCA, ASIC)">
            <input
              type="text"
              defaultValue={(form.regulation || []).join(', ')}
              onBlur={(e) => setArrayField('regulation', e.target.value, ',')}
              style={inputStyle}
            />
          </Field>
        </Section>
      )}

      {/* ===================== CONTACT ===================== */}
      {activeTab === 'contact' && (
        <Section title="Contact">
          <Field label="Address">
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => setField('address', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Phone">
            <input
              type="text"
              value={form.phone || ''}
              onChange={(e) => setField('phone', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email || ''}
              onChange={(e) => setField('email', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
        </Section>
      )}

      {/* ===================== TRADING ===================== */}
      {activeTab === 'trading' && (
        <Section title="Trading">
          <Field label="EUR/USD Spread">
            <input
              type="number"
              step="0.01"
              value={form.eur_usd_spread ?? ''}
              onChange={(e) =>
                setField('eur_usd_spread', e.target.value ? parseFloat(e.target.value) : null)
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Min Deposit (USD)">
            <input
              type="number"
              value={form.min_deposit ?? ''}
              onChange={(e) =>
                setField('min_deposit', e.target.value ? parseInt(e.target.value, 10) : null)
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Max Leverage (e.g. 500 → 1:500)">
            <input
              type="number"
              value={form.max_leverage ?? ''}
              onChange={(e) =>
                setField('max_leverage', e.target.value ? parseInt(e.target.value, 10) : null)
              }
              style={inputStyle}
            />
          </Field>
          <Field label="Commission">
            <input
              type="text"
              value={form.commission || ''}
              onChange={(e) => setField('commission', e.target.value || null)}
              style={inputStyle}
              placeholder="e.g. $7 per lot"
            />
          </Field>
          <Field label="Instruments (comma-separated)">
            <input
              type="text"
              defaultValue={
                Array.isArray(form.instruments)
                  ? form.instruments.join(', ')
                  : form.instruments || ''
              }
              onBlur={(e) => setField('instruments', (e.target.value || null) as any)}
              style={inputStyle}
              placeholder="e.g. Forex, CFDs, Stocks"
            />
          </Field>
          <Field label="Account Types (comma-separated)">
            <input
              type="text"
              defaultValue={(form.account_type || []).join(', ')}
              onBlur={(e) => setArrayField('account_type', e.target.value, ',')}
              style={inputStyle}
              placeholder="e.g. STP, ECN, Market Maker"
            />
          </Field>
          <Field label="Platforms (comma-separated)">
            <input
              type="text"
              defaultValue={(form.platforms || []).join(', ')}
              onBlur={(e) => setArrayField('platforms', e.target.value, ',')}
              style={inputStyle}
              placeholder="e.g. MT4, MT5, cTrader"
            />
          </Field>
        </Section>
      )}

      {/* ===================== SPREADS & WITHDRAWAL ===================== */}
      {activeTab === 'spreadsWithdrawal' && (
        <Section title="Spreads & Withdrawal">
          <Field label="Spreads From">
            <input
              type="text"
              value={form.spreads_from || ''}
              onChange={(e) => setField('spreads_from', e.target.value || null)}
              style={inputStyle}
              placeholder="e.g. 0.1 pips"
            />
          </Field>
          <Field label="Spreads Note">
            <input
              type="text"
              value={form.spreads_note || ''}
              onChange={(e) => setField('spreads_note', e.target.value || null)}
              style={inputStyle}
              placeholder="e.g. Standard account"
            />
          </Field>
          <Field label="Withdrawal Time">
            <input
              type="text"
              value={form.withdrawal_time || ''}
              onChange={(e) => setField('withdrawal_time', e.target.value || null)}
              style={inputStyle}
              placeholder="e.g. 1-3 business days"
            />
          </Field>
          <Field label="Withdrawal Note">
            <input
              type="text"
              value={form.withdrawal_note || ''}
              onChange={(e) => setField('withdrawal_note', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
        </Section>
      )}

      {/* ===================== FEATURES ===================== */}
      {activeTab === 'features' && (
        <Section title="Features">
          <Field label="Copy Trading">
            <input
              type="text"
              value={form.copy_trading || ''}
              onChange={(e) => setField('copy_trading', e.target.value || null)}
              style={inputStyle}
              placeholder="Yes / No / Available"
            />
          </Field>
          <Field label="Copy Trading Note">
            <input
              type="text"
              value={form.copy_trading_note || ''}
              onChange={(e) => setField('copy_trading_note', e.target.value || null)}
              style={inputStyle}
              placeholder="e.g. via ZuluTrade, DupliTrade"
            />
          </Field>
          <Field label="Demo Account">
            <input
              type="text"
              value={form.demo_account || ''}
              onChange={(e) => setField('demo_account', e.target.value || null)}
              style={inputStyle}
              placeholder="Yes / No / Available"
            />
          </Field>
          <Field label="Demo Account Note">
            <input
              type="text"
              value={form.demo_account_note || ''}
              onChange={(e) => setField('demo_account_note', e.target.value || null)}
              style={inputStyle}
              placeholder="e.g. 21-day default"
            />
          </Field>
        </Section>
      )}

      {/* ===================== NOTES ===================== */}
      {activeTab === 'notes' && (
        <Section title="Notes (penjelasan singkat tiap field)">
          <Field label="Min Deposit Note">
            <input
              type="text"
              value={form.min_deposit_note || ''}
              onChange={(e) => setField('min_deposit_note', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Leverage Note">
            <input
              type="text"
              value={form.leverage_note || ''}
              onChange={(e) => setField('leverage_note', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Regulation Note">
            <input
              type="text"
              value={form.regulation_note || ''}
              onChange={(e) => setField('regulation_note', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Broker Type Note">
            <input
              type="text"
              value={form.broker_type_note || ''}
              onChange={(e) => setField('broker_type_note', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Instruments Note">
            <input
              type="text"
              value={form.instruments_note || ''}
              onChange={(e) => setField('instruments_note', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Founded Note">
            <input
              type="text"
              value={form.founded_note || ''}
              onChange={(e) => setField('founded_note', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Platform Note">
            <input
              type="text"
              value={form.platform_note || ''}
              onChange={(e) => setField('platform_note', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
        </Section>
      )}

      {/* ===================== WEB & CONTACT URLS ===================== */}
      {activeTab === 'web' && (
        <Section title="Web URLs">
          <Field label="Website">
            <input
              type="url"
              value={form.website || ''}
              onChange={(e) => setField('website', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
          <Field label="Affiliate URL">
            <input
              type="url"
              value={form.affiliate_url || ''}
              onChange={(e) => setField('affiliate_url', e.target.value || null)}
              style={inputStyle}
            />
          </Field>
        </Section>
      )}

      {/* ===================== CONTENT (rich text) ===================== */}
      {activeTab === 'content' && (
        <SingleColSection title="Content">
          <FullField label="Quick Verdict">
            <RichTextEditor
              value={Array.isArray(form.quick_verdict) ? form.quick_verdict : (form.quick_verdict ? [form.quick_verdict] : [])}
              onChange={(items) => setField('quick_verdict', (items.join(' ') || null) as any)}
              minHeight={80}
            />
          </FullField>
          <FullField label="Description">
            <RichTextEditor
              value={Array.isArray(form.description) ? form.description : (form.description ? [form.description] : [])}
              onChange={(items) => setField('description', (items.join('\n') || null) as any)}
              minHeight={150}
            />
          </FullField>
          <FullField label="Pros (1 item per bullet)">
            <RichTextEditor
              value={form.pros || []}
              onChange={(items) => setField('pros', items.length ? items : null)}
              minHeight={120}
            />
          </FullField>
          <FullField label="Cons (1 item per bullet)">
            <RichTextEditor
              value={form.cons || []}
              onChange={(items) => setField('cons', items.length ? items : null)}
              minHeight={120}
            />
          </FullField>
        </SingleColSection>
      )}

      {/* ===================== PAYMENTS ===================== */}
      {activeTab === 'payments' && (
        <Section title="Payments">
          <Field label="Payment Methods (comma-separated)">
            <input
              type="text"
              defaultValue={(form.payment_methods || []).join(', ')}
              onBlur={(e) => setArrayField('payment_methods', e.target.value, ',')}
              style={inputStyle}
              placeholder="e.g. Visa, Mastercard, Skrill, Neteller"
            />
          </Field>
        </Section>
      )}

      {/* ===================== TRUST ===================== */}
      {activeTab === 'trust' && (
        <SingleColSection title="Trust">
          <FullField label="Trustpilot Score">
            <input
              type="text"
              value={form.trust_pilot_score || ''}
              onChange={(e) => setField('trust_pilot_score', e.target.value || null)}
              style={inputStyle}
              placeholder="e.g. 4.2/5"
            />
          </FullField>
          <FullField label="Awards (1 item per bullet)">
            <RichTextEditor
              value={form.awards || []}
              onChange={(items) => setField('awards', items.length ? items : null)}
              minHeight={100}
            />
          </FullField>
          <FullField label="Trust Signals (1 item per bullet)">
            <RichTextEditor
              value={form.trust_signals || []}
              onChange={(items) => setField('trust_signals', items.length ? items : null)}
              minHeight={100}
            />
          </FullField>
        </SingleColSection>
      )}

      {/* ===================== OFFER ===================== */}
      {activeTab === 'offer' && (
        <SingleColSection title="Offer">
          <FullField label="Offer Title">
            <input
              type="text"
              value={form.offer_title || ''}
              onChange={(e) => setField('offer_title', e.target.value || null)}
              style={inputStyle}
            />
          </FullField>
          <FullField label="Offer Description">
            <RichTextEditor
              value={Array.isArray(form.offer_desc) ? form.offer_desc : (form.offer_desc ? [form.offer_desc] : [])}
              onChange={(items) => setField('offer_desc', (items.join('\n') || null) as any)}
              minHeight={100}
            />
          </FullField>
          <FullField label="Offer Note">
            <input
              type="text"
              value={form.offer_note || ''}
              onChange={(e) => setField('offer_note', e.target.value || null)}
              style={inputStyle}
            />
          </FullField>
          <FullField label="Offer URL">
            <input
              type="url"
              value={form.offer_url || ''}
              onChange={(e) => setField('offer_url', e.target.value || null)}
              style={inputStyle}
            />
          </FullField>
          <FullField label="Offer Label (CTA button)">
            <input
              type="text"
              value={form.offer_label || ''}
              onChange={(e) => setField('offer_label', e.target.value || null)}
              style={inputStyle}
              placeholder="e.g. Get Bonus"
            />
          </FullField>
        </SingleColSection>
      )}

      {/* ===================== VISIBILITY ===================== */}
      {activeTab === 'visibility' && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
            Visibility
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Status">
              <select
                value={form.status || 'legitimate'}
                onChange={(e) => setField('status', e.target.value)}
                style={inputStyle}
              >
                <option value="legitimate">Legitimate</option>
                <option value="warning">Warning</option>
                <option value="scam">Scam</option>
                <option value="delisted">Delisted</option>
                <option value="institution">Institution</option>
              </select>
            </Field>
            <Field label="Warning Reason">
              <input
                type="text"
                value={form.warning_reason || ''}
                onChange={(e) => setField('warning_reason', e.target.value || null)}
                style={inputStyle}
                placeholder="(opsional, kalau status warning/scam)"
              />
            </Field>
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #1A2E45' }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.is_published}
                onChange={(e) => setField('is_published', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#00A86B' }}
              />
              <span style={{ color: '#E8EDF4', fontSize: 14 }}>
                Tampilkan di website publik
              </span>
            </label>
          </div>
        </div>
      )}

      {/* ===================== SUBMIT BUTTONS ===================== */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded font-medium disabled:opacity-50"
          style={{ background: '#00A86B', color: '#fff' }}
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Create Broker' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 rounded"
          style={{ background: '#1A2E45', color: '#E8EDF4' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0A1220',
  border: '1px solid #1A2E45',
  color: '#E8EDF4',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.375rem',
};

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

function SingleColSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mb-6 p-4 rounded-xl"
      style={{ background: '#0F1825', border: '1px solid #1A2E45' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#00A86B' }}>
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function FullField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
