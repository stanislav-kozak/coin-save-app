import { Suspense } from 'react';
import { AnalyticsPage } from '@/modules/analytics';

export default async function Page({ params }: PageProps<'/[locale]/s/[spaceId]/analytics'>) {
  const { spaceId } = await params;
  // The period lives in the URL's search params (read on the client).
  return (
    <Suspense>
      <AnalyticsPage spaceId={spaceId} />
    </Suspense>
  );
}
