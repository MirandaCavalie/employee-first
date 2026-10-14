"use client";

import clsx from "clsx";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { solutionMeta } from "@/lib/engine/processes";
import type { Solution, TaskStatus } from "@/lib/types";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-2 shadow-[0_1px_0_rgb(255_255_255/0.1)_inset,0_1px_2px_rgb(0_0_0/0.2)]",
  accent: "bg-accent text-white hover:bg-accent-2 shadow-[0_1px_0_rgb(255_255_255/0.15)_inset,0_1px_2px_rgb(31_78_107/0.35)]",
  secondary: "bg-surface text-ink shadow-card hover:bg-[#fbfaf7]",
  ghost: "text-ink-2 hover:bg-sunken",
  danger: "text-bad hover:bg-bad-soft",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "pressable inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-3 text-[14px]",
        size === "md" && "h-11 px-4 text-[15px]",
        size === "lg" && "h-12 px-5 text-[16px]",
        buttonVariants[variant],
        className,
      )}
    >
      {loading ? <Loader2 className="spin size-4" /> : icon}
      {children}
    </button>
  );
}

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={clsx("rounded-2xl bg-surface shadow-card", className)}>
      {children}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "accent" | "good" | "warn" | "bad" | Solution | TaskStatus;
  className?: string;
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-sunken text-ink-2",
    accent: "bg-accent-soft text-accent",
    good: "bg-good-soft text-good",
    warn: "bg-warn-soft text-warn",
    bad: "bg-bad-soft text-bad",
    automation: "bg-automation-soft text-automation",
    skill: "bg-skill-soft text-skill",
    agent: "bg-agent-soft text-agent",
    human: "bg-human-soft text-human",
    new: "bg-sunken text-ink-2",
    learned: "bg-accent-soft text-accent",
    practiced: "bg-good-soft text-good",
    using: "bg-signal-soft text-warn",
  };
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[13px] font-medium leading-4", tones[tone], className)}>
      {children}
    </span>
  );
}

export function SolutionBadge({ solution }: { solution: Solution }) {
  return (
    <Badge tone={solution}>
      <span className="size-1.5 rounded-full bg-current" />
      {solutionMeta[solution].label}
    </Badge>
  );
}

export function PageHeader({ title, lede, actions }: { title: ReactNode; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="font-display text-[32px] leading-[1.15] text-ink">{title}</h1>
        {lede && <p className="mt-2 text-[17px] leading-relaxed text-ink-2">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[14px] font-medium text-ink-2">{label}</span>
        {hint && <span className="text-[13px] text-faint">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl bg-surface px-3.5 text-[16px] text-ink shadow-[0_0_0_1px_var(--color-line-strong)] outline-none placeholder:text-faint transition-shadow duration-150 focus:shadow-[0_0_0_1px_var(--color-accent),0_0_0_4px_var(--color-accent-soft)]";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputBase, "h-12", className)} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(inputBase, "min-h-28 py-3 leading-relaxed", className)} />;
}

export function Empty({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
      {icon && <div className="mb-3 grid size-12 place-items-center rounded-full bg-sunken text-muted">{icon}</div>}
      <div className="text-[18px] font-medium text-ink">{title}</div>
      {children && <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <div className="text-[13px] text-muted">{label}</div>
      <div className="mt-0.5 text-[28px] font-semibold tracking-tight tabular-nums text-ink">{value}</div>
      {sub && <div className="text-[13px] text-faint">{sub}</div>}
    </div>
  );
}
