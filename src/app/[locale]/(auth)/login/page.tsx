import { LoginForm } from '@/modules/auth';

export default async function LoginPage({ searchParams }: PageProps<'/[locale]/login'>) {
  const { reset } = await searchParams;
  return <LoginForm resetDone={reset === '1'} />;
}
