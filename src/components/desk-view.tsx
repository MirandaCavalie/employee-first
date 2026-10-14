"use client";

import { ArrowRight, Clock3, Handshake, Shield } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { buildDesk, deskStats } from "@/lib/engine/desk";
import { useActivePerson, useHydrated, useStore } from "@/lib/store";
import type { DeskCard, TaskStatus } from "@/lib/types";
import { Badge, Card, Empty, PageHeader, SolutionBadge, Stat } from "./ui";

const statusLabel: Record<TaskStatus, string> = {
  new: "Not started",
  learned: "Read",
  practiced: "Practiced",
  using: "Using this week",
};

export function DeskView() {
  const hydrated = useHydrated();
  const person = useActivePerson();
  const company = useStore((s) => s.company);
  const progress = useStore((s) => s.progress);
  const desk = useMemo(() => (person && person.status === "completed" ? buildDesk(person, company) : null), [person, company]);
  const mine = person ? (progress[person.id] ?? {}) : {};
  const stats = desk ? deskStats(desk, mine) : null;

  if (!hydrated) return <div className="shimmer h-64 rounded-2xl" />;

  if (!person) {
    return (
      <Empty icon={<Handshake className="size-5" />} title="No one at the desk yet" action={<Link href="/people" className="text-accent underline">Add a person</Link>}>
        Start with a conversation. The desk is built from what they say and the company rules.
      </Empty>
    );
  }

  if (!desk) {
    return (
      <Empty
        icon={<Handshake className="size-5" />}
        title={`${person.name} hasn't finished the conversation`}
        action={
          <Link href="/interview" className="pressable inline-flex h-12 items-center rounded-xl bg-accent px-5 text-[16px] font-medium text-white">
            Open the conversation
          </Link>
        }
      >
        My Work is generated after we hear how their week actually works.
      </Empty>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${desk.firstName}, this is your work`}
        lede={
          desk.years
            ? `${desk.role} at ${company.company}. ${desk.years} years on this kind of work. We built this desk from your conversation and the company rules — not from a generic chatbot.`
            : `${desk.role} at ${company.company}. Built from your conversation and the company rules.`
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <Stat label="Hours in a typical week" value={stats?.hours} sub={`${desk.cards.length} repeated tasks`} />
        </Card>
        <Card className="p-5">
          <Stat label="Practiced" value={`${stats?.practiced ?? 0} of ${stats?.total ?? 0}`} sub="Finish a practice before you use it live" />
        </Card>
        <Card className="p-5">
          <Stat label="Using this week" value={stats?.using ?? 0} sub="The point is the real job, not the demo" />
        </Card>
      </div>

      <Card className="mb-8 p-5">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 size-5 shrink-0 text-accent" />
          <div>
            <div className="text-[16px] font-semibold">How we start with you</div>
            <p className="mt-1 text-[16px] leading-relaxed text-ink-2">{desk.stanceNote}</p>
            {desk.keepHuman && (
              <p className="mt-3 text-[16px] leading-relaxed">
                <span className="font-medium text-human">Stays with you. </span>
                {desk.keepHuman}
              </p>
            )}
          </div>
        </div>
      </Card>

      <h2 className="mb-3 text-[18px] font-semibold">Your week</h2>
      <div className="space-y-4">
        {desk.cards.map((card, i) => (
          <TaskCard key={card.taskId} card={card} status={(mine[card.taskId]?.status as TaskStatus) ?? "new"} index={i} />
        ))}
      </div>

      {desk.rules.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-[18px] font-semibold">Rules that apply on this desk</h2>
          <ul className="space-y-2">
            {desk.rules.map((rule) => (
              <li key={rule} className="rounded-xl bg-sunken px-4 py-3 text-[15px] leading-relaxed text-ink-2">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TaskCard({ card, status, index }: { card: DeskCard; status: TaskStatus; index: number }) {
  return (
    <Card className="enter p-0" style={{ ["--i" as string]: index }}>
      <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
        <div className="border-b border-line p-6 lg:border-r lg:border-b-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SolutionBadge solution={card.solution} />
            <Badge tone={status}>{statusLabel[status]}</Badge>
          </div>
          <h3 className="font-display text-[22px] leading-tight">{card.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[14px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {card.hoursPerWeek} h / week
            </span>
            {card.tools.length > 0 && <span>{card.tools.join(" · ")}</span>}
          </div>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
            <span className="font-medium text-ink">Today. </span>
            {card.today}
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-2">
            <span className="font-medium text-ink">With AI. </span>
            {card.promise}
          </p>
        </div>
        <div className="flex flex-col p-6">
          <div className="text-[13px] font-medium tracking-wide text-faint uppercase">How you will do it</div>
          <ol className="mt-3 flex-1 space-y-2.5">
            {card.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-[15px] leading-relaxed text-ink-2">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sunken text-[12px] font-semibold text-ink">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-xl bg-human-soft px-3 py-2.5 text-[14px] leading-relaxed text-human">
            <span className="font-medium">You decide. </span>
            {card.youDecide}
          </p>
          {card.companyRule && <p className="mt-2 text-[13px] leading-relaxed text-muted">Company rule: {card.companyRule}</p>}
          <Link
            href={`/my-work/${card.taskId}`}
            className="pressable mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-[16px] font-medium text-white hover:bg-accent-2"
          >
            Practice this task <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
