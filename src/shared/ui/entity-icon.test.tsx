import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EntityIcon } from './entity-icon';

describe('EntityIcon', () => {
  it('uses the entity color and shows its emoji', () => {
    render(<EntityIcon id="c1" color="#3B82F6" icon="🚌" size="m" label="Транспорт" />);
    const el = screen.getByRole('img', { name: 'Транспорт' });
    expect(el).toHaveStyle({ backgroundColor: '#3B82F6' });
    expect(el).toHaveTextContent('🚌');
  });
  it('falls back to a palette token when the entity has no color', () => {
    render(<EntityIcon id="w1" size="m" label="Cash" />);
    expect(screen.getByRole('img', { name: 'Cash' }).className).toMatch(/bg-(primary|palette-)/);
  });
  it('ignores a malformed color instead of injecting it', () => {
    render(<EntityIcon id="w1" color="red; background:url(x)" size="m" label="X" />);
    expect(screen.getByRole('img', { name: 'X' }).getAttribute('style') ?? '').not.toContain('url');
  });
});
