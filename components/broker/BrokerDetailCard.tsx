import React from 'react';
import { Broker } from '@/types/broker';
import '@/styles/broker-detail.css';

interface Props {
  broker: Broker;
}

// ============================================================
// HELPERS (clone dari script GSheet)
// ============================================================

// cl() — clean value, return '' kalo invalid
const cl = (v: any): string => {
  if (!v || v === '--' || v === 'NaN' || !String(v).trim()) return '';
  return String(v).trim();
};

// lst() — split string ke array
const lst = (v: any, sep: RegExp | string = /[|,\/]/): string[] => {
  if (!v || !String(v).trim()) return [];
  return String(v).split(sep).map(s => s.trim()).filter(Boolean);
};

// dom() — extract domain dari URL
const dom = (url: string): string => {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    return u.hostname.replace('www.', '');
  } catch (e) {
    return '';
  }
};

// stars() — render 5 stars, round(score/2), warna emas #F5A623
const renderStars = (s: number): React.ReactNode => {
  const filled = Math.round(s / 2);
  return Array.from({ length: 5 }).map((_, i) => {
    const idx = i + 1;
    return (
      <svg key={i} className="star-svg" viewBox="0 0 24 24" fill={idx <= filled ? '#F5A623' : 'none'} stroke="#F5A623" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    );
  });
};

// ICON_CHECK & ICON_CROSS (pros/cons list item icons)
const IconCheck = () => (
  <svg className="list-icon" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#2bcf93" />
    <polyline points="8,12 11,15 16,9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const IconCross = () => (
  <svg className="list-icon" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#ff4d4d" />
    <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Stat label icons (inline SVG 13x13)
const StatIcons = {
  deposit: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  leverage: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  regulation: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  type: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  copy: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  founded: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  spreads: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  withdrawal: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  instruments: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  demo: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  platform: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  payment: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
  ),
};

