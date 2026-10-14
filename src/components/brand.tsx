import clsx from "clsx";

export const BRAND = {
  name: "Employee First",
  tagline: "Use AI on the work you already do.",
  pitch:
    "A conversation about your real week, plus the rules of your company, becomes a personal desk: how to use AI on each task, what stays with you, and a practice you can finish — not a chatbot.",
  navy: "#1F4E6B",
  clay: "#C4843A",
  ink: "#1A1914",
  paper: "#F5F1E8",
} as const;

/** An E with a clay full stop: the person at the end of the work. */
export const MARK_E =
  "M8 6.5h16a1.5 1.5 0 0 1 0 3H12v4h10a1.5 1.5 0 0 1 0 3H12v4h12a1.5 1.5 0 0 1 0 3H8A1.5 1.5 0 0 1 6.5 22V8A1.5 1.5 0 0 1 8 6.5z";
export const MARK_DOT = { cx: 24.5, cy: 24.5, r: 2.6 } as const;

export function Mark({ size = 24, inverted, className }: { size?: number; inverted?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={clsx("shrink-0", className)} aria-hidden>
      <path d={MARK_E} fill={inverted ? "white" : "var(--color-accent)"} />
      <circle {...MARK_DOT} fill="var(--color-signal)" />
    </svg>
  );
}

export function Logo({ size = 28, className }: { size?: number; inverted?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={clsx("shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
      <g transform="translate(3.2 2.8) scale(.78)">
        <path d={MARK_E} fill="white" />
        <circle {...MARK_DOT} fill="var(--color-signal)" />
      </g>
    </svg>
  );
}

export function Wordmark({ size = 28, inverted, className }: { size?: number; inverted?: boolean; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center", inverted ? "text-white" : "text-ink", className)} style={{ gap: size * 0.28 }}>
      <Mark size={size} inverted={inverted} />
      <span className="font-semibold tracking-[-0.035em]" style={{ fontSize: size * 0.62, lineHeight: 1 }}>
        {BRAND.name}
      </span>
    </span>
  );
}
