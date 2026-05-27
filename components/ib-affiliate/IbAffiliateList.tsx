'use client';

import React, { useState, useMemo } from 'react';
import { IbAffiliate } from '@/types/ibAffiliate';

interface Props {
  initialPrograms: IbAffiliate[]; 
}

const MTR_COLORS = ['#00A86B','#0066FF','#7B2FBE','#E53E3E','#D69E2E','#0BC5EA','#F6AD55','#68D391','#F687B3','#76E4F7'];

export default function IbAffiliateList({ initialPrograms }: Props) {
  // --- Filter & Sort State ---
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortCol, setSortCol] = useState<string>('cpa');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // --- Pagination State (Initial Load di 20) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Helper Regex persis dari WP Elementor PHP Snippet
  const extractNum = (val: string | null) => {
    if (!val) return -1;
    const match = String(val).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : -1;
  };

  // 1. Logic Filter Data
  const filteredData = useMemo(() => {
    if (activeFilter === 'all') return initialPrograms;
    return initialPrograms.filter((b) => b.categories?.includes(activeFilter));
  }, [initialPrograms, activeFilter]);

  // 2. Logic Sort Data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const av = extractNum(a[sortCol as keyof IbAffiliate] as string | null);
      const bv = extractNum(b[sortCol as keyof IbAffiliate] as string | null);
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [filteredData, sortCol, sortDir]);

  // 3. Logic Paginate Data
  const total = sortedData.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentBrokers = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const handleFilter = (filterName: string) => {
    setActiveFilter(filterName);
    setCurrentPage(1);
  };

  return (
    <div id="mtr-ib-root" className="mtr-ib-page-wrap">
      
      {/* HERO SECTION */}
      <div className="mtr-ib-hero">
        <div className="mtr-ib-hero-inner">
          <div className="mtr-ib-hero-left">
            <div className="mtr-ib-hero-badge">
              <span className="mtr-ib-hero-badge-dot"></span>
              IB &amp; Affiliate Program
            </div>
            <h1 className="mtr-ib-hero-title">
              Institutional Rates.<br/>
              <span className="hl">Available to Everyone.</span>
            </h1>
            <p className="mtr-ib-hero-desc">
              We negotiate the deals brokers reserve for their biggest partners -
              then open them up to you. Pick a broker below and apply in under 2 minutes.
            </p>
            <div className="mtr-ib-hero-btns">
              <a href="#mtr-ib-table-section" className="mtr-ib-btn-primary">
                View broker deals →
              </a>
              {/*<a href="#" className="mtr-ib-btn-secondary">How it works</a>*/}
            </div>
          </div>

          <div className="mtr-ib-hero-right">
            <div className="mtr-ib-hero-grid">
              <div className="mtr-ib-hero-card">
                <div className="mtr-ib-hero-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
                <div>
                  <div className="mtr-ib-hero-card-stat">Up to $800</div>
                  <div className="mtr-ib-hero-card-label">CPA Per Client</div>
                </div>
              </div>
              <div className="mtr-ib-hero-card">
                <div className="mtr-ib-hero-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div>
                  <div className="mtr-ib-hero-card-stat">Up to $15/lot</div>
                  <div className="mtr-ib-hero-card-label">Rebate</div>
                </div>
              </div>
              <div className="mtr-ib-hero-card">
                <div className="mtr-ib-hero-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="var(--mtr-green)" strokeWidth="1.5" fill="none"/>
                    <path d="M12 12 L12 2 A10 10 0 0 1 22 12 Z" fill="var(--mtr-green)" fillOpacity="0.7"/>
                    <line x1="12" y1="2" x2="12" y2="12" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="12" y1="12" x2="22" y2="12" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="mtr-ib-hero-card-stat">Up to 50%</div>
                  <div className="mtr-ib-hero-card-label">Rev Share</div>
                </div>
              </div>
              <div className="mtr-ib-hero-card">
                <div className="mtr-ib-hero-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="5" cy="8" r="2.5"/><path d="M1 19c0-2.5 1.8-4 4-4"/>
                    <circle cx="12" cy="7" r="3"/><path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                    <circle cx="19" cy="8" r="2.5"/><path d="M23 19c0-2.5-1.8-4-4-4"/>
                  </svg>
                </div>
                <div>
                  <div className="mtr-ib-hero-card-stat">10+ brokers</div>
                  <div className="mtr-ib-hero-card-label">One Application</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mtr-ib-stats-strip">
          <div className="mtr-ib-stat-cell">
            <div className="mtr-ib-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/>
              </svg>
            </div>
            <div>
              <div className="mtr-ib-stat-num">+67%</div>
              <div className="mtr-ib-stat-label">More than going direct</div>
              <div className="mtr-ib-stat-desc">Rev share beats standard offers by avg 67%</div>
            </div>
          </div>
          <div className="mtr-ib-stat-cell">
            <div className="mtr-ib-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <div className="mtr-ib-stat-num">+$5</div>
              <div className="mtr-ib-stat-label">Extra per lot</div>
              <div className="mtr-ib-stat-desc">Where brokers offer $10, MTR partners get $15</div>
            </div>
          </div>
          <div className="mtr-ib-stat-cell">
            <div className="mtr-ib-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 10h8M8 14h5"/>
              </svg>
            </div>
            <div>
              <div className="mtr-ib-stat-num">1</div>
              <div className="mtr-ib-stat-label">Application, all brokers</div>
              <div className="mtr-ib-stat-desc">Apply once, unlock the full network</div>
            </div>
          </div>
          <div className="mtr-ib-stat-cell">
            <div className="mtr-ib-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z"/>
                <path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/>
              </svg>
            </div>
            <div>
              <div className="mtr-ib-stat-num">∞</div>
              <div className="mtr-ib-stat-label">Auto deal upgrades</div>
              <div className="mtr-ib-stat-desc">Rates improve as your volume grows</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="mtr-ib-table-section" id="mtr-ib-table-section">
        <h2 className="mtr-ib-section-title">Pick Your <span className="hl">Best Deal</span></h2>
        <p className="mtr-ib-section-desc">
          All rates are MTR partner rates — not what you'd get going direct.<br/>
          Filter by commission type or sort any column to find your best match.
        </p>

        <div className="mtr-ib-controls">
          <div className="mtr-ib-filters">
            <button className={`mtr-ib-filter-btn ${activeFilter === 'all' ? 'mtr-ib-filter-btn--active' : ''}`} onClick={() => handleFilter('all')}>All brokers</button>
            <button className={`mtr-ib-filter-btn ${activeFilter === 'cpa' ? 'mtr-ib-filter-btn--active' : ''}`} onClick={() => handleFilter('cpa')}>CPA</button>
            <button className={`mtr-ib-filter-btn ${activeFilter === 'rebate' ? 'mtr-ib-filter-btn--active' : ''}`} onClick={() => handleFilter('rebate')}>Rebate</button>
            <button className={`mtr-ib-filter-btn ${activeFilter === 'revshare' ? 'mtr-ib-filter-btn--active' : ''}`} onClick={() => handleFilter('revshare')}>Rev share</button>
            <button className={`mtr-ib-filter-btn ${activeFilter === 'custom' ? 'mtr-ib-filter-btn--active' : ''}`} onClick={() => handleFilter('custom')}>Custom/Hybrid</button>
          </div>
          <div className="mtr-ib-sorts">
            <span className="mtr-ib-sort-label">Sort by:</span>
            <button className={`mtr-ib-sort-btn ${sortCol === 'cpa' ? 'mtr-ib-sort-btn--active' : ''}`} onClick={() => handleSort('cpa')}>Highest CPA ↓</button>
            <button className={`mtr-ib-sort-btn ${sortCol === 'rebate' ? 'mtr-ib-sort-btn--active' : ''}`} onClick={() => handleSort('rebate')}>Highest rebate ↓</button>
            <button className={`mtr-ib-sort-btn ${sortCol === 'rev_share' ? 'mtr-ib-sort-btn--active' : ''}`} onClick={() => handleSort('rev_share')}>Highest rev share ↓</button>
          </div>
        </div>

        <div className="mtr-ib-wrap">
          <div className="mtr-ib-table-wrap">
            <table className="mtr-ib-table">
              <thead>
                <tr className="mtr-ib-thead-row">
                  <th className="mtr-ib-th mtr-ib-th--num">#</th>
                  <th className="mtr-ib-th mtr-ib-th--broker">Broker</th>
                  <th className={`mtr-ib-th mtr-ib-sortable ${sortCol === 'cpa' ? 'mtr-ib-th--active' : ''}`} onClick={() => handleSort('cpa')}>
                    CPA <span className="mtr-ib-sort-icon">{sortCol === 'cpa' && sortDir === 'asc' ? '↑' : '↓'}</span>
                  </th>
                  <th className={`mtr-ib-th mtr-ib-sortable ${sortCol === 'rebate' ? 'mtr-ib-th--active' : ''}`} onClick={() => handleSort('rebate')}>
                    Rebate / Lot <span className="mtr-ib-sort-icon">{sortCol === 'rebate' && sortDir === 'asc' ? '↑' : '↓'}</span>
                  </th>
                  <th className={`mtr-ib-th mtr-ib-sortable ${sortCol === 'rev_share' ? 'mtr-ib-th--active' : ''}`} onClick={() => handleSort('rev_share')}>
                    Rev Share <span className="mtr-ib-sort-icon">{sortCol === 'rev_share' && sortDir === 'asc' ? '↑' : '↓'}</span>
                  </th>
                  <th className="mtr-ib-th mtr-ib-th--center">Net Deposit</th>
                  <th className="mtr-ib-th mtr-ib-th--center">Custom/Hybrid</th>
                  <th className="mtr-ib-th mtr-ib-th--center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBrokers.length === 0 ? (
                  <tr><td colSpan={8} style={{color:'#7A8FA6', padding:'24px', textAlign:'center'}}>No broker data available.</td></tr>
                ) : (
                  currentBrokers.map((b, i) => {
                    const displayNum = (currentPage - 1) * pageSize + i + 1;
                    
                    // --- LOGIC LOGO (Numpang dari data table Brokers) ---
                    const domain = b.brokers?.domain || '';
                    const customLogo = b.brokers?.logo_url || null;
                    
                    const fallbackChain = customLogo
                      ? customLogo
                      : domain
                        ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
                        : null;
                        
                    const onErrorFallback = `this.onerror=null;this.style.display='none';`;
                    
                    const color = (b.brokers?.color && b.brokers?.color !== '--') 
                      ? b.brokers.color 
                      : MTR_COLORS[i % MTR_COLORS.length];

                    return (
                      <tr key={b.id} className="mtr-ib-row">
                        <td className="mtr-ib-td mtr-ib-td--num">{displayNum}</td>
                        <td className="mtr-ib-td mtr-ib-td--broker">
                          <div className="mtr-ib-broker-wrap">
                            
                            {fallbackChain ? (
                              <div 
                                className="mtr-ib-logo-box"
                                suppressHydrationWarning={true}
                                dangerouslySetInnerHTML={{
                                  __html: `<img src="${fallbackChain}" onerror="${onErrorFallback}" alt="${b.name}">`
                                }} 
                              />
                            ) : (
                              <div 
                                className="mtr-ib-logo-initial" 
                                style={{ background: color }}
                              >
                                {b.name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="mtr-ib-broker-cell">
                            {/*<div className="mtr-ib-ticker">{b.ticker}</div>*/}
                              <div>
                                <div className="mtr-ib-name">{b.name}</div>
                                <div className="mtr-ib-sub">{b.type} · {b.regulation}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="mtr-ib-td">
                          {b.cpa ? (
                            <>
                              <span className="mtr-ib-green">{b.cpa}</span>
                              {b.badge === 'top-cpa' && <span className="mtr-ib-badge mtr-ib-badge--red">Top CPA</span>}
                            </>
                          ) : <span className="mtr-ib-dash">—</span>}
                        </td>
                        <td className="mtr-ib-td">
                          {b.rebate ? (
                            <>
                              <span className="mtr-ib-green">{b.rebate}</span>
                              {b.badge === 'top-rebate' && <span className="mtr-ib-badge mtr-ib-badge--red">Top rebate</span>}
                            </>
                          ) : <span className="mtr-ib-dash">—</span>}
                        </td>
                        <td className="mtr-ib-td">
                          {b.rev_share ? <span className="mtr-ib-green">{b.rev_share}</span> : <span className="mtr-ib-dash">—</span>}
                        </td>
                        <td className="mtr-ib-td mtr-ib-td--center">
                          {b.net_deposit ? <span className="mtr-ib-yesno mtr-ib-yes">Yes</span> : <span className="mtr-ib-yesno mtr-ib-no">No</span>}
                        </td>
                        <td className="mtr-ib-td mtr-ib-td--center">
                          {b.custom_hybrid ? <span className="mtr-ib-yesno mtr-ib-yes">Yes</span> : <span className="mtr-ib-yesno mtr-ib-no">No</span>}
                        </td>
                        <td className="mtr-ib-td mtr-ib-td--center">
                          <a href="#" className="mtr-ib-apply-btn">Apply now</a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="mtr-ib-disclaimer">
              * Rates vary by region and volume. Exact terms confirmed on application.
            </div>
          </div>

          {/* PAGINATION PANEL */}
          {total > 0 && (
            <div className="mtr-ib-pagination-wrap" style={{ marginTop: '20px' }}>
              <div className="mtr-ib-pagination-info">
                Showing <b>{(currentPage - 1) * pageSize + 1}</b> to <b>{Math.min(currentPage * pageSize, total)}</b> of <b>{total}</b> brokers
              </div>
              <div className="mtr-ib-pagination-pages">
                <button className="mtr-ib-pg-btn mtr-ib-pg-prev" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&#8249;</button>
                <span className="mtr-ib-pg-ellipsis">Page {currentPage} of {totalPages}</span>
                <button className="mtr-ib-pg-btn mtr-ib-pg-next" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&#8250;</button>
              </div>
              <div className="mtr-ib-per-page-wrap">
                <span>Show per page</span>
                <div className="relative inline-flex items-center">
                  <select 
                    className="mtr-ib-per-page-select" 
                    value={pageSize} 
                    onChange={e => {setPageSize(Number(e.target.value)); setCurrentPage(1);}}
                  >
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="500">500</option>
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-(--mtr-green) pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPARISON */}
      <div className="mtr-ib-comparison">
        <p style={{fontSize:'0.72rem', fontWeight:700, color:'var(--mtr-green)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:'10px'}}>The MTR Difference</p>
        <h2 className="mtr-ib-section-title">MTR vs <span className="hl">Going Direct</span></h2>
        <p className="mtr-ib-section-desc">Our institutional position means real money in your pocket.</p>

        <div className="mtr-ib-compare-grid">
          <div className="mtr-ib-compare-card">
            <div className="mtr-ib-compare-heading">Going Direct to Broker</div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Rev share</span><span className="mtr-ib-compare-row-val">~30% (if offered)</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Rebate per lot</span><span className="mtr-ib-compare-row-val">~$10</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">CPA</span><span className="mtr-ib-compare-row-val">Standard tiers only</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Deal upgrades</span><span className="mtr-ib-compare-row-val">Manual negotiation</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Multiple brokers</span><span className="mtr-ib-compare-row-val">Separate agreements</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Support</span><span className="mtr-ib-compare-row-val">Broker's affiliate team</span></div>
          </div>
          <div className="mtr-ib-compare-card mtr-ib-compare-card--mtr">
            <div className="mtr-ib-compare-badge">⭐ BEST VALUE</div>
            <div className="mtr-ib-compare-heading">Through MTR</div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Rev share</span><span className="mtr-ib-compare-row-val">Up to 50%</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Rebate per lot</span><span className="mtr-ib-compare-row-val">Up to $15</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">CPA</span><span className="mtr-ib-compare-row-val">Institutional tier access</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Deal upgrades</span><span className="mtr-ib-compare-row-val">Automatic as volume grows</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Multiple brokers</span><span className="mtr-ib-compare-row-val">One application</span></div>
            <div className="mtr-ib-compare-divider"></div>
            <div className="mtr-ib-compare-row"><span className="mtr-ib-compare-row-label">Support</span><span className="mtr-ib-compare-row-val">Dedicated MTR partner team</span></div>
          </div>
        </div>
      </div>

      {/* WHY MTR */}
      <div className="mtr-ib-why">
        <p style={{fontSize:'0.72rem', fontWeight:700, color:'var(--mtr-green)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:'10px'}}>Why MTR</p>
        <h2 className="mtr-ib-section-title">Built for Partners Who <span className="hl">Actually</span> Want to Earn</h2>
        <p className="mtr-ib-section-desc">Not just links and a dashboard. A real commercial relationship.</p>

        <div className="mtr-ib-why-grid">
          
          {/* Card 1 */}
          <div className="mtr-ib-why-card mtr-ib-why-card--hl">
            <div className="mtr-ib-why-top">
              <div className="mtr-ib-why-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="mtr-ib-why-title">Institutional position</div>
            </div>
            <div className="mtr-ib-why-desc">We aggregate volume across our partner network, giving us negotiating power of a large institution - and pass it to you.</div>
            <div className="mtr-ib-why-stat">
              <span style={{flexShrink:0, marginTop:'2px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </span>
              <span className="mtr-ib-why-stat-text">Up to 50% rev share vs industry avg 30%</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="mtr-ib-why-card">
            <div className="mtr-ib-why-top">
              <div className="mtr-ib-why-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div className="mtr-ib-why-title">One deal, all brokers</div>
            </div>
            <div className="mtr-ib-why-desc">Apply once and get access to every broker in our network. No separate contracts, no separate negotiations.</div>
            <div className="mtr-ib-why-stat">
              <span style={{flexShrink:0, marginTop:'2px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <span className="mtr-ib-why-stat-text">10+ brokers, single onboarding</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="mtr-ib-why-card">
            <div className="mtr-ib-why-top">
              <div className="mtr-ib-why-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                </svg>
              </div>
              <div className="mtr-ib-why-title">Rates that grow with you</div>
            </div>
            <div className="mtr-ib-why-desc">As your volume scales, your rates automatically improve. No chasing your account manager.</div>
            <div className="mtr-ib-why-stat">
              <span style={{flexShrink:0, marginTop:'2px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
              </span>
              <span className="mtr-ib-why-stat-text">Tiered upgrades, no manual renewal</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="mtr-ib-why-card">
            <div className="mtr-ib-why-top">
              <div className="mtr-ib-why-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div className="mtr-ib-why-title">Matched to your audience</div>
            </div>
            <div className="mtr-ib-why-desc">We match you with the broker that fits your traffic - by region, trader type, and average deposit size.</div>
            <div className="mtr-ib-why-stat">
              <span style={{flexShrink:0, marginTop:'2px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span className="mtr-ib-why-stat-text">Region + audience optimised</span>
            </div>
          </div>
        </div>

        <div className="mtr-ib-why-cta">
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </span>
          <span style={{fontSize:'1rem', fontWeight:600, color:'#fff'}}>Start earning with better rates today</span>
          <span style={{color:'var(--mtr-green)', fontSize:'1.2rem', fontWeight:700}}>→</span>
        </div>
      </div>

      {/* WHO ITS FOR */}
      <div className="mtr-ib-who">
        <p style={{fontSize:'0.72rem', fontWeight:700, color:'var(--mtr-green)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:'10px'}}>Who This Is For</p>
        <h2 className="mtr-ib-section-title">You Don't Need to Be a <span className="hl">Big Player</span></h2>
        <p className="mtr-ib-section-desc">Institutional rates from day one - no volume required to get started.</p>

        <div className="mtr-ib-who-grid">
          
          {/* Card 1: Signal providers */}
          <div className="mtr-ib-who-card">
            <div className="mtr-ib-who-top">
              <div className="mtr-ib-who-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
                </svg>
              </div>
              <div className="mtr-ib-who-title">Signal providers</div>
            </div>
            <div className="mtr-ib-who-desc">Turn your followers into recurring rebate income on every lot they trade.</div>
          </div>

          {/* Card 2: Trading academies */}
          <div className="mtr-ib-who-card">
            <div className="mtr-ib-who-top">
              <div className="mtr-ib-who-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="mtr-ib-who-title">Trading academies</div>
            </div>
            <div className="mtr-ib-who-desc">Get paid institutional rates when your students sign up through your link.</div>
          </div>

          {/* Card 3: Content creators */}
          <div className="mtr-ib-who-card">
            <div className="mtr-ib-who-top">
              <div className="mtr-ib-who-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div className="mtr-ib-who-title">Content creators</div>
            </div>
            <div className="mtr-ib-who-desc">YouTube, TikTok, newsletters. Monetise your audience with deals they can't get direct.</div>
          </div>

          {/* Card 4: New & mid-level IBs */}
          <div className="mtr-ib-who-card">
            <div className="mtr-ib-who-top">
              <div className="mtr-ib-who-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mtr-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="mtr-ib-who-title">New &amp; mid-level IBs</div>
            </div>
            <div className="mtr-ib-who-desc">Don't have the volume for institutional rates yet? With MTR you get them from day one.</div>
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="mtr-ib-footer-cta">
        <h2 className="mtr-ib-footer-cta-title">Ready to Find Your <span className="hl">Best Deal?</span></h2>
        <p className="mtr-ib-footer-cta-desc">
          Browse the broker table above, pick the structure that fits your audience,
          and apply in under 2 minutes.
        </p>
        <div className="mtr-ib-footer-cta-btns">
          <a href="#mtr-ib-table-section" className="mtr-ib-btn-primary">
            View broker deals ↗
          </a>
          <a href="#" className="mtr-ib-btn-secondary">
            Talk to the team
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}