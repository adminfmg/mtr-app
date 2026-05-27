import { getBrokersForIbDropdown } from '@/lib/admin/queries';
import { IbAffiliateForm } from '../IbAffiliateForm';

export const dynamic = 'force-dynamic';

export default async function NewIbAffiliatePage() {
  const brokers = await getBrokersForIbDropdown();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add IB Affiliate Program</h1>
      <IbAffiliateForm mode="create" brokersList={brokers} />
    </div>
  );
}