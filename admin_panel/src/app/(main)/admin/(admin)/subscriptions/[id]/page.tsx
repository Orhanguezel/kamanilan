import SubscriptionPlanDetailClient from '../_components/subscription-plan-detail-client';

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> | Params }) {
  const p = (await params) as Params;
  return <SubscriptionPlanDetailClient id={p.id} />;
}
