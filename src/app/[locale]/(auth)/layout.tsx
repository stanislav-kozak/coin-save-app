import type { ReactNode } from 'react';
import { AuthLayout } from '@/modules/auth';
import { LocaleSwitcher, ThemeButton } from '@/modules/shell';

// Composed here: `shell` already depends on `auth`, so `auth` can't import these switchers itself.
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout
      actions={
        <>
          <ThemeButton />
          <LocaleSwitcher saveToAccount={false} />
        </>
      }
    >
      {children}
    </AuthLayout>
  );
}
