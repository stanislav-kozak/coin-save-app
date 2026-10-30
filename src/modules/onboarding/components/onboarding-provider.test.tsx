import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { OnboardingProvider, useOnboarding } from '../index';

const api = { GET: vi.fn(), PATCH: vi.fn() };
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    GET: (...a: unknown[]) => api.GET(...a),
    PATCH: (...a: unknown[]) => api.PATCH(...a),
  },
}));
const screenSize = { desktop: true };
vi.mock('@/shared/hooks/use-is-desktop', () => ({ useIsDesktop: () => screenSize.desktop }));
const theme = { resolvedTheme: 'light' };
vi.mock('next-themes', () => ({ useTheme: () => theme }));

const me = (onboardingCompletedAt: string | null) => ({
  id: 'u1',
  email: 'olena@example.com',
  name: 'Olena',
  onboardingCompletedAt,
});

beforeEach(() => {
  api.GET.mockReset();
  api.PATCH.mockReset();
  api.PATCH.mockResolvedValue({ data: me('2026-10-30T10:00:00.000Z') });
  screenSize.desktop = true;
  theme.resolvedTheme = 'light';
});

function Replay() {
  const { start } = useOnboarding();
  return (
    <button type="button" onClick={start}>
      replay
    </button>
  );
}

const renderTour = (completedAt: string | null, locale: 'uk' | 'en' = 'uk') => {
  api.GET.mockResolvedValue({ data: me(completedAt) });
  return renderWithProviders(
    <OnboardingProvider>
      <Replay />
    </OnboardingProvider>,
    { locale },
  );
};

/** The slide image's original path (next/image routes it through its optimizer). */
const imagePath = () =>
  decodeURIComponent((screen.getByRole('img') as HTMLImageElement).src).match(
    /\/onboarding\/[^&]+\.webp/,
  )?.[0];

describe('OnboardingProvider', () => {
  it('opens the tour for a user who has not seen it and marks it seen on skip', async () => {
    renderTour(null);
    expect(await screen.findByRole('dialog', { name: 'Вітаємо в CoinSave' })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Пропустити' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.PATCH).toHaveBeenCalledWith('/api/users/me', {
      body: { onboardingCompleted: true },
    });
  });

  it('marks it seen after the last slide', async () => {
    renderTour(null);
    const user = userEvent.setup();
    await screen.findByRole('dialog');
    for (let i = 0; i < 8; i++) await user.click(screen.getByRole('button', { name: 'Далі' }));
    expect(screen.getByRole('dialog', { name: 'Разом зручніше' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Пропустити' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Почати' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.PATCH).toHaveBeenCalledTimes(1);
  });

  it('stays closed once seen, replays on demand without saving again', async () => {
    renderTour('2026-10-01T10:00:00.000Z');
    const user = userEvent.setup();
    await vi.waitFor(() => expect(api.GET).toHaveBeenCalled());
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'replay' }));
    expect(await screen.findByRole('dialog', { name: 'Вітаємо в CoinSave' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Далі' }));
    await user.click(screen.getByRole('button', { name: 'Закрити' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    // A replay starts from the first slide again.
    await user.click(screen.getByRole('button', { name: 'replay' }));
    expect(await screen.findByRole('dialog', { name: 'Вітаємо в CoinSave' })).toBeInTheDocument();
    expect(api.PATCH).not.toHaveBeenCalled();
  });

  it('shows the desktop slides with desktop screenshots, arrow keys moving between them', async () => {
    renderTour(null);
    const user = userEvent.setup();
    await screen.findByRole('dialog');
    expect(imagePath()).toBe('/onboarding/desktop/uk/light/01.webp');
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('dialog', { name: 'Останні витрати' })).toBeInTheDocument();
    expect(imagePath()).toBe('/onboarding/desktop/uk/light/04.webp');
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('dialog', { name: 'Витрата одним рухом' })).toBeInTheDocument();
  });

  it('shows only the phone slides on mobile, in the dark theme and the UI language', async () => {
    screenSize.desktop = false;
    theme.resolvedTheme = 'dark';
    renderTour(null, 'en');
    const user = userEvent.setup();
    await screen.findByRole('dialog', { name: 'Welcome to CoinSave' });
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Or use “+”' })).toBeInTheDocument();
    expect(imagePath()).toBe('/onboarding/mobile/en/dark/04.webp');
  });

  it('jumps to a step from its dot', async () => {
    renderTour(null);
    await screen.findByRole('dialog');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Крок 7' }));
    expect(screen.getByRole('dialog', { name: 'Регулярні платежі' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Крок 7' })).toHaveAttribute('aria-current', 'step');
  });
});
