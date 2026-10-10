import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { DateField } from './date-field';

it('shows the date, opens a Ukrainian calendar from Monday, and picks a day', async () => {
  const onChange = vi.fn();
  renderWithProviders(
    <DateField
      id="d"
      label="Перший платіж"
      value="2026-10-25"
      min="2026-10-08"
      onChange={onChange}
    />,
  );
  const user = userEvent.setup();
  const field = screen.getByRole('button', { name: /Перший платіж/ });
  expect(field).toHaveTextContent('25 жовтня 2026');
  await user.click(field);
  const grid = await screen.findByRole('grid');
  expect(screen.getByText(/жовтень 2026/i)).toBeInTheDocument();
  expect(grid.querySelector('thead th')).toHaveTextContent(/пн/i); // weeks from Monday
  await user.click(within(grid).getByText('26', { selector: 'button' }));
  expect(onChange).toHaveBeenCalledWith('2026-10-26');
  expect(screen.queryByRole('grid')).toBeNull(); // closes after a pick
});

it('does not offer days before the minimum', async () => {
  renderWithProviders(
    <DateField
      id="d"
      label="Перший платіж"
      value="2026-10-25"
      min="2026-10-08"
      onChange={vi.fn()}
    />,
  );
  await userEvent.setup().click(screen.getByRole('button', { name: /Перший платіж/ }));
  const grid = await screen.findByRole('grid');
  expect(within(grid).getByText('7', { selector: 'button' })).toBeDisabled();
  expect(within(grid).getByText('8', { selector: 'button' })).toBeEnabled();
});
