"use client";

import { MessagesSquare, Plus } from "lucide-react";
import { useState } from "react";
import { InterviewRunner } from "@/components/interview-runner";
import { Button, Card, Empty, Field, Input, PageHeader } from "@/components/ui";
import { useHydrated, useStore } from "@/lib/store";

export function PeopleView() {
  const hydrated = useHydrated();
  const people = useStore((s) => s.people);
  const activeId = useStore((s) => s.activePersonId);
  const setActive = useStore((s) => s.setActivePerson);
  const invite = useStore((s) => s.invitePerson);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "", team: "" });

  const open = people.find((p) => p.id === openId);

  if (!hydrated) return <div className="shimmer h-64 rounded-2xl" />;
  if (open) return <InterviewRunner interview={open} onClose={() => setOpenId(null)} />;

  return (
    <div>
      <PageHeader
        title="People"
        lede="Each person gets their own desk. The conversation is how we learn the week. My Work is what we build from it."
      />

      <Card className="mb-8 p-5">
        <div className="mb-3 text-[16px] font-semibold">Invite someone</div>
        <form
          className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            const id = invite({ name: form.name.trim(), role: form.role.trim() || "Employee", team: form.team.trim() || "Team" });
            setForm({ name: "", role: "", team: "" });
            setOpenId(id);
          }}
        >
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
          </Field>
          <Field label="Role">
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Payroll Specialist" />
          </Field>
          <Field label="Team">
            <Input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Finance" />
          </Field>
          <div className="flex items-end">
            <Button variant="accent" type="submit" icon={<Plus className="size-4" />}>
              Start conversation
            </Button>
          </div>
        </form>
      </Card>

      {people.length === 0 ? (
        <Empty icon={<MessagesSquare className="size-5" />} title="No conversations yet">
          Invite the first person. Eight minutes. Then their desk exists.
        </Empty>
      ) : (
        <ul className="space-y-3">
          {people.map((p) => {
            const current = p.id === activeId;
            return (
              <li key={p.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <div className="text-[18px] font-semibold">
                      {p.name}
                      {current && <span className="ml-2 text-[13px] font-medium text-accent">On the desk</span>}
                    </div>
                    <div className="text-[15px] text-muted">
                      {p.role} · {p.team}
                      {p.years ? ` · ${p.years} years` : ""}
                      {p.status === "completed" ? ` · ${p.tasks.length} tasks` : ` · ${p.status}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={current ? "secondary" : "ghost"}
                      onClick={() => setActive(p.id)}
                    >
                      {current ? "Viewing" : "Open desk"}
                    </Button>
                    <Button variant="accent" onClick={() => setOpenId(p.id)}>
                      {p.status === "completed" ? "Read conversation" : "Continue"}
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
