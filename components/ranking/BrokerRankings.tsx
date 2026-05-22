'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import BrokerCard from '../broker/BrokerCard';
import { useVoteRealtime } from '@/lib/vote/useVoteRealtime';

interface Props {
  initialBrokers: any[];
}

// HIDDEN: statusOptions — kalau bos minta balik, uncomment di JSX bawah
// const statusOptions = [
//   { value: '', label: 'All Status' },
//   { value: 'legitimate', label: 'Retail Brokers' },
//   { value: 'institution', label: 'Institutions' },
// ];

/* =====================================================
   CUSTOM SEARCHABLE DROPDOWN
   ===================================================== */
interface CustomDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  id: string;
  placeholder: string;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

function CustomDropdown({ options, value, onChange, id, placeholder, activeDropdown, setActiveDropdown }: CustomDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = activeDropdown === id;
  const [localSearch, setLocalSearch] = useState('');

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    if (!isOpen) setLocalSearch('');
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setActiveDropdown]);

  const filteredOptions = useMemo(() => {
    return options.filter(opt =>
      opt.label.toLowerCase().includes(localSearch.toLowerCase())
    );
  }, [options, localSearch]);

  return (
    <div ref={dropdownRef} className="relative flex-1 min-w-[140px] max-[680px]:min-w-0 max-[680px]:basis-0 font-['Gantari'] select-none">
      <div
        onClick={() => setActiveDropdown(isOpen ? null : id)}
        className={`
          w-full h-[36px] px-3 max-[680px]:px-1.5 rounded-lg bg-[var(--mtr-inner)] border text-[12px] max-[680px]:text-[11px] font-medium text-[var(--mtr-text)]
          flex items-center justify-between cursor-pointer transition-all duration-200
          ${isOpen ? 'border-[var(--mtr-green)] shadow-[0_0_10px_rgba(0,168,107,0.1)]' : 'border-[var(--mtr-border-lt)] hover:border-[var(--mtr-green)]'}
        `}
      >
        <span className="truncate max-[680px]:pr-1">{selectedOption.label}</span>
        <svg 
          className={`w-2.5 h-2.5 text-[var(--mtr-muted)] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--mtr-green)]' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 10 6" 
          fill="none"
        >
          <path d="M0 0l5 6 5-6z" fill="currentColor"/>
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-[var(--mtr-inner)] border border-[var(--mtr-green)] rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden max-[680px]:min-w-[120px]">
          <div className="p-2 border-b border-[var(--mtr-border-lt)] bg-[rgba(255,255,255,0.02)]">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={`Search ${placeholder}...`}
              className="w-full h-7 px-2 bg-[var(--mtr-card)] border border-[var(--mtr-border-lt)] focus:border-[var(--mtr-green)] rounded text-[11px] text-[var(--mtr-text)] outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="max-h-[180px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--mtr-border-lt)] [&::-webkit-scrollbar-thumb]:rounded-md">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-[11px] text-[var(--mtr-muted)] text-center">No results found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setActiveDropdown(null);
                    }}
                    className={`
                      px-3 py-2 text-[12px] max-[680px]:text-[11px] cursor-pointer transition-colors duration-150 truncate
                      ${isSelected 
                        ? 'bg-[rgba(0,168,107,0.08)] text-[var(--mtr-green)] font-semibold' 
                        : 'text-[var(--mtr-text)] hover:bg-[rgba(0,168,107,0.15)] hover:text-[var(--mtr-green)]'}
                    `}
                  >
                    {opt.label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
   ===================================================== */
export default function BrokerRankings({ initialBrokers }: Props) {
  const [search, setSearch] = useState('');
  // HIDDEN: tier & status state — kalau bos minta balik, uncomment
  // const [tier, setTier] = useState('');
  // const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');
  const [sortField, setSortField] = useState('score');
  const [sortDir, setSortDir] = useState<{ [key: string]: 'asc' | 'desc' }>({
    rank: 'asc',
    score: 'desc',
    popular: 'desc',
    name: 'asc',
    min_deposit: 'asc',
    leverage: 'desc',
    spreads: 'asc',
    instruments: 'desc',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [liveVotes, setLiveVotes] = useState<Record<string, number>>({});

  const handleVoteUpdate = useCallback((uuid: string, totalVotes: number) => {
    setLiveVotes(prev => ({ ...prev, [uuid]: totalVotes }));
  }, []);
  useVoteRealtime(handleVoteUpdate);

  // HIDDEN: dynamicTiers — uncomment kalau Tier dropdown dipake lagi
  // const dynamicTiers = useMemo(() => {
  //   const uniqueTiers = new Set(initialBrokers.map(b => b.regulation_tier).filter(Boolean));
  //   const options = Array.from(uniqueTiers).sort().map(t => ({ value: t, label: t }));
  //   return [{ value: '', label: 'All Tiers' }, ...options];
  // }, [initialBrokers]);

  const dynamicRegions = useMemo(() => {
    const uniqueRegions = new Set(initialBrokers.map(b => b.hq_country).filter(Boolean));
    const options = Array.from(uniqueRegions).sort().map(r => ({ value: r, label: r }));
    return [{ value: '', label: 'All Regions' }, ...options];
  }, [initialBrokers]);

  const getVoteCount = useCallback((broker: any): number => {
    if (liveVotes[broker.uuid] !== undefined) return liveVotes[broker.uuid];
    return broker.total_votes ?? 0;
  }, [liveVotes]);

  // Helper: parse instruments string ke angka (utk sort)
  const parseInstrumentsCount = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const str = String(val);
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // LOGIC FINAL: KALKULASI RANKING GLOBAL BERDASARKAN SCORE TERTINGGI (100% AMAN & CEPAT)
  const globalRankMap = useMemo(() => {
    const sorted = [...initialBrokers].sort((a, b) => {
      const diff = (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0);
      if (diff === 0) return (a.name || '').localeCompare(b.name || '');
      return diff;
    });
    const map: Record<string, number> = {};
    sorted.forEach((b, index) => {
      if (b.uuid) map[b.uuid] = index + 1;
    });
    return map;
  }, [initialBrokers]);

  const getMedal = useCallback((uuid: string) => {
    const rank = globalRankMap[uuid];
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return null;
  }, [globalRankMap]);

  // Main Filter & Sort Logic
  const filteredBrokers = useMemo(() => {
    let result = initialBrokers.filter(b => {
      // HIDDEN: filter status & tier — uncomment kalau dropdown balik
      // const bStatus = b.status || '';
      // const bTier = b.regulation_tier || '';
      // if (status && bStatus !== status) return false;
      // if (tier && bTier !== tier) return false;
      
      const bCountry = b.hq_country || '';
      const bName = b.name || '';
      
      if (region && bCountry !== region) return false;
      if (search && ![bName, b.legal_name, bCountry].join(' ').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    result.sort((a, b) => {
      const nameTiebreak = (a.name || '').localeCompare(b.name || '');

      if (sortField === 'score') {
        const diff = (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0);
        if (diff !== 0) return sortDir.score === 'desc' ? diff : -diff;
        return nameTiebreak;
      }
      if (sortField === 'popular') {
        const diff = getVoteCount(b) - getVoteCount(a);
        if (diff !== 0) return sortDir.popular === 'desc' ? diff : -diff;
        return nameTiebreak;
      }
      if (sortField === 'name') {
        return sortDir.name === 'asc' ? nameTiebreak : -nameTiebreak;
      }
      if (sortField === 'min_deposit') {
        const aVal = parseFloat(a.min_deposit);
        const bVal = parseFloat(b.min_deposit);
        const aNaN = isNaN(aVal);
        const bNaN = isNaN(bVal);
        // Null/NaN dilempar ke belakang
        if (aNaN && bNaN) return nameTiebreak;
        if (aNaN) return 1;
        if (bNaN) return -1;
        const diff = aVal - bVal;
        if (diff !== 0) return sortDir.min_deposit === 'asc' ? diff : -diff;
        return nameTiebreak;
      }
      if (sortField === 'leverage') {
        const aVal = parseFloat(a.max_leverage);
        const bVal = parseFloat(b.max_leverage);
        const aNaN = isNaN(aVal);
        const bNaN = isNaN(bVal);
        if (aNaN && bNaN) return nameTiebreak;
        if (aNaN) return 1;
        if (bNaN) return -1;
        const diff = bVal - aVal;
        if (diff !== 0) return sortDir.leverage === 'desc' ? diff : -diff;
        return nameTiebreak;
      }
      if (sortField === 'spreads') {
        const aVal = parseFloat(a.eur_usd_spread);
        const bVal = parseFloat(b.eur_usd_spread);
        const aNaN = isNaN(aVal);
        const bNaN = isNaN(bVal);
        if (aNaN && bNaN) return nameTiebreak;
        if (aNaN) return 1;
        if (bNaN) return -1;
        const diff = aVal - bVal;
        if (diff !== 0) return sortDir.spreads === 'asc' ? diff : -diff;
        return nameTiebreak;
      }
      if (sortField === 'instruments') {
        const aVal = parseInstrumentsCount(a.instruments);
        const bVal = parseInstrumentsCount(b.instruments);
        if (aVal === 0 && bVal === 0) return nameTiebreak;
        if (aVal === 0) return 1;
        if (bVal === 0) return -1;
        const diff = bVal - aVal;
        if (diff !== 0) return sortDir.instruments === 'desc' ? diff : -diff;
        return nameTiebreak;
      }
      return 0; 
    });

    return result;
  }, [initialBrokers, search, region, sortField, sortDir, getVoteCount]);

  const total = filteredBrokers.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentBrokers = filteredBrokers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => ({ ...prev, [field]: prev[field] === 'asc' ? 'desc' : 'asc' }));
    } else {
      setSortField(field);
    }
    setCurrentPage(1);
  };

  const currentYear = new Date().getFullYear();
  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const retailCount = initialBrokers.filter(r => (r.status || '') === 'legitimate').length;
  const uniqueCountries = new Set(initialBrokers.map(r => r.hq_country).filter(Boolean)).size;

  return (
    <div className="mtr-rankings-wrap">
      <div className="mtr-main-hero">
        <div className="mtr-hero-badge">✦ Updated <span>{currentMonthYear}</span></div>
        <h1>Global Broker Rankings <span>{currentYear}</span></h1>
        <p>Independent rankings of 590+ regulated brokers worldwide. Compare regulation, spreads, platforms and fees. No paid placements.</p>
        <div className="mtr-hero-stats">
          <div className="mtr-hero-stat">
            <span className="mtr-hero-stat-num"><b>{retailCount}</b></span>
            <span className="mtr-hero-stat-label">Retail Brokers</span>
          </div>
          <div className="mtr-hero-stat">
            <span className="mtr-hero-stat-num"><b>{uniqueCountries}+</b></span>
            <span className="mtr-hero-stat-label">Countries</span>
          </div>
          <div className="mtr-hero-stat">
            <span className="mtr-hero-stat-num"><b>100%</b></span>
            <span className="mtr-hero-stat-label">Independent</span>
          </div>
        </div>
      </div>

      <div className="mtr-filters-wrap">
        <div className="mtr-filters">
          <div className="mtr-search-wrap">
            <svg className="mtr-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 9.5l2.8 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search broker name, regulator…" value={search} onChange={e => {setSearch(e.target.value); setCurrentPage(1);}} />
          </div>
          
          {/* HIDDEN: Tier dropdown — uncomment kalau bos minta balik
          <CustomDropdown id="tier" placeholder="tier" options={dynamicTiers} value={tier} onChange={(val) => { setTier(val); setCurrentPage(1); }} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
          */}
          
          <CustomDropdown id="region" placeholder="region" options={dynamicRegions} value={region} onChange={(val) => { setRegion(val); setCurrentPage(1); }} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
          
          {/* HIDDEN: Status dropdown — uncomment kalau bos minta balik
          <CustomDropdown id="status" placeholder="status" options={statusOptions} value={status} onChange={(val) => { setStatus(val); setCurrentPage(1); }} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />
          */}

          <div className="hidden max-[680px]:block basis-full h-0"></div>

          <div className="mtr-sort-group">
            <button className={`mtr-sort-btn ${sortField === 'score' ? 'active' : ''}`} onClick={() => handleSort('score')}>★ Score</button>
            <button className={`mtr-sort-btn ${sortField === 'popular' ? 'active' : ''}`} onClick={() => handleSort('popular')}>👍 Popular</button>
            <button className={`mtr-sort-btn ${sortField === 'name' ? 'active' : ''}`} onClick={() => handleSort('name')}>A–Z</button>
            <button className={`mtr-sort-btn ${sortField === 'min_deposit' ? 'active' : ''}`} onClick={() => handleSort('min_deposit')}>💵 Min Deposit</button>
            <button className={`mtr-sort-btn ${sortField === 'leverage' ? 'active' : ''}`} onClick={() => handleSort('leverage')}>⚡ Leverage</button>
            <button className={`mtr-sort-btn ${sortField === 'spreads' ? 'active' : ''}`} onClick={() => handleSort('spreads')}>📉 Spreads</button>
            <button className={`mtr-sort-btn ${sortField === 'instruments' ? 'active' : ''}`} onClick={() => handleSort('instruments')}>📊 Instruments</button>
          </div>
          <div className="mtr-count-label">{total} broker{total !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="mtr-rankings-list">
        {total === 0 ? (
          <div className="mtr-empty">No brokers match your filters.</div>
        ) : (
          currentBrokers.map((broker, idx) => (
            <BrokerCard 
              key={broker.uuid || idx} 
              broker={broker} 
              // TEMBAK RANK MURNI DARI PERINGKAT SCORE GLOBAL
              rank={globalRankMap[broker.uuid] || 0} 
              idx={idx}
              liveCount={liveVotes[broker.uuid]}
              medal={getMedal(broker.uuid)}
            />
          ))
        )}
      </div>

      {total > 0 && (
        <div className="mtr-pagination-wrap">
          <div className="mtr-pagination-info">
            <span className="mtr-info-desktop">Showing <b>{(currentPage - 1) * pageSize + 1}</b> to <b>{Math.min(currentPage * pageSize, total)}</b> of <b>{total}</b> brokers</span>
          </div>
          <div className="mtr-pagination-pages">
            <button className="mtr-pg-btn mtr-pg-prev" disabled={currentPage === 1} onClick={() => {setCurrentPage(p => p - 1); window.scrollTo({top: 200, behavior: 'smooth'});}}>&#8249;</button>
            <span className="mtr-pg-ellipsis">Page {currentPage} of {totalPages}</span>
            <button className="mtr-pg-btn mtr-pg-next" disabled={currentPage === totalPages} onClick={() => {setCurrentPage(p => p + 1); window.scrollTo({top: 200, behavior: 'smooth'});}}>&#8250;</button>
          </div>
          <div className="mtr-per-page-wrap">
            <span className="mtr-per-page-label">Show per page</span>
            <select className="mtr-per-page-select" value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setCurrentPage(1);}}>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}