import { Metadata } from 'next';
import { UnifiedInquiryForm } from '@/components/forms/InquiryForms';

export const metadata: Metadata = {
  title: 'Get Listed / Contact Us — MyTradingReviews',
  description: 'Whether you want to feature your brokerage, apply for an IB partnership, or report an issue as a trader, we are here to help.',
};

export default function GetListedPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="text-center mb-10 px-4">
        <h1 className="text-[clamp(32px,5vw,48px)] font-bold text-white mb-4 leading-[1.15] tracking-[-0.5px]">
          Get Listed / <span className="text-[var(--mtr-green)]">Contact Us</span>
        </h1>
        <p className="text-[15px] text-[var(--mtr-text)] max-w-[600px] mx-auto">
          Whether you want to feature your brokerage, apply for an IB partnership, or report an issue as a trader, we're here to help.
        </p>
      </div>

      <UnifiedInquiryForm />
    </div>
  );
}