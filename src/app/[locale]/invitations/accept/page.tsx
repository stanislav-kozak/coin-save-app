import { AcceptInvitation } from '@/modules/spaces';

export default async function AcceptInvitationPage({
  searchParams,
}: PageProps<'/[locale]/invitations/accept'>) {
  const { token } = await searchParams;
  return <AcceptInvitation token={typeof token === 'string' && token ? token : null} />;
}
