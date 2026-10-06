import { VerifyEmail } from '@/modules/auth';

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<'/[locale]/verify-email'>) {
  const { token } = await searchParams;
  return <VerifyEmail token={typeof token === 'string' && token ? token : null} />;
}
