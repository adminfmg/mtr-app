import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBrokerBySlug, getBrokerReview } from '@/lib/brokers/queries';
import BrokerDetailCard from '@/components/broker/BrokerDetailCard';

export const revalidate = 3600;

// FIX: Params harus berbentuk Promise
interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // FIX: Unpack params dengan await
  const resolvedParams = await params;
  const broker = await getBrokerBySlug(resolvedParams.slug);
  
  if (!broker) return { title: 'Broker Not Found | MyTradingReviews' };
  
  const review = await getBrokerReview(broker.uuid);

  return {
    title: review?.seoTitle || `${broker.name} Review & Rating - MyTradingReviews`,
    description: review?.seoDescription || `Read our comprehensive review and analysis for ${broker.name}.`,
  };
}

export default async function BrokerDetailPage({ params }: Props) {
  // FIX: Unpack params dengan await
  const resolvedParams = await params;
  const broker = await getBrokerBySlug(resolvedParams.slug);

  if (!broker) {
    notFound(); 
  }

  const review = await getBrokerReview(broker.uuid);

  return (
    <div className="py-8">
      <BrokerDetailCard broker={broker} />

      <div className="mt-12 max-w-[1240px] mx-auto">
        {review && review.content ? (
          <article className="prose prose-invert max-w-none text-gray-300 bg-[#101010] p-6 md:p-10 rounded-lg border border-[rgba(255,255,255,0.22)]">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
              In-Depth Review: {broker.name}
            </h2>
            {/* Sanity PortableText Placeholder */}
            <div>[Sanity PortableText content will be rendered here]</div>
          </article>
        ) : (
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[rgba(255,255,255,0.22)] text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Detailed Review Coming Soon</h2>
            <p className="text-[#b2b2b2]">Our editorial team is currently evaluating {broker.name} to bring you a comprehensive long-form review.</p>
          </div>
        )}
      </div>
    </div>
  );
}