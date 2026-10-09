import type { CSSProperties } from 'react';

export const ENTITY_HEX = /^#[0-9a-f]{6}$/i; // the backend validates the same; never inject anything else into style

/** A category/wallet colour (user data, not a token) as `--entity` for edges and glows. */
export function entityStyle(color?: string | null): CSSProperties | undefined {
  return color && ENTITY_HEX.test(color) ? ({ '--entity': color } as CSSProperties) : undefined;
}
