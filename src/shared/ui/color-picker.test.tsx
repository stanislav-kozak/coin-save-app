import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

  it('accepts any color and shows a non-palette value as the selected custom swatch', () => {
    const onChange = vi.fn();
    renderWithProviders(<ColorPicker id="c" label="Колір" value="#A855F7" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'Свій колір' })).toBeChecked();
    const input = document.querySelector<HTMLInputElement>('input[type="color"]')!;
    expect(input).toHaveValue('#a855f7');
    fireEvent.change(input, { target: { value: '#123ABC' } });
    expect(onChange).toHaveBeenLastCalledWith('#123abc');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the system picker on Space/Enter, not when arrowing onto «Свій колір»', async () => {
    const opened = vi.spyOn(HTMLInputElement.prototype, 'click');
    const onChange = vi.fn();
    renderWithProviders(<ColorPicker id="c" label="Колір" value="#a855f7" onChange={onChange} />);
    const custom = screen.getByRole('radio', { name: 'Свій колір' });
    fireEvent.click(custom); // what an arrow key does to a radio
    expect(opened).not.toHaveBeenCalled();
    fireEvent.keyDown(custom, { key: ' ' });
    expect(opened).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(custom, { key: 'Enter' });
    expect(opened).toHaveBeenCalledTimes(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('checks nothing when there is no color yet', () => {
    renderWithProviders(<ColorPicker id="c" label="Колір" value="" onChange={vi.fn()} />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
  });
});
