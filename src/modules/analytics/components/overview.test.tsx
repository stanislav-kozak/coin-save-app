import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { CategorySplit } from './category-split';
import { LimitBars } from './limit-bars';
import { SummaryCards } from './summary-cards';

const analytics = {
  currency: 'UAH',
  totalExpense: '1000',
  totalIncome: '3500',
  byCategory: [
    {
      categoryId: 'c1',
      name: 'Продукти',
      icon: '🛒',
      color: '#15bba3',
      spent: '600',
      currency: 'UAH' as const,
      spentInCurrency: '600',
      limit: '700',
      pct: 86,
    },
    {
      categoryId: 'c2',
      name: 'Кафе',
      icon: '☕',
      color: '#ec4999',
      spent: '400',
      currency: 'UAH' as const,
      spentInCurrency: '400',
      limit: null,
      pct: 0,
    },
  ],
};

describe('SummaryCards', () => {
  it('shows totals, the change vs the previous period and the period balance', () => {
    renderWithProviders(
      <SummaryCards
        analytics={analytics}
        previous={{ totalExpense: '800', totalIncome: '0' }}
        kind="month"
      />,
    );
    expect(screen.getByText(/1\s000,00\s₴/)).toBeInTheDocument();
    expect(screen.getByText('+25%')).toHaveClass('text-destructive'); // spending grew
    expect(screen.getByText('—')).toBeInTheDocument(); // no income last month
    expect(screen.getByText(/\+2\s500,00\s₴/)).toHaveClass('text-success');
    expect(screen.getAllByText('vs минулий місяць')).toHaveLength(2);
  });
});

describe('CategorySplit', () => {
  it('splits spending by category with shares that add up', () => {
    renderWithProviders(<CategorySplit analytics={analytics} />);
    expect(screen.getByText('Продукти — 60%')).toBeInTheDocument();
    expect(screen.getByText('Кафе — 40%')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-segment]')).toHaveLength(2);
  });

  it('says when nothing was spent', () => {
    renderWithProviders(<CategorySplit analytics={{ byCategory: [] }} />);
    expect(screen.getByText('Немає витрат за цей період')).toBeInTheDocument();
  });
});

describe('LimitBars', () => {
  it('lists categories with their limit progress', () => {
    renderWithProviders(<LimitBars analytics={analytics} />);
    expect(screen.getByText(/600,00\s₴ \/ 700,00\s₴ · 86%/)).toBeInTheDocument();
    expect(screen.getByText(/400,00\s₴ витрачено/)).toBeInTheDocument();
  });
});
