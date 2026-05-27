'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function IbAffiliateForm({ broker, mode, brokersList }: { broker?: any; mode: 'create' | 'edit'; brokersList: any[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // FORM STATE
  const [form, setForm] = useState<any>(broker || { is_published: true, net_deposit: false, custom_hybrid: false, categories: [] });
  function setField(key: string, value: any) { setForm((f: any) => ({ ...f, [key]: value })); }
  function setArrayField(key: string, raw: string) {
    const arr = raw.split(',').map((s) => s.trim()).filter(Boolean);
    setField(key, arr.length ? arr : []);
  }

  // DROPDOWN MAGIC STATE
  const [search, setSearch] = useState('');
  const [selectedBrokerUuid, setSelectedBrokerUuid] = useState(broker?.broker_uuid || '');
  const [isNewBroker, setIsNewBroker] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Set initial search value for edit mode
  useEffect(() => {
    if (mode === 'edit' && broker?.broker_uuid) {
      const found = brokersList.find(b => b.uuid === broker.broker_uuid);
      if (found) setSearch(found.name);
    } else if (mode === 'edit' && !broker?.broker_uuid && broker?.name) {
      // Handle orphan data case
      setSearch(broker.name);
    }
  }, [mode, broker, brokersList]);

  // Filter brokers
  const filteredBrokers = useMemo(() => {
    if (!search) return brokersList.slice(0, 30);
    const q = search.toLowerCase();
    return brokersList.filter(b => b.name.toLowerCase().includes(q)).slice(0, 30);
  }, [brokersList, search]);

  const exactMatch = brokersList.some(b => b.name.toLowerCase() === search.toLowerCase());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    
    // Prepare Payload
    const payload = { ...form };
    delete payload.brokers; // Clean up relation data before submit
    
    // Auto-create new broker logic
    if (isNewBroker) {
      payload.broker_uuid = null;
      payload.new_broker_name = search; 
    } else {
      payload.broker_uuid = selectedBrokerUuid;
    }

    const url = mode === 'create' ? '/api/admin/ib-affiliates' : `/api/admin/ib-affiliates/${broker!.uuid}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/admin/ib-affiliates');
      router.refresh();
    } else {
      const errorData = await res.json();
      alert(`Failed to save: ${errorData.error || 'Unknown error'}`);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      
      {/* 1. MASTER BROKER LINK (Select2 Custom) */}
      <div className="p-4 rounded-xl" style={{ background: '#0F1825', border: '1px solid #1A2E45' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#00A86B' }}>1. Master Broker Link</h3>
        <div className="relative">
          <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Link to Master Broker *</label>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedBrokerUuid('');
              setIsNewBroker(false);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Search broker name..." 
            className="w-full px-3 py-2 rounded" 
            style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} 
            required={!selectedBrokerUuid && !isNewBroker}
          />
          
          {dropdownOpen && (
            <div className="absolute z-10 w-full mt-1 rounded max-h-60 overflow-y-auto" style={{ background: '#0A1220', border: '1px solid #1A2E45' }}>
              {filteredBrokers.map(b => (
                <button
                  key={b.uuid} type="button"
                  onClick={() => { setSelectedBrokerUuid(b.uuid); setSearch(b.name); setIsNewBroker(false); setDropdownOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm hover:opacity-80"
                  style={{ color: '#E8EDF4' }}
                >
                  {b.name} <span style={{ color: b.is_published ? '#00A86B' : '#E53E3E', fontSize: '0.7rem', marginLeft: '5px' }}>{b.is_published ? '(Published)' : '(Hidden)'}</span>
                </button>
              ))}
              
              {/* TOMBOL AUTO-CREATE JIKA TIDAK ADA EXACT MATCH */}
              {search && !exactMatch && (
                <button
                  type="button"
                  onClick={() => { setIsNewBroker(true); setSelectedBrokerUuid(''); setDropdownOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm font-bold"
                  style={{ color: '#00A86B', borderTop: '1px solid #1A2E45', background: '#0F1825' }}
                >
                  + Create "{search}" as a new hidden broker
                </button>
              )}
            </div>
          )}
          
          {/* Status Text Bawah */}
          <div className="mt-2 text-xs">
            {isNewBroker ? (
              <span style={{ color: '#00A86B' }}>✔ Will create a new hidden master broker: <b>{search}</b></span>
            ) : selectedBrokerUuid ? (
              <span style={{ color: '#00A86B' }}>✔ Linked to UUID: {selectedBrokerUuid.split('-')[0]}...</span>
            ) : (
              <span style={{ color: '#E53E3E' }}>Please select or create a broker.</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. IB DETAILS */}
      <div className="p-4 rounded-xl" style={{ background: '#0F1825', border: '1px solid #1A2E45' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#00A86B' }}>2. Display Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Display Name (Can be different from Master)</label>
            <input type="text" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} required className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Ticker (Can be different)</label>
            <input type="text" value={form.ticker || ''} onChange={(e) => setField('ticker', e.target.value)} required className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Type (e.g. STP, ECN)</label>
            <input type="text" value={form.type || ''} onChange={(e) => setField('type', e.target.value)} className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Regulation (e.g. FCA, ASIC)</label>
            <input type="text" value={form.regulation || ''} onChange={(e) => setField('regulation', e.target.value)} className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
        </div>
      </div>

      {/* 3. COMMISSION RATES */}
      <div className="p-4 rounded-xl" style={{ background: '#0F1825', border: '1px solid #1A2E45' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#00A86B' }}>3. Commission & Rank</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>CPA (e.g. Up to $800)</label>
            <input type="text" value={form.cpa || ''} onChange={(e) => setField('cpa', e.target.value)} className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Rebate / Lot (e.g. Up to $15)</label>
            <input type="text" value={form.rebate || ''} onChange={(e) => setField('rebate', e.target.value)} className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Rev Share (e.g. Up to 50%)</label>
            <input type="text" value={form.rev_share || ''} onChange={(e) => setField('rev_share', e.target.value)} className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Rank (Table Sort Order)</label>
            <input type="number" value={form.rank || ''} onChange={(e) => setField('rank', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
        </div>
      </div>

      {/* 4. SETTINGS & LABELS */}
      <div className="p-4 rounded-xl" style={{ background: '#0F1825', border: '1px solid #1A2E45' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#00A86B' }}>4. Badges & Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm text-[#E8EDF4]">
            <input type="checkbox" checked={!!form.net_deposit} onChange={(e) => setField('net_deposit', e.target.checked)} style={{ accentColor: '#00A86B' }} /> Net Deposit Requirement
          </label>
          <label className="flex items-center gap-2 text-sm text-[#E8EDF4]">
            <input type="checkbox" checked={!!form.custom_hybrid} onChange={(e) => setField('custom_hybrid', e.target.checked)} style={{ accentColor: '#00A86B' }} /> Custom/Hybrid Deal
          </label>
          <label className="flex items-center gap-2 text-sm text-[#E8EDF4]">
            <input type="checkbox" checked={!!form.is_published} onChange={(e) => setField('is_published', e.target.checked)} style={{ accentColor: '#00A86B' }} /> Publish to Website
          </label>
          <div>
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Badge (e.g. top-cpa)</label>
            <input type="text" value={form.badge || ''} onChange={(e) => setField('badge', e.target.value)} className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-1" style={{ color: '#7A8FA6' }}>Categories Filter (comma separated: cpa, rebate, revshare)</label>
            <input type="text" defaultValue={(form.categories || []).join(', ')} onBlur={(e) => setArrayField('categories', e.target.value)} className="w-full px-3 py-2 rounded" style={{ background: '#0A1220', border: '1px solid #1A2E45', color: '#E8EDF4' }} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={submitting || (!selectedBrokerUuid && !isNewBroker)} className="px-6 py-3 rounded font-medium disabled:opacity-50" style={{ background: '#00A86B', color: '#fff' }}>
        {submitting ? 'Saving...' : 'Save IB Affiliate'}
      </button>

    </form>
  );
}