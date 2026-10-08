export function initials({ name, email }: { name?: string | null; email: string }): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return email.charAt(0).toLocaleUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase())
    .join('');
}
