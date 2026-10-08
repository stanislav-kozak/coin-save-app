import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { PasswordInput } from './password-input';

it('shows and hides the password', async () => {
  renderWithProviders(<PasswordInput aria-label="Пароль" defaultValue="secret" />);
  const input = screen.getByLabelText('Пароль');
  expect(input).toHaveAttribute('type', 'password');
  const eye = screen.getByRole('button', { name: 'Показати пароль' });
  expect(eye).toHaveAttribute('aria-pressed', 'false');
  await userEvent.setup().click(eye);
  expect(input).toHaveAttribute('type', 'text');
  expect(screen.getByRole('button', { name: 'Сховати пароль' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
