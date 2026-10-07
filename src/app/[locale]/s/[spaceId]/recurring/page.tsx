import { RecurringPage } from '@/modules/recurring';

export default async function Page({ params }: PageProps<'/[locale]/s/[spaceId]/recurring'>) {
  const { spaceId } = await params;
  return <RecurringPage spaceId={spaceId} />;
}
