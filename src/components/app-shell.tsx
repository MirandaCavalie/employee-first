"use client";

import clsx from "clsx";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { useStore } from "@/lib/store";
import { Wordmark } from "./brand";

const nav = [
  { href: "/my-work", label: "My Work", sub: "Your desk" },
  { href: "/interview", label: "Conversation", sub: "How you work" },
  { href: "/company", label: "Company", sub: "Rules and tools" },
  { href: "/people", label: "People", sub: "Whose desk" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const company = useStore((s) => s.company);
  const people = useStore((s) => s.people);
  const activeId = useStore((s) => s.activePersonId);
  const resetDemo = useStore((s) => s.resetDemo);
  const person = people.find((p) => p.id === activeId);

  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-line bg-paper px-3 py-5 md:flex">
        <Link href="/" className="pressable mb-8 flex items-center rounded-lg px-2 py-1">
          <Wordmark size={28} />
        </Link>

        <div className="mb-2 px-2 text-[12px] font-medium tracking-wide text-faint uppercase">The desk</div>
        <nav className="flex-1">
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex flex-col rounded-xl px-3 py-2.5 transition-colors duration-150",
                      active ? "bg-surface shadow-card" : "hover:bg-sunken",
                    )}
                  >
                    <span className={clsx("text-[16px]", active ? "font-medium text-ink" : "text-ink-2")}>{item.label}</span>
                    <span className="text-[13px] text-faint">{item.sub}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-line pt-3">
          <div className="rounded-xl bg-surface p-3 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-[14px] font-medium">{person?.name ?? "No one yet"}</div>
              {company.synthetic && <span className="shrink-0 rounded bg-warn-soft px-1.5 py-px text-[11px] font-medium text-warn">Demo</span>}
            </div>
            <div className="truncate text-[13px] text-muted">
              {person ? `${person.role} · ${company.company}` : company.company}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetDemo();
              toast("Demo restored", { description: "Elena's desk at Northwind Freight is back." });
            }}
            className="pressable flex w-full items-center justify-center gap-2 rounded-xl px-2 py-2 text-[13px] text-muted hover:bg-sunken hover:text-ink"
          >
            <RotateCcw className="size-3.5" />
            Reset demo
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-20 flex items-center gap-1 overflow-x-auto border-b border-line bg-paper/90 px-3 py-2 backdrop-blur md:hidden">
          <Link href="/" className="mr-2 shrink-0">
            <Wordmark size={24} />
          </Link>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "shrink-0 rounded-lg px-3 py-1.5 text-[14px]",
                pathname.startsWith(item.href) ? "bg-surface font-medium shadow-card" : "text-ink-2",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="mx-auto w-full max-w-[1080px] px-5 py-8 md:px-10 md:py-12">{children}</main>
      </div>
      <Toaster position="bottom-right" toastOptions={{ className: "!rounded-xl !text-[15px]" }} />
    </div>
  );
}
