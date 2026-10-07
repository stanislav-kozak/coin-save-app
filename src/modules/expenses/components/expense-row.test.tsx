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
});