// Pros/Cons box icons (jempol)
const ProsBoxIcon = () => (
  <svg className="pros-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ConsBoxIcon = () => (
  <svg className="cons-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ============================================================
// TRUST PANEL TEAM (hardcoded — sama persis kayak versi WP)
// ============================================================
const TEAM_MEMBERS = [
  {
    role: 'Written by',
    name: 'Fajar Febriansyah',
    avatar: 'https://secure.gravatar.com/avatar/de957bfc270425346c721bb99b001d9a0ae975b9459351e5f5c9144c88d6294b?s=38&d=mm&r=g',
    url: 'https://mytradingreviews.com/author/fajar/'
  },
  {
    role: 'Edited by',
    name: 'Alex Firdaus',
    avatar: 'https://secure.gravatar.com/avatar/e424ea17c120391a2c48dad256add125f182a3c0430968ff85fea8d76a12d2ac?s=38&d=mm&r=g',
    url: 'https://mytradingreviews.com/author/alex/'
  },
  {
    role: 'Fact Checked by',
    name: 'Karol Cempa',
    avatar: 'https://secure.gravatar.com/avatar/b62e00fa2a27a03819208a6103e03659a2317805b41f9a5d255dfb20cdf6a73c?s=38&d=mm&r=g',
    url: 'https://mytradingreviews.com/author/karol/'
  },
];

const AFF_DEFAULT = 'https://mytradingreviews.com/ib-affiliate/';

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function BrokerDetailCard({ broker }: Props) {

  // === Extract values (clone GSheet logic) ===
  const name = cl(broker.name) || 'Unknown';
  const score = broker.score || 0;
  const web = cl(broker.website);
  const affRaw = cl(broker.affiliate_url);
  const aff = affRaw || AFF_DEFAULT;
  const d = broker.domain || (web ? dom(web) : '');
  const isLeg = (broker.status || '') === 'legitimate';
  const tier = cl(broker.regulation_tier);
  const regs = broker.regulation || [];
  const acctTypes = broker.account_type || [];
  const platforms = broker.platforms || [];
  const payments = broker.payment_methods || [];
  const prosList = broker.pros || [];
  const consList = broker.cons || [];
  const awards = broker.awards || [];
  const trustSigs = broker.trust_signals || [];

  // === Chips ===
  const chipHQ = cl(broker.hq_country);
  const chipFounded = cl(broker.founded_approx);

  // === Verdict ===
  const verdict = cl(broker.quick_verdict);

  // === Min Deposit format: $1,000 (toLocaleString) ===
  const dep = broker.min_deposit;
  const depDisplay = (dep === null || dep === undefined || isNaN(Number(dep)))
    ? '—'
    : (Number(dep) === 0 ? '$0' : '$' + Number(dep).toLocaleString());

  // === Max Leverage format: 1:2,000 ===
  const lev = broker.max_leverage;
  const levDisplay = (lev === null || lev === undefined || isNaN(Number(lev)))
    ? '—'
    : '1:' + Number(lev).toLocaleString();

  // === Spreads: spreads_from (string) atau eur_usd_spread (number) ===
  const spreadFrom = cl(broker.spreads_from);
  const spreadEur = broker.eur_usd_spread;
  const spreadDisplay = spreadFrom || (spreadEur !== null && spreadEur !== undefined && !isNaN(Number(spreadEur))
    ? Number(spreadEur).toFixed(1) + ' Pips'
    : '—');

  // === Copy Trading pill logic ===
  const copyVal = cl(broker.copy_trading);
  const copyIsAvail = copyVal ? /yes|available|true/i.test(copyVal) : false;

  // === Demo Account pill logic ===
  const demoVal = cl(broker.demo_account);
  const demoIsAvail = demoVal ? /yes|available|true/i.test(demoVal) : false;

  // === Updated date (realtime hari ini, format "May 2026") ===
  const updateDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // === Offer ===
  const offerTitle = cl(broker.offer_title);
  const hasOffer = !!offerTitle;

  // === Logo source ===
  const logoColors = ['#2bcf93', '#0066FF', '#7B2FBE', '#E53E3E', '#D69E2E'];
  const logoFallbackColor = broker.color && broker.color !== '--'
    ? broker.color
    : logoColors[name.charCodeAt(0) % logoColors.length];
  const logoSrc = d ? `https://logo.clearbit.com/${d}` : '';

  return (
    <section className="broker-card" aria-label="Broker overview card">
      <header className="header">
        <div className="logo-box">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
            />
          ) : (
            <div className="logo-fallback" style={{ background: logoFallbackColor }}>
              {name[0]}
            </div>
          )}
        </div>

        <div>
          <div className="name-row">
            <h1 className="name">{name}</h1>
            <span className="verified-badge">
              <span className="verified-dot">✓</span>
              MTR verified
            </span>
          </div>

          <div className="chips">
            {acctTypes.map((t, i) => (
              <span key={`acct-${i}`} className="chip">{t}</span>
            ))}
            {regs.length > 0 && (
              <span className="chip">{regs.slice(0, 4).join(' | ')}</span>
            )}
            {tier && <span className="chip warn">{tier}</span>}
            {(chipHQ || chipFounded) && (
              <span className="chip">
                {[chipHQ, chipFounded ? `Founded: ${chipFounded}` : ''].filter(Boolean).join(' | ')}
              </span>
            )}
          </div>
        </div>

        <div className="score-col">
          <p className="score">{score.toFixed(1)} <small>/10</small></p>
          <div className="stars" aria-hidden="true">
            {renderStars(score)}
          </div>
          <p className="score-hint">Editorial score</p>
        </div>
      </header>

      <div className="mtr-trust-panel">
        {TEAM_MEMBERS.map((m, i) => (
          <a key={i} className="mtr-trust-person" href={m.url} target="_blank" rel="noopener">
            <img className="mtr-trust-avatar" src={m.avatar} alt={m.name} />
            <div className="mtr-trust-meta">
              <span className="mtr-trust-role">{m.role}</span>
              <span className="mtr-trust-name">{m.name}</span>
            </div>
          </a>
        ))}
        <div className="mtr-trust-date-wrap">
          <div className="mtr-trust-date-label">Updated</div>
          <div className="mtr-trust-date-val">{updateDate}</div>
        </div>
      </div>

      {verdict && (
        <section className="verdict" aria-label="Quick verdict">
          <strong>⚡ Quick verdict :</strong> {verdict}
        </section>
      )}

      <section className="stats-grid" aria-label="Broker facts">
        <article className="stat">
          <p className="sl">{StatIcons.deposit} Min. Deposit</p>
          <p className="sv good">{depDisplay}</p>
          <p className="ss">{cl(broker.min_deposit_note)}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.leverage} Max Leverage</p>
          <p className="sv warn">{levDisplay}</p>
          <p className="ss">{cl(broker.leverage_note)}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.regulation} Regulation</p>
          <p className="sv warn">{tier || '—'}</p>
          <p className="ss">{regs.join(', ')}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.type} Broker Type</p>
          <div className="sv">
            {acctTypes.length > 0
              ? acctTypes.map((t, i) => <span key={i} className="pill neutral">{t}</span>)
              : '—'}
          </div>
          <p className="ss">{cl(broker.broker_type_note)}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.copy} Copy Trading</p>
          <p className="sv">
            {copyVal
              ? <span className={copyIsAvail ? 'pill' : 'pill neutral'}>{copyIsAvail ? 'Available' : copyVal}</span>
              : '—'}
          </p>
          <p className="ss">{cl(broker.copy_trading_note)}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.founded} Founded</p>
          <p className="sv good">{cl(broker.founded_approx) || '—'}</p>
          <p className="ss">{cl(broker.founded_note)}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.spreads} Spreads From</p>
          <p className="sv good">{spreadDisplay}</p>
          <p className="ss">{cl(broker.spreads_note)}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.withdrawal} Withdrawal Time</p>
          <p className="sv good">{cl(broker.withdrawal_time) || '—'}</p>
          <p className="ss">{cl(broker.withdrawal_note)}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.instruments} Instruments</p>
          <p className="sv good">{cl(broker.instruments) || '—'}</p>
          <p className="ss">{cl(broker.instruments_note)}</p>
        </article>

        <article className="stat">
          <p className="sl">{StatIcons.demo} Demo Account</p>
          <p className="sv">
            {demoVal
              ? <span className={demoIsAvail ? 'pill' : 'pill neutral'}>{demoIsAvail ? 'Available' : demoVal}</span>
              : '—'}
          </p>
          <p className="ss">{cl(broker.demo_account_note)}</p>
        </article>

        <article className="stat span-2">
          <p className="sl">{StatIcons.platform} Platform</p>
          <div className="stat-scroll-row">
            {platforms.length > 0
              ? platforms.map((p, i) => <span key={i} className="pill neutral">{p}</span>)
              : '—'}
          </div>
          <p className="ss">{cl(broker.platform_note)}</p>
        </article>

        <article className="stat span-2">
          <p className="sl">{StatIcons.payment} Payment Methods</p>
          <div className="pay-row">
            {payments.length > 0
              ? payments.map((p, i) => <span key={i} className="pay-chip">{p}</span>)
              : '—'}
          </div>
        </article>
      </section>

      {(prosList.length > 0 || consList.length > 0) && (
        <section className="pros-cons" aria-label="Pros and cons">
          <article className="box pros">
            <h3><ProsBoxIcon /> Pros</h3>
            <ul className="list">
              {prosList.map((p, i) => (
                <li key={i}><IconCheck /><span>{p}</span></li>
              ))}
            </ul>
          </article>
          <article className="box cons">
            <h3><ConsBoxIcon /> Cons</h3>
            <ul className="list">
              {consList.map((c, i) => (
                <li key={i}><IconCross /><span>{c}</span></li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {hasOffer && (
        <section className="offer" aria-label="Exclusive offer">
          <div>
            <p className="offer-kicker">Exclusive Offer</p>
            <p className="offer-title">{offerTitle}</p>
            <div className="offer-sub">{cl(broker.offer_desc)}</div>
            <div className="offer-note">{cl(broker.offer_note)}</div>
          </div>
          <a className="btn btn-primary" href={cl(broker.offer_url) || aff} target="_blank" rel="nofollow sponsored noopener">
            {cl(broker.offer_label) || 'Get Offer'}
          </a>
        </section>
      )}

      <section className="cta-row" aria-label="Actions">
        <a className="btn btn-primary" href={web || aff} target="_blank" rel="nofollow sponsored noopener">
          Open Account
        </a>
        <a className="report-link" href="#" target="_blank" rel="noopener">Report issue</a>
      </section>

      <hr className="divider" />

      <section className="trust-row" aria-label="Trust signals">
        {trustSigs.length > 0
          ? trustSigs.map((sig, i) => (
            <span key={i} className="trust-item">
              <span className="trust-dot good"></span>
              {sig}
            </span>
          ))
          : (
            <span className="trust-item">
              <span className="trust-dot" style={{ background: isLeg ? '#2bcf93' : '#ff4d4d' }}></span>
              {isLeg ? 'Regulated & Active' : 'Warning — check regulation'}
            </span>
          )}
        {cl(broker.trust_pilot_score) && (
          <span className="trust-item">
            <span className="trust-dot good"></span>
            Trustpilot: {cl(broker.trust_pilot_score)}
          </span>
        )}
      </section>

      {awards.length > 0 && (
        <div className="award-row" aria-label="Awards">
          {awards.map((a, i) => (
            <span key={i} className="award">
              <span className="award-icon">🏆</span>
              {a}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}