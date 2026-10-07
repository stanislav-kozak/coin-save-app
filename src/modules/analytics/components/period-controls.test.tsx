import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { useAnalytics } from '../api/analytics-queries';
import { useAnalyticsPeriod } from '../hooks/use-analytics-period';
import { PeriodPicker } from './period-picker';
import { WalletFilter } from './wallet-filter';

let search = new URLSearchParams();
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useSearchParams: () => search }));
vi.mock('@/shared/i18n/navigation', () => ({
  usePathname: () => '/s/s1/analytics',
  useRouter: () => ({ replace }),
}));
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

beforeEach(() => {
  search = new URLSearchParams();
  replace.mockReset();
  get.mockReset();
  get.mockImplementation(async (path: string) =>
    path.endsWith('/wallets')
      ? {
          data: [
            { id: 'w1', name: 'Mono', currency: 'UAH', balance: '0', archived: false },
            { id: 'w2', name: 'Стара', currency: 'UAH', balance: '0', archived: true },
          ],
        }
      : { data: { currency: 'UAH', byCategory: [], expenses: [] } },
  );
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 7, 12));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('PeriodPicker', () => {
  it('switches the kind and moves between periods through the URL', async () => {
    renderWithProviders(<PeriodPicker />);
    const user = userEvent.setup();
    expect(screen.getByRole('radio', { name: 'Місяць' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Жовтень 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Наступний період' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Квартал' }));
    expect(replace).toHaveBeenLastCalledWith('/s/s1/analytics?period=quarter&from=2026-10-01');
    await user.click(screen.getByRole('button', { name: 'Попередній період' }));
    expect(replace).toHaveBeenLastCalledWith('/s/s1/analytics?period=month&from=2026-09-01');
  });

  it('keeps the wallet filter when the period changes', async () => {
    search = new URLSearchParams('period=month&from=2026-09-01&wallets=w1');
    renderWithProviders(<PeriodPicker />);
    expect(screen.getByRole('button', { name: 'Наступний період' })).toBeEnabled();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Наступний період' }));
    expect(replace).toHaveBeenLastCalledWith(
      '/s/s1/analytics?period=month&from=2026-10-01&wallets=w1',
    );
  });
});

describe('WalletFilter', () => {
  it('filters by wallets (archived too) and clears back to all', async () => {
    renderWithProviders(<WalletFilter spaceId="s1" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /Усі гаманці/ }));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: /Стара/ }));
    expect(replace).toHaveBeenLastCalledWith(
      '/s/s1/analytics?period=month&from=2026-10-01&wallets=w2',
    );
  });

  it('names the selection and can reset it', async () => {
    search = new URLSearchParams('wallets=w1');
    renderWithProviders(<WalletFilter spaceId="s1" />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /Mono/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Усі гаманці' }));
    expect(replace).toHaveBeenLastCalledWith('/s/s1/analytics?period=month&from=2026-10-01');
  });
});

describe('useAnalytics', () => {
  function Probe({ wallets }: { wallets: string[] }) {
    const { period } = useAnalyticsPeriod();
    useAnalytics('s1', period, wallets);
    return null;
  }
  it('sends the wallet filter only when one is set', async () => {
    renderWithProviders(<Probe wallets={[]} />);
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(get.mock.calls[0]![1].params.query).toEqual({
      from: '2026-10-01',
      to: '2026-10-31',
      tz: expect.any(String),
    });
    get.mockClear();
    renderWithProviders(<Probe wallets={['w1', 'w2']} />);
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(get.mock.calls[0]![1].params.query.walletIds).toEqual(['w1', 'w2']);
  });
});
