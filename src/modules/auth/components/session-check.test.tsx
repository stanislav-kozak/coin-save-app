import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { SessionCheck } from './session-check';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

describe('SessionCheck', () => {
  beforeEach(() => get.mockReset());

  it('asks the backend who is signed in, so a dead session gets refreshed or sent to login', async () => {
    get.mockResolvedValue({ data: { id: 'u1', email: 'a@b.co', name: 'Taras' } });
    renderWithProviders(<SessionCheck />);
    await vi.waitFor(() => expect(get).toHaveBeenCalledWith('/api/auth/me'));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
