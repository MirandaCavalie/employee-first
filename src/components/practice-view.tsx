"use client";

import { ArrowLeft, Check, CircleHelp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buildDesk } from "@/lib/engine/desk";
import { useActivePerson, useHydrated, useStore } from "@/lib/store";
import { Badge, Button, Card, Empty, SolutionBadge } from "./ui";

export function PracticeView({ taskId }: { taskId: string }) {
  const hydrated = useHydrated();
  const person = useActivePerson();
  const company = useStore((s) => s.company);
  const setProgress = useStore((s) => s.setProgress);
  const progress = useStore((s) => s.progress);
  const desk = useMemo(() => (person && person.status === "completed" ? buildDesk(person, company) : null), [person, company]);
  const card = desk?.cards.find((c) => c.taskId === taskId) ?? null;
  const status = person ? progress[person.id]?.[taskId]?.status : undefined;

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [openHint, setOpenHint] = useState<string | null>(null);
  const [decision, setDecision] = useState("");

  if (!hydrated) return <div className="shimmer h-64 rounded-2xl" />;
  if (!card || !person || !desk) {
    return (
      <Empty title="This task is not on the desk" action={<Link href="/my-work">Back to My Work</Link>}>
        Finish the conversation first, then open a task from the desk.
      </Empty>
    );
  }

  const steps = card.practice.steps;
  const allChecked = steps.every((s) => done[s.id]);
  const decideStep = steps.find((s) => s.kind === "decide");
  const canFinish = allChecked && (!decideStep || decision.trim().length > 8);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/my-work" className="pressable mb-6 inline-flex items-center gap-2 text-[15px] text-muted hover:text-ink">
        <ArrowLeft className="size-4" />
        Back to {desk.firstName}'s desk
      </Link>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SolutionBadge solution={card.solution} />
        {status && <Badge tone={status}>{status}</Badge>}
      </div>
      <h1 className="font-display text-[32px] leading-tight">{card.practice.title}</h1>
      <p className="mt-2 text-[17px] leading-relaxed text-ink-2">
        This is not a chat. It is the last time this work went wrong, in your words, with a way through it that keeps you in charge.
      </p>

      <Card className="mt-6 p-6">
        <div className="text-[13px] font-medium tracking-wide text-faint uppercase">The last time</div>
        <p className="mt-2 text-[17px] leading-relaxed text-ink">“{card.practice.scene}”</p>
      </Card>

      <ol className="mt-6 space-y-4">
        {steps.map((step, i) => {
          const checked = Boolean(done[step.id]);
          return (
            <li key={step.id}>
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => setDone((d) => ({ ...d, [step.id]: !d[step.id] }))}
                    className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border ${
                      checked ? "border-accent bg-accent text-white" : "border-line-strong bg-surface text-muted"
                    }`}
                    aria-pressed={checked}
                    aria-label={`Mark “${step.title}” done`}
                  >
                    {checked ? <Check className="size-4" /> : <span className="text-[13px] font-semibold">{i + 1}</span>}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-[18px] font-semibold">{step.title}</div>
                    <p className="mt-1 text-[16px] leading-relaxed text-ink-2">{step.instruction}</p>
                    {step.kind === "decide" && (
                      <textarea
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        rows={3}
                        placeholder="Write the decision or the sentence you would send, in your words."
                        className="mt-3 w-full rounded-xl bg-paper px-3.5 py-3 text-[16px] leading-relaxed shadow-[0_0_0_1px_var(--color-line-strong)] outline-none focus:shadow-[0_0_0_1px_var(--color-accent),0_0_0_4px_var(--color-accent-soft)]"
                      />
                    )}
                    {step.hint && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setOpenHint((h) => (h === step.id ? null : step.id))}
                          className="inline-flex items-center gap-1.5 text-[14px] text-accent hover:underline"
                        >
                          <CircleHelp className="size-4" />
                          {openHint === step.id ? "Hide the hint" : "I'm stuck"}
                        </button>
                        {openHint === step.id && <p className="mt-2 rounded-xl bg-accent-soft px-3 py-2 text-[15px] leading-relaxed text-accent">{step.hint}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="accent"
          size="lg"
          disabled={!canFinish}
          icon={<Check className="size-4" />}
          onClick={() => {
            setProgress(person.id, card.taskId, "practiced", decision);
          }}
        >
          I practiced this
        </Button>
        <Button
          variant="secondary"
          size="lg"
          disabled={status !== "practiced" && status !== "using"}
          onClick={() => setProgress(person.id, card.taskId, "using", decision)}
        >
          I'm using this on real work
        </Button>
      </div>
      {!canFinish && (
        <p className="mt-3 text-[14px] text-muted">Mark each step, and write your decision, before you finish.</p>
      )}
      {status === "practiced" && <p className="mt-3 text-[15px] text-good">Saved. Try it on the next real instance of this task.</p>}
      {status === "using" && <p className="mt-3 text-[15px] text-good">This is now part of how you work this week.</p>}
    </div>
  );
}
