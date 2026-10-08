import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CurrencyPreview } from './currency-preview';

const get = vi.fn();
vi.mock('@/shared/lib/api-client', () => ({ api: { GET: (...a: unknown[]) => get(...a) } }));

beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue({ data: { from: 'UAH', to: 'USD', rate: '0.0241', date: '2026-10-08' } });
});

describe('CurrencyPreview', () => {
  it("shows the balance converted at today's rate", async () => {
    renderWithProviders(<CurrencyPreview balance="1000" from="UAH" to="USD" />);
    const line = await screen.findByText(/≈/);
    expect(line).toHaveTextContent(/1\s000,00\s₴/);
    expect(line).toHaveTextContent(/≈\s?24,10\s\$/);
    expect(screen.getByText(/1\s₴ = 0,0241\s\$/)).toBeInTheDocument();
  });

  it('keeps the sign of a negative balance', async () => {
    renderWithProviders(<CurrencyPreview balance="-1000" from="UAH" to="USD" />);
    expect(await screen.findByText(/≈\s?-24,10\s\$/)).toBeInTheDocument();
  });

  it('says when the rate is unavailable', async () => {
    get.mockResolvedValue({
      error: { statusCode: 503, code: 'CURRENCY_API_UNAVAILABLE', message: 'x' },
    });
    renderWithProviders(<CurrencyPreview balance="1000" from="UAH" to="USD" />);
    expect(await screen.findByRole('alert')).not.toHaveTextContent(/^$/);
  });

  it('shows nothing for the same currency', () => {
    const { container } = renderWithProviders(
      <CurrencyPreview balance="1000" from="UAH" to="UAH" />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(get).not.toHaveBeenCalled();
  });
});
