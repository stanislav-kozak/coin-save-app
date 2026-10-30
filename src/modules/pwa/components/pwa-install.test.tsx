import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { existsSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import manifest from '@/app/manifest';
import { renderWithProviders } from '@/test-utils/render';
import { InstallBanner, PwaInstallProvider, usePwaInstall } from '../index';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

let standalone = false;
beforeEach(() => {
  standalone = false;
  localStorage.clear();
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(display-mode: standalone)' && standalone,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const asDevice = (ua: string) => vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua);

function InstallButton() {
  const { installed, install } = usePwaInstall();
  return installed ? (
    <p>installed</p>
  ) : (
    <button type="button" onClick={install}>
      install
    </button>
  );
}

const renderPwa = () =>
  renderWithProviders(
    <PwaInstallProvider>
      <InstallBanner />
      <InstallButton />
    </PwaInstallProvider>,
  );

describe('PWA install', () => {
  it('shows the step-by-step instructions on an iPhone, which has no install dialog', async () => {
    asDevice(IPHONE);
    renderPwa();
    await userEvent.setup().click(screen.getByRole('button', { name: 'install' }));
    const sheet = await screen.findByRole('dialog', { name: 'Встановити CoinSave' });
    expect(sheet).toHaveTextContent('Натисніть «Поділитися» на панелі Safari');
    expect(sheet).toHaveTextContent('Оберіть «На початковий екран»');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('offers nothing inside the installed app', () => {
    asDevice(IPHONE);
    standalone = true;
    renderPwa();
    expect(screen.getByText('installed')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Встановіть CoinSave на телефон' })).toBeNull();
  });

  it('shows the phone banner until it is dismissed, then not again on this device', async () => {
    asDevice(IPHONE);
    const { unmount } = renderPwa();
    const banner = screen.getByRole('region', { name: 'Встановіть CoinSave на телефон' });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Закрити' }));
    expect(banner).not.toBeInTheDocument();
    unmount();
    renderPwa();
    expect(screen.queryByRole('region', { name: 'Встановіть CoinSave на телефон' })).toBeNull();
  });

  it('installs from the banner', async () => {
    asDevice(IPHONE);
    renderPwa();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Встановити' }));
    expect(await screen.findByRole('dialog', { name: 'Встановити CoinSave' })).toBeInTheDocument();
  });

  it('has no banner on a computer', () => {
    asDevice(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
    );
    renderPwa();
    expect(screen.queryByRole('region', { name: 'Встановіть CoinSave на телефон' })).toBeNull();
  });
});

describe('manifest', () => {
  it('is installable: standalone, a start URL and icons that exist in public/', () => {
    const m = manifest();
    expect(m).toMatchObject({ display: 'standalone', start_url: '/', id: '/' });
    expect(m.icons?.map((i) => i.sizes)).toEqual(['192x192', '512x512', '512x512']);
    expect(m.icons?.some((i) => i.purpose === 'maskable')).toBe(true);
    for (const { src } of [...(m.icons ?? []), ...(m.screenshots ?? [])])
      expect(existsSync(`public${src}`), src).toBe(true);
  });
});
