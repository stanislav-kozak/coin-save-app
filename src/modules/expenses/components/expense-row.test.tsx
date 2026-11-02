import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { ExpenseRow } from './expense-row';

const base = {
  id: 'e1',
  amount: '15000',
  walletCurrency: 'UAH',
  occurredAt: '2026-10-07T09:00:00Z',
};

describe('ExpenseRow', () => {
  it('titles an uncategorized income «Дохід» and an uncategorized expense «Без категорії»', () => {
    renderWithProviders(
      <ul>
        <ExpenseRow expense={{ ...base, type: 'INCOME' }} />
        <ExpenseRow expense={{ ...base, id: 'e2', type: 'EXPENSE' }} />
      </ul>,
    );
    expect(screen.getByText('Дохід')).toBeInTheDocument();
    expect(screen.getByText('Без категорії')).toBeInTheDocument();
  });

  it('shows a transfer as «from → to», neutral, with no sign', () => {
    renderWithProviders(
      <ul>
        <ExpenseRow
          expense={{
            ...base,
            amount: '500',
            type: 'TRANSFER',
            toAmount: '500',
            toWalletCurrency: 'UAH',
          }}
          transfer={{ from: 'Mono', to: 'Готівка' }}
        />
      </ul>,
    );
    expect(screen.getByText('Mono → Готівка')).toBeInTheDocument();
    const amount = screen.getByText(/500,00/);
    expect(amount.textContent).not.toMatch(/[-+−]/);
    expect(amount).not.toHaveClass('text-success');
    expect(screen.queryByText(/отримано/)).toBeNull(); // one currency: nothing extra to say
  });

  it('adds the received amount when a transfer changes currency', () => {
    renderWithProviders(
      <ul>
        <ExpenseRow
          expense={{
            ...base,
            amount: '1000',
            type: 'TRANSFER',
            toAmount: '24',
            toWalletCurrency: 'USD',
            note: 'Обмін',
          }}
          transfer={{ from: 'Mono', to: 'Savings' }}
        />
      </ul>,
    );
    expect(screen.getByText(/отримано 24,00\s\$ · Обмін/)).toBeInTheDocument();
  });
});
