import { ResetPasswordForm } from '@/modules/auth';

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<'/[locale]/reset-password'>) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={typeof token === 'string' && token ? token : null} />;
}
