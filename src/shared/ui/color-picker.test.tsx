import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { ColorPicker } from './color-picker';

describe('ColorPicker', () => {
  it('is a radio group of named swatches that reports the chosen hex', async () => {
    const onChange = vi.fn();
    renderWithProviders(<ColorPicker id="c" label="Колір" value="#3b82f6" onChange={onChange} />);
    expect(screen.getByRole('radiogroup', { name: 'Колір' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Синій' })).toBeChecked();
    await userEvent.setup().click(screen.getByRole('radio', { name: 'Рожевий' }));
    expect(onChange).toHaveBeenCalledWith('#ec4999');
  });
});
