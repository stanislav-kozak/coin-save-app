import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils/render';
import { DraggableWallet } from './dnd-items';
import { DndProvider } from './dnd-provider';

describe('DndProvider', () => {
  it('ties drag instructions to a React id, not a counter that differs between server and client', () => {
    renderWithProviders(
      <DndProvider
        nameOf={(id) => id}
        onDrop={() => {}}
        onReorder={() => {}}
        renderGhost={() => null}
      >
        <DraggableWallet id="w1">
          <span>Mono</span>
        </DraggableWallet>
      </DndProvider>,
    );
    const described = screen.getByRole('button').getAttribute('aria-describedby');
    expect(described).not.toMatch(/^DndDescribedBy-\d+$/);
  });
});
