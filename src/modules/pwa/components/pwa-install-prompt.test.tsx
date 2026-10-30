// Its own file: an accepted prompt marks the app installed for the rest of the module's life.
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { InstallBanner, PwaInstallProvider, usePwaInstall } from '../index';

const ANDROID =
  'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36';

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

/** What Chromium fires when the app is installable. */
function firePrompt(outcome: 'accepted' | 'dismissed') {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt: vi.fn(async () => {}),
    userChoice: Promise.resolve({ outcome }),
  });
  act(() => void window.dispatchEvent(event));
  return event;
}

describe('PWA install prompt', () => {
  it("uses the browser's own install dialog when it offered one", async () => {
    asDevice(ANDROID);
    renderPwa();
    const event = firePrompt('accepted');
    expect(event.defaultPrevented).toBe(true); // no mini-infobar: our banner and menu offer it
    await userEvent.setup().click(screen.getByRole('button', { name: 'install' }));
    expect(event.prompt).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(await screen.findByText('installed')).toBeInTheDocument();
  });
});
