"use client";

import { ArrowLeft, ArrowUp, Check, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { Button, Card, Input } from "@/components/ui";
import { answer, promptFor, replay, type RunnerState } from "@/lib/engine/interview";
import { OTHER, processes } from "@/lib/engine/processes";
import { useStore } from "@/lib/store";
import type { Interview, InterviewTask } from "@/lib/types";

export function InterviewRunner({ interview, onClose }: { interview: Interview; onClose: () => void }) {
  const company = useStore((s) => s.company.company);
  const savePerson = useStore((s) => s.savePerson);
  const readOnly = interview.status === "completed";
  const [state, setState] = useState<RunnerState>(() => (readOnly ? { step: "review", taskIndex: 0, interview } : replay(interview)));
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const iv = state.interview;
  const prompt = promptFor(state, company);
  const answered = iv.transcript.filter((m) => m.from === "person").length;
  const expected = 8 + Math.max(iv.tasks.length, 3) * 2;

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [iv.transcript.length, state.step]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const next = answer(state, text);
    const transcript = [...iv.transcript, { from: "guide" as const, text: prompt }, { from: "person" as const, text }];
    const updated: Interview = { ...next.interview, transcript, status: "in-progress" };
    setState({ ...next, interview: updated });
    savePerson(updated);
    setDraft("");
  }

  function submit() {
    const done: Interview = { ...iv, status: "completed", completedAt: new Date().toISOString() };
    savePerson(done);
    toast.success("Your desk is ready", { description: `${done.tasks.length} tasks from your week.` });
    onClose();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button type="button" onClick={onClose} className="pressable inline-flex items-center gap-1.5 text-[15px] text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> People
        </button>
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-sunken">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${state.step === "review" ? 100 : Math.min(95, (answered / expected) * 100)}%` }}
            />
          </div>
          {state.step === "review" ? "Done" : "A few more questions"}
        </div>
      </div>

      <div className="mb-5">
        <h1 className="font-display text-[28px] leading-tight">{iv.name}</h1>
        <div className="text-[16px] text-muted">
          {iv.role} · {iv.team}
          {iv.years ? ` · ${iv.years} years` : ""}
        </div>
      </div>

      <div className="space-y-3">
        {iv.transcript.map((m, i) => (
          <Bubble key={i} from={m.from} text={m.text} />
        ))}
        {!readOnly && <Bubble from="guide" text={prompt} live />}
        <div ref={bottom} />
      </div>

      {state.step !== "review" ? (
        <div className="sticky bottom-4 mt-5">
          <Card className="flex items-end gap-2 p-2">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={state.step === "tasks" ? 4 : 2}
              placeholder={state.step === "tasks" ? "One task per line" : "Type your answer"}
              className="flex-1 resize-none bg-transparent px-3 py-2 text-[16px] leading-relaxed outline-none placeholder:text-faint"
            />
            <Button variant="accent" onClick={send} disabled={!draft.trim()} aria-label="Send" icon={<ArrowUp className="size-4" />} />
          </Card>
          <div className="mt-1.5 px-1 text-[13px] text-faint">Enter to send · Shift+Enter for a new line</div>
        </div>
      ) : (
        <Captured
          interview={iv}
          readOnly={readOnly}
          onEdit={(id, patch) => setState({ ...state, interview: { ...iv, tasks: iv.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) } })}
          onRemove={(id) => setState({ ...state, interview: { ...iv, tasks: iv.tasks.filter((t) => t.id !== id) } })}
        >
          {!readOnly && (
            <Button variant="accent" size="lg" onClick={submit} icon={<Check className="size-4" />}>
              Build my desk
            </Button>
          )}
        </Captured>
      )}
    </div>
  );
}

function Bubble({ from, text, live }: { from: "guide" | "person"; text: string; live?: boolean }) {
  if (from === "person")
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[16px] leading-relaxed whitespace-pre-line text-white">{text}</div>
      </div>
    );
  return (
    <div className={`flex items-start gap-2.5 ${live ? "enter" : ""}`}>
      <Logo size={32} className="mt-0.5" />
      <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-surface px-4 py-2.5 text-[16px] leading-relaxed text-ink shadow-card">{text}</div>
    </div>
  );
}

function Captured({
  interview,
  readOnly,
  onEdit,
  onRemove,
  children,
}: {
  interview: Interview;
  readOnly: boolean;
  onEdit: (id: string, patch: Partial<InterviewTask>) => void;
  onRemove: (id: string) => void;
  children?: React.ReactNode;
}) {
  const notes = [
    { label: "Waits on", text: interview.waits },
    { label: "AI so far", text: interview.aiToday },
    { label: "Stays with you", text: interview.keepHuman },
  ].filter((n) => n.text);
  return (
    <Card className="enter mt-6 p-5">
      <div className="mb-3 text-[16px] font-semibold">What we heard</div>
      <div className="divide-y divide-line">
        {interview.tasks.map((t) => (
          <div key={t.id} className="grid items-center gap-3 py-3 md:grid-cols-[1fr_200px_88px_auto]">
            <div className="min-w-0">
              <div className="text-[15px] font-medium">{t.name}</div>
              {t.pain && <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">“{t.pain}”</div>}
            </div>
            {readOnly ? (
              <div className="text-[14px] text-ink-2">{t.process}</div>
            ) : (
              <select
                value={t.process}
                onChange={(e) => onEdit(t.id, { process: e.target.value })}
                aria-label={`Process for ${t.name}`}
                className="h-10 rounded-lg bg-surface px-2 text-[14px] shadow-[0_0_0_1px_var(--color-line-strong)] outline-none"
              >
                {[...processes.map((p) => p.name), OTHER].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-1 text-[14px] text-muted">
              {readOnly ? (
                <span className="tabular-nums">{t.hoursPerWeek}</span>
              ) : (
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={t.hoursPerWeek}
                  onChange={(e) => onEdit(t.id, { hoursPerWeek: Number(e.target.value) })}
                  className="h-10 w-16 text-right tabular-nums"
                  aria-label={`Hours per week for ${t.name}`}
                />
              )}
              h/wk
            </div>
            <div className="flex justify-end">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onRemove(t.id)}
                  aria-label={`Remove ${t.name}`}
                  className="pressable grid size-8 place-items-center rounded-lg text-faint hover:bg-sunken hover:text-bad"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {notes.length > 0 && (
        <div className="mt-4 grid gap-3 text-[14px] md:grid-cols-3">
          {notes.map((n) => (
            <div key={n.label} className="rounded-xl bg-sunken/70 p-3">
              <div className="mb-1 font-medium text-ink-2">{n.label}</div>
              <div className="leading-relaxed text-ink-2">{n.text}</div>
            </div>
          ))}
        </div>
      )}
      {children && <div className="mt-5 flex justify-end">{children}</div>}
    </Card>
  );
}
