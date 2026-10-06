import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CreateSpaceForm } from './create-space-form';

const post = vi.fn();
const patch = vi.fn();
const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({
  api: {
    POST: (...a: unknown[]) => post(...a),
    PATCH: (...a: unknown[]) => patch(...a),
    GET: (...a: unknown[]) => get(...a),
  },
}));
const replace = vi.fn();
vi.mock('@/shared/i18n/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const created = {
  id: 'sp1',
  name: 'Family',
  slug: 'family',
  ownerId: 'u1',
  primaryCurrency: 'UAH',
};

beforeEach(() => {
  post.mockReset();
  patch.mockReset();
  get.mockReset();
  replace.mockReset();
  get.mockResolvedValue({ data: [] });
});

async function submit(name: string, currency?: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Назва простору'), name);
  if (currency) await user.selectOptions(screen.getByLabelText('Основна валюта'), currency);
  await user.click(screen.getByRole('button', { name: 'Створити простір' }));
}

describe('CreateSpaceForm', () => {
  it('creates a UAH space with one request and opens it', async () => {
    post.mockResolvedValue({ data: created });
    renderWithProviders(<CreateSpaceForm />);
    await submit(' Family ');
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/s/sp1'));
    expect(post).toHaveBeenCalledWith('/api/spaces', { body: { name: 'Family' } });
    expect(patch).not.toHaveBeenCalled();
  });

  it('sets a non-default currency right after creating', async () => {
    post.mockResolvedValue({ data: created });
    patch.mockResolvedValue({ data: { ...created, primaryCurrency: 'EUR' } });
    renderWithProviders(<CreateSpaceForm />);
    await submit('Family', 'EUR');
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/s/sp1'));
    expect(patch).toHaveBeenCalledWith('/api/spaces/{spaceId}', {
      params: { path: { spaceId: 'sp1' } },
      body: { primaryCurrency: 'EUR' },
    });
  });

  it('still opens the created space when setting the currency fails', async () => {
    post.mockResolvedValue({ data: created });
    patch.mockRejectedValue(new TypeError('Failed to fetch'));
    renderWithProviders(<CreateSpaceForm />);
    await submit('Family', 'EUR');
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/s/sp1'));
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('creates exactly one space on a double click', async () => {
    let resolve!: (v: unknown) => void;
    post.mockReturnValue(new Promise((r) => (resolve = r)));
    renderWithProviders(<CreateSpaceForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Назва простору'), 'Family');
    await user.dblClick(screen.getByRole('button', { name: 'Створити простір' }));
    resolve({ data: created });
    await vi.waitFor(() => expect(replace).toHaveBeenCalled());
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('shows the first-space title when the user has no spaces', async () => {
    renderWithProviders(<CreateSpaceForm />);
    expect(
      await screen.findByRole('heading', { name: 'Створіть свій перший простір' }),
    ).toBeInTheDocument();
  });

  it('shows a neutral title when the user already has spaces', async () => {
    get.mockResolvedValue({ data: [{ ...created, role: 'OWNER' }] });
    renderWithProviders(<CreateSpaceForm />);
    expect(await screen.findByRole('heading', { name: 'Новий простір' })).toBeInTheDocument();
  });
});
