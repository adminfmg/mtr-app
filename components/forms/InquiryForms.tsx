'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import '@/styles/inquiry-forms.css';

type TabType = 'broker' | 'ib' | 'trader';

// =====================================================
// FORM CUSTOM SELECT (FIXED: Search selalu muncul!)
// =====================================================
function FormSelect({
  options,
  value,
  onChange,
  placeholder,
  required = false
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="mtr-custom-select-wrap" ref={dropdownRef}>
      {/* Hidden input for HTML5 form validation */}
      <input type="hidden" required={required} value={value} />
      
      <div 
        className={`mtr-custom-select-trigger ${isOpen ? 'is-open' : ''} ${!selectedOption ? 'is-empty' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mtr-custom-select-arrow">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className="mtr-custom-select-dropdown">
          <div className="mtr-custom-select-search">
            <input 
              type="text" 
              autoFocus 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mtr-custom-select-list">
            {filteredOptions.length === 0 ? (
              <div className="mtr-custom-select-empty">No options found</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value} 
                  className={`mtr-custom-select-option ${opt.value === value ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// MAIN UNIFIED FORM
// =====================================================
export function UnifiedInquiryForm() {
  const [activeTab, setActiveTab] = useState<TabType>('broker');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // State dropdowns
  const [brokerTopic, setBrokerTopic] = useState('');
  const [ibType, setIbType] = useState('');
  const [traderTopic, setTraderTopic] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    // Ambil data form
    const formData = new FormData(e.target as HTMLFormElement);

    // Tentukan topic/type mana yang dikirim berdasarkan Tab yang lagi aktif
    let topic = null;
    let ib_affiliate_type = null;

    if (activeTab === 'broker') topic = brokerTopic;
    if (activeTab === 'trader') topic = traderTopic;
    if (activeTab === 'ib') ib_affiliate_type = ibType;

    const payload = {
      form_type: activeTab,
      name: formData.get('name'),
      email: formData.get('email'),
      phone_number: formData.get('phone_number'),
      message: formData.get('message'),
      website_url: formData.get('website_url'),
      topic: topic,
      ib_affiliate_type: ib_affiliate_type,
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage({ 
          type: 'success', 
          text: '✅ Message sent successfully! Our team will get back to you soon.' 
        });
        // Reset form HTML
        (e.target as HTMLFormElement).reset(); 
        // Reset custom select states
        setBrokerTopic('');
        setIbType('');
        setTraderTopic('');
      } else {
        setStatusMessage({ 
          type: 'error', 
          text: `❌ Failed to send message: ${data.error}` 
        });
      }
    } catch (err) {
      setStatusMessage({ 
        type: 'error', 
        text: '❌ An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const brokerTopics = [
    { value: 'Request a Review', label: 'Request a Review' },
    { value: 'Inquiry', label: 'General Inquiry' },
    { value: 'Other', label: 'Other' }
  ];

  const ibTypes = [
    { value: 'Rebate', label: 'Rebate' },
    { value: 'Profit and Loss', label: 'Profit and Loss' },
    { value: 'Net Deposit', label: 'Net Deposit' },
    { value: 'CPA', label: 'CPA' },
    { value: 'Hybrid/Other', label: 'Hybrid / Other' },
    { value: 'Need Help', label: "I don't know yet, need help" }
  ];

  const traderTopics = [
    { value: 'Request a Review', label: 'Request a Review' },
    { value: 'Report a Scam', label: 'Report a Scam' },
    { value: 'Other', label: 'Other' }
  ];

  return (
    <div className="mtr-form-card">
      {/* TABS HEADER */}
      <div className="mtr-tabs-header">
        <button 
          type="button"
          className={`mtr-tab-btn ${activeTab === 'broker' ? 'active' : ''}`}
          onClick={() => { setActiveTab('broker'); setStatusMessage(null); }}
        >
          Broker
        </button>
        <button 
          type="button"
          className={`mtr-tab-btn ${activeTab === 'ib' ? 'active' : ''}`}
          onClick={() => { setActiveTab('ib'); setStatusMessage(null); }}
        >
          IB / Affiliate
        </button>
        <button 
          type="button"
          className={`mtr-tab-btn ${activeTab === 'trader' ? 'active' : ''}`}
          onClick={() => { setActiveTab('trader'); setStatusMessage(null); }}
        >
          Trader
        </button>
      </div>

      {/* FORM BODY */}
      <div className="mtr-form-body">
        <form onSubmit={handleSubmit}>

          {/* === BROKER FORM === */}
          {activeTab === 'broker' && (
            <>
              <div className="mtr-form-group">
                <label className="mtr-form-label">Topic *</label>
                <FormSelect 
                  options={brokerTopics} 
                  value={brokerTopic} 
                  onChange={setBrokerTopic} 
                  placeholder="Select a topic..." 
                  required 
                />
              </div>
              <div className="mtr-form-row">
                <div>
                  <label className="mtr-form-label">Representative Name *</label>
                  <input required type="text" name="name" className="mtr-form-input" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="mtr-form-label">Company Email *</label>
                  <input required type="email" name="email" className="mtr-form-input" placeholder="jane@brokerdomain.com" />
                </div>
              </div>
              <div className="mtr-form-row">
                <div>
                  <label className="mtr-form-label">Website URL (Optional)</label>
                  <input type="url" name="website_url" className="mtr-form-input" placeholder="https://www.brokerdomain.com" />
                </div>
                <div>
                  <label className="mtr-form-label">Phone Number (Optional)</label>
                  <input type="tel" name="phone_number" className="mtr-form-input" placeholder="+1 234 567 890" />
                </div>
              </div>
              <div className="mtr-form-group">
                <label className="mtr-form-label">Message *</label>
                <textarea required name="message" className="mtr-form-textarea" placeholder="How can we help your brokerage?"></textarea>
              </div>
            </>
          )}

          {/* === IB / AFFILIATE FORM === */}
          {activeTab === 'ib' && (
            <>
              <div className="mtr-form-group">
                <label className="mtr-form-label">IB / Affiliate Type *</label>
                <FormSelect 
                  options={ibTypes} 
                  value={ibType} 
                  onChange={setIbType} 
                  placeholder="Select your preferred model..." 
                  required 
                />
              </div>
              <div className="mtr-form-row">
                <div>
                  <label className="mtr-form-label">Name *</label>
                  <input required type="text" name="name" className="mtr-form-input" placeholder="Your Name" />
                </div>
                <div>
                  <label className="mtr-form-label">Email *</label>
                  <input required type="email" name="email" className="mtr-form-input" placeholder="your@email.com" />
                </div>
              </div>
              <div className="mtr-form-group">
                <label className="mtr-form-label">Phone Number (Optional)</label>
                <input type="tel" name="phone_number" className="mtr-form-input" placeholder="+1 234 567 890" />
              </div>
              <div className="mtr-form-group">
                <label className="mtr-form-label">Message *</label>
                <textarea required name="message" className="mtr-form-textarea" placeholder="[ex: Rebate] I want 20% Profit share..."></textarea>
              </div>
            </>
          )}

          {/* === TRADER FORM === */}
          {activeTab === 'trader' && (
            <>
              <div className="mtr-form-group">
                <label className="mtr-form-label">Topic *</label>
                <FormSelect 
                  options={traderTopics} 
                  value={traderTopic} 
                  onChange={setTraderTopic} 
                  placeholder="Select a topic..." 
                  required 
                />
              </div>
              <div className="mtr-form-row">
                <div>
                  <label className="mtr-form-label">Name *</label>
                  <input required type="text" name="name" className="mtr-form-input" placeholder="John Doe" />
                </div>
                <div>
                  <label className="mtr-form-label">Email *</label>
                  <input required type="email" name="email" className="mtr-form-input" placeholder="john@example.com" />
                </div>
              </div>
              <div className="mtr-form-group">
                <label className="mtr-form-label">Phone Number (Optional)</label>
                <input type="tel" name="phone_number" className="mtr-form-input" placeholder="+1 234 567 890" />
              </div>
              <div className="mtr-form-group">
                <label className="mtr-form-label">Message *</label>
                <textarea required name="message" className="mtr-form-textarea" placeholder="Tell us more about your inquiry..."></textarea>
              </div>
            </>
          )}

          {/* ALERT MESSAGES */}
          {statusMessage && (
            <div className={`p-4 mt-2 mb-4 rounded-lg text-[13px] font-semibold text-center border ${
              statusMessage.type === 'success' 
                ? 'bg-[rgba(0,168,107,0.1)] text-[var(--mtr-green)] border-[rgba(0,168,107,0.3)]' 
                : 'bg-[rgba(229,62,62,0.1)] text-[#FC8181] border-[rgba(229,62,62,0.3)]'
            }`}>
              {statusMessage.text}
            </div>
          )}

          <button type="submit" disabled={loading} className="mtr-form-btn">
            {loading ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}