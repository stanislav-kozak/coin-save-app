import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { PillGroup } from './pill-group';

function Harness() {
  const [value, setValue] = useState('light');
  return (
    <PillGroup
      label="Тема"
      value={value}
      onChange={setValue}
      options={[
        { value: 'light', label: 'Світла' },
        { value: 'dark', label: 'Темна' },
      ]}
    />
  );
}

describe('PillGroup', () => {
  it('is one tab stop and moves the choice with the arrow keys', async () => {
    render(<Harness />);
    const user = userEvent.setup();
    expect(screen.getByRole('radio', { name: 'Світла' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Темна' })).toHaveAttribute('tabindex', '-1');
    screen.getByRole('radio', { name: 'Світла' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Темна' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Темна' })).toHaveFocus();
    await user.keyboard('{ArrowRight}'); // wraps around
    expect(screen.getByRole('radio', { name: 'Світла' })).toHaveFocus();
  });
});
