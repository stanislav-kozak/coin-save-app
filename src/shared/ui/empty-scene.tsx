import type { ReactNode } from 'react';

export type Scene = 'wallet' | 'expenses' | 'chart' | 'repeat';

/** The brand mark (a «C» rim around a gold coin) at any size, drifting a little (the one loop). */
function Coin({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const c = 2 * Math.PI * r;
  return (
    <g className="motion-safe:animate-float">
      <circle
        data-part="arc"
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        strokeWidth={r * 0.38}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * 0.22}
        transform={`rotate(38 ${cx} ${cy})`}
        className="stroke-primary"
      />
      <circle cx={cx} cy={cy} r={r * 0.34} className="fill-palette-amber" />
    </g>
  );
}

/** Small scenes built from the mark: an empty wallet, no expenses yet, an empty chart, a repeat. */
const SCENES: Record<Scene, ReactNode> = {
  wallet: (
    <>
      <rect x="18" y="34" width="58" height="36" rx="9" className="fill-muted stroke-border" />
      <rect x="18" y="42" width="58" height="7" className="fill-border" />
      <Coin cx={80} cy={30} r={16} />
    </>
  ),
  expenses: (
    <>
      <rect x="30" y="20" width="40" height="50" rx="6" className="fill-muted stroke-border" />
      <path
        d="M38 34h24M38 44h18M38 54h12"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-border"
      />
      <Coin cx={78} cy={26} r={13} />
    </>
  ),
  chart: (
    <>
      <rect x="22" y="44" width="10" height="24" rx="3" className="fill-muted stroke-border" />
      <rect x="38" y="32" width="10" height="36" rx="3" className="fill-muted stroke-border" />
      <rect x="54" y="50" width="10" height="18" rx="3" className="fill-muted stroke-border" />
      <Coin cx={82} cy={26} r={13} />
    </>
  ),
  repeat: (
    <>
      <circle
        cx="55"
        cy="40"
        r="26"
        fill="none"
        strokeWidth="3"
        strokeDasharray="5 6"
        className="stroke-border"
      />
      <Coin cx={55} cy={40} r={15} />
    </>
  ),
};

/** Stage 2 empty state (spec §8): a scene, a warm title and text, and one clear action. */
export function EmptyScene({
  scene,
  title,
  text,
  action,
}: {
  scene: Scene;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-border bg-card p-6 text-center shadow-card">
      <svg width="110" height="80" viewBox="0 0 110 80" aria-hidden="true" className="mb-1">
        {SCENES[scene]}
      </svg>
      <p className="text-h2">{title}</p>
      <p className="max-w-64 text-caption text-muted-foreground">{text}</p>
      {action ? <div className="mt-3 w-full">{action}</div> : null}
    </div>
  );
}
