import { SettingsPage } from '@/modules/settings';

export default async function Page({ params }: PageProps<'/[locale]/s/[spaceId]/settings'>) {
  const { spaceId } = await params;
  return <SettingsPage spaceId={spaceId} />;
}
