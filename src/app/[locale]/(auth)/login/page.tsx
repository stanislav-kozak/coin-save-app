import { LoginForm } from '@/modules/auth';

export default async function LoginPage({ searchParams }: PageProps<'/[locale]/login'>) {
  // `?error=<CODE>`: the backend's Google sign-in redirects here when it fails.
  const { error } = await searchParams;
  return <LoginForm redirectError={typeof error === 'string' ? error : undefined} />;
}
