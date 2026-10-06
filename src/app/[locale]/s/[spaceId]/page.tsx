import { Dashboard } from '@/modules/dashboard';

export default async function SpaceHomePage({ params }: PageProps<'/[locale]/s/[spaceId]'>) {
  const { spaceId } = await params;
  return <Dashboard spaceId={spaceId} />;
}
