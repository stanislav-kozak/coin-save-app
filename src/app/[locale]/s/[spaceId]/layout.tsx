import { SpaceGuard } from '@/modules/spaces';

export default async function SpaceLayout({
  children,
  params,
}: LayoutProps<'/[locale]/s/[spaceId]'>) {
  const { spaceId } = await params;
  return <SpaceGuard spaceId={spaceId}>{children}</SpaceGuard>;
}
