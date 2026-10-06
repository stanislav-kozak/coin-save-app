export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 flex flex-col gap-2">
      <h1 className="text-h1">{title}</h1>
      {subtitle ? <p className="text-body text-muted-foreground">{subtitle}</p> : null}
    </header>
  );
}
