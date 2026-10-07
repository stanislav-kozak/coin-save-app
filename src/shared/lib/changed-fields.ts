/**
 * The submitted values the user actually touched (react-hook-form `dirtyFields`), minus empty strings —
 * so an edit never writes defaults the entity didn't have (e.g. a color or icon it never had).
 */
export function changedFields<T extends Record<string, unknown>>(
  values: T,
  dirty: Partial<Record<keyof T, unknown>>,
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(values) as (keyof T)[]) {
    if (dirty[key] && values[key] !== '') out[key] = values[key];
  }
  return out;
}
