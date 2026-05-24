'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BrokerReview, BrokerReviewStats } from '@/types/brokerReview';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  brokerUuid: string;
  brokerName: string;
  initialReviews: BrokerReview[];
  initialStats: BrokerReviewStats;
}

type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

function calculateStats(reviews: BrokerReview[]): BrokerReviewStats {
  const total = reviews.length;
  if (total === 0) {
    return { total: 0, average: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    distribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
  });
  return {
    total,
    average: Math.round((sum / total) * 10) / 10,
    distribution,
  };
}

function StarIcon({ filled, size = 16 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#FFC107' : 'none'}
      stroke="#FFC107"
      strokeWidth="1.5"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= Math.round(rating)} size={size} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <StarIcon filled={i <= (hover || value)} size={24} />
        </button>
      ))}
    </div>
  );
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ['#2bcf93', '#42d1ff', '#7B2FBE', '#E53E3E', '#D69E2E', '#00A86B', '#FF6B6B', '#4ECDC4'];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function BrokerReviews({ brokerUuid, brokerName, initialReviews, initialStats }: Props) {
  const [reviews, setReviews] = useState<BrokerReview[]>(initialReviews);
  const [stats, setStats] = useState<BrokerReviewStats>(initialStats);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  // Form state
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`broker_reviews:${brokerUuid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broker_reviews',
          filter: `broker_uuid=eq.${brokerUuid}`,
        },
        async () => {
          // Refetch approved reviews
          const { data } = await supabase
            .from('broker_reviews')
            .select('*')
            .eq('broker_uuid', brokerUuid)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

          if (data) {
            setReviews(data as BrokerReview[]);
            setStats(calculateStats(data as BrokerReview[]));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brokerUuid]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder, filterRating]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (rating === 0) {
      setSubmitMessage({ type: 'error', text: 'Please select a rating.' });
      return;
    }
    if (reviewText.trim().length < 3) {
      setSubmitMessage({ type: 'error', text: 'Review is too short.' });
      return;
    }
    if (guestName.trim().length < 2) {
      setSubmitMessage({ type: 'error', text: 'Please enter your name.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker_uuid: brokerUuid,
          rating,
          review_text: reviewText,
          guest_name: guestName,
          guest_email: guestEmail || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitMessage({ type: 'error', text: result.error || 'Submission failed.' });
      } else {
        setSubmitMessage({ type: 'success', text: result.message });
        setRating(0);
        setReviewText('');
        setGuestName('');
        setGuestEmail('');
      }
    } catch {
      setSubmitMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }, [brokerUuid, rating, reviewText, guestName, guestEmail]);

  // Filter + sort
  const filteredReviews = [...reviews]
    .filter((r) => (filterRating ? r.rating === filterRating : true))
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortOrder === 'highest') return b.rating - a.rating;
      return a.rating - b.rating;
    });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / PER_PAGE);
  const startIdx = (currentPage - 1) * PER_PAGE;
  const displayedReviews = filteredReviews.slice(startIdx, startIdx + PER_PAGE);

  return (
    <section id="reviews" className="bg-[#0F1825] p-6 md:p-10 rounded-lg border border-[rgba(255,255,255,0.22)]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Customer Reviews</h2>
          <p className="text-sm text-[#a9bcde]">See what traders are saying about {brokerName}.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#0A1220] border border-[rgba(255,255,255,0.12)] rounded-lg px-4 py-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[rgba(0,168,107,0.12)]">
            <StarIcon filled size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-white leading-tight">{stats.total} Reviews</div>
            <div className="text-xs text-[#a9bcde]">Total Verified Reviews</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: Stats + Reviews list */}
        <div>
          {/* Stats box */}
          <div className="bg-[#0A1220] border border-[rgba(255,255,255,0.12)] rounded-lg p-5 mb-6">
            <div className="grid grid-cols-[120px_1fr] gap-5 items-center">
              {/* Kiri: Score, Out of 5, Bintang, Status */}
              <div className="text-center flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-extrabold text-white leading-none mb-1">
                  {stats.average.toFixed(1)}
                </div>
                <div className="text-[11px] text-[#a9bcde] mb-2 uppercase tracking-widest font-semibold">
                  Out of 5
                </div>
                <StarRating rating={stats.average} size={16} />
                <div className="text-xs font-bold text-[#FFC107] mt-2 uppercase tracking-wide">
                  {stats.average >= 4.5
                    ? 'Excellent'
                    : stats.average >= 4.0
                    ? 'Great'
                    : stats.average >= 3.0
                    ? 'Average'
                    : stats.average >= 2.0
                    ? 'Poor'
                    : stats.average > 0
                    ? 'Bad'
                    : 'No Reviews'}
                </div>
              </div>
              
              {/* Kanan: Progress Bars */}
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5];
                  const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs text-[#a9bcde]">
                      <span className="w-12">{star} Stars</span>
                      <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFC107] transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-10 text-right">{Math.round(percent)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sort + filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-white text-lg mb-3">All Reviews ({reviews.length})</h3>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
              
              {/* Dropdown Sort - Full w di mobile, auto di desktop */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="bg-[#0A1220] border border-[rgba(255,255,255,0.12)] text-white text-sm rounded-md px-3 py-2 lg:py-1.5 focus:outline-none focus:border-[#00A86B] w-full lg:w-auto min-w-[130px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>

              {/* Filter Buttons - Grid 3 kolom di Mobile, Flex 1 Baris (Nowrap) Mentok Kanan di Desktop */}
              <div className="grid grid-cols-3 lg:flex lg:flex-nowrap items-center lg:justify-end gap-1.5 w-full lg:w-auto mt-2 lg:mt-0">
                {/* Tombol All */}
                <button
                  type="button"
                  onClick={() => setFilterRating(null)}
                  className={`flex items-center justify-center text-[11px] font-medium px-2 py-2 lg:px-3 lg:py-1.5 rounded-full border transition whitespace-nowrap ${
                    filterRating === null
                      ? 'bg-[rgba(0,168,107,0.12)] border-[#00A86B] text-[#00A86B]'
                      : 'bg-[#0A1220] border-[rgba(255,255,255,0.12)] text-[#a9bcde] hover:border-[rgba(255,255,255,0.3)] hover:text-white'
                  }`}
                >
                  All ({reviews.length})
                </button>

                {/* Tombol Bintang 5 ke 1 */}
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5];
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFilterRating(star)}
                      className={`flex items-center justify-center gap-1 text-[11px] font-medium px-1 py-2 lg:px-2.5 lg:py-1.5 rounded-full border transition whitespace-nowrap ${
                        filterRating === star
                          ? 'bg-[rgba(0,168,107,0.12)] border-[#00A86B] text-white'
                          : 'bg-[#0A1220] border-[rgba(255,255,255,0.12)] text-[#a9bcde] hover:border-[rgba(255,255,255,0.3)] hover:text-white'
                      }`}
                    >
                      {star} 
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="1">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                      ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews list */}
          {displayedReviews.length === 0 ? (
            <div className="border border-dashed border-[rgba(255,255,255,0.22)] rounded-lg p-10 text-center text-[#a9bcde]">
              No reviews yet. Be the first to review!
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {displayedReviews.map((r) => (
                  <article
                    key={r.id}
                    className="bg-[#0A1220] border border-[rgba(255,255,255,0.12)] rounded-lg p-4"
                  >
                    <header className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: getAvatarColor(r.guest_name) }}
                      >
                        {getInitials(r.guest_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm">{r.guest_name}</div>
                        <div className="mt-1">
                          <StarRating rating={r.rating} size={14} />
                        </div>
                      </div>
                      <div className="text-xs text-[#a9bcde] whitespace-nowrap">{timeAgo(r.created_at)}</div>
                    </header>
                    <p className="text-sm text-[#deebff] leading-relaxed whitespace-pre-wrap">{r.review_text}</p>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs rounded-md border border-[rgba(255,255,255,0.22)] text-[#a9bcde] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-8 text-xs rounded-md border transition ${
                        currentPage === page
                          ? 'bg-[rgba(0,168,107,0.12)] border-[#00A86B] text-[#00A86B]'
                          : 'border-[rgba(255,255,255,0.22)] text-[#a9bcde] hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs rounded-md border border-[rgba(255,255,255,0.22)] text-[#a9bcde] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Write a Review form */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="bg-[#0A1220] border border-[rgba(255,255,255,0.12)] rounded-lg p-5 sticky top-4"
          >
            <h3 className="text-lg font-bold text-[#00A86B] mb-1">Write a Review</h3>
            <p className="text-xs text-[#a9bcde] mb-4">Share your experience with {brokerName}</p>

            <label className="block text-sm font-medium text-white mb-2">Your Rating</label>
            <div className="mb-4">
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <label className="block text-sm font-medium text-white mb-2">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              rows={5}
              className="w-full bg-[#060D18] border border-[rgba(255,255,255,0.12)] text-white text-sm rounded-md px-3 py-2 mb-4 focus:outline-none focus:border-[#00A86B] resize-y"
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Your Name <span className="text-[#ff4d4d]">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[#060D18] border border-[rgba(255,255,255,0.12)] text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#00A86B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Your Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#060D18] border border-[rgba(255,255,255,0.12)] text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#00A86B]"
                />
              </div>
            </div>

            {submitMessage && (
              <div
                className={`text-sm rounded-md px-3 py-2 mb-3 border ${
                  submitMessage.type === 'success'
                    ? 'bg-[rgba(0,168,107,0.12)] border-[rgba(0,168,107,0.45)] text-[#00A86B]'
                    : 'bg-[rgba(255,77,77,0.12)] border-[rgba(255,77,77,0.45)] text-[#ff4d4d]'
                }`}
              >
                {submitMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#00A86B] hover:bg-[#00d488] text-[#0d0d0d] font-bold py-2.5 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}