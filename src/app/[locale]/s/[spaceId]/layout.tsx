import { AppShell } from '@/modules/shell';

export default async function SpaceLayout({
  children,
  params,
}: LayoutProps<'/[locale]/s/[spaceId]'>) {
  const { spaceId } = await params;
  return <AppShell spaceId={spaceId}>{children}</AppShell>;
}
