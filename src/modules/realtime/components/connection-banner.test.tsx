import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { ConnectionBanner } from './connection-banner';

const state = { status: 'connected', joined: false };
vi.mock('./realtime-provider', () => ({
  useConnectionStatus: () => state.status,
  useMemberJoinedNotice: () => state.joined,
}));

beforeEach(() => {
  state.status = 'connected';
  state.joined = false;
});

describe('ConnectionBanner', () => {
  it('stays hidden while connected or still connecting', () => {
    renderWithProviders(<ConnectionBanner />);
    state.status = 'connecting';
    renderWithProviders(<ConnectionBanner />);
    for (const region of screen.getAllByRole('status')) expect(region).toBeEmptyDOMElement();
  });

  it('says the data may be stale after a lasting outage', () => {
    state.status = 'disconnected';
    renderWithProviders(<ConnectionBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Немає зв’язку з сервером — показуємо останні відомі дані',
    );
  });

  it('announces a new member for a moment', () => {
    state.joined = true;
    renderWithProviders(<ConnectionBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'У просторі поповнення — приєднався новий учасник 🎉',
    );
  });

  it('keeps an empty live region mounted so the message is announced when it appears', () => {
    renderWithProviders(<ConnectionBanner />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('is opaque, so scrolled content does not show through', () => {
    state.status = 'disconnected';
    renderWithProviders(<ConnectionBanner />);
    expect(screen.getByRole('status')).toHaveClass('bg-card');
  });
});
