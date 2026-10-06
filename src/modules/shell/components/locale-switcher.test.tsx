import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { LocaleSwitcher } from './locale-switcher';

const replace = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/s/a',
}));

describe('LocaleSwitcher', () => {
  it('switches to the other language on the same page', async () => {
    renderWithProviders(<LocaleSwitcher />);
    expect(screen.getByRole('button', { name: 'English' })).toHaveTextContent('UA');
    await userEvent.setup().click(screen.getByRole('button', { name: 'English' }));
    expect(replace).toHaveBeenCalledWith('/s/a', { locale: 'en' });
  });
});
