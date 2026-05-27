import { getBrokersForIbDropdown, getIbAffiliateByUuid } from '@/lib/admin/queries';
import { IbAffiliateForm } from '../IbAffiliateForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditIbAffiliatePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const affiliate = await getIbAffiliateByUuid(uuid);
  if (!affiliate) notFound();

  const brokers = await getBrokersForIbDropdown();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit IB Affiliate Program</h1>
      <IbAffiliateForm mode="edit" broker={affiliate} brokersList={brokers} />
    </div>
  );
}