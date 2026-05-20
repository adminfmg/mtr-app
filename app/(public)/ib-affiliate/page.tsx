import '@/styles/ib-affiliate.css';
import { Metadata } from 'next';
import { getIbAffiliates } from '@/lib/ib-affiliates/queries';
import IbAffiliateList from '@/components/ib-affiliate/IbAffiliateList';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'IB Affiliate Programs - Compare CPA, Rebate, Rev-Share | MyTradingReviews',
  description: 'Compare introducing broker (IB) and affiliate programs from regulated brokers. CPA up to $800, rebate up to $15/lot, and rev-share up to 50%.',
};

export default async function IbAffiliatePage() {
  const ibPrograms = await getIbAffiliates();
  
  return (
    <main className="w-full">
      <IbAffiliateList initialPrograms={ibPrograms} />
    </main>
  );
}