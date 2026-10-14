"use client";

import { Button, Card, Field, Input, PageHeader, Textarea } from "@/components/ui";
import { useHydrated, useStore } from "@/lib/store";

function lines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function CompanyView() {
  const hydrated = useHydrated();
  const company = useStore((s) => s.company);
  const setCompany = useStore((s) => s.setCompany);

  if (!hydrated) return <div className="shimmer h-64 rounded-2xl" />;

  return (
    <div>
      <PageHeader
        title="Company context"
        lede="My Work is not generic. These rules travel into every desk: approved tools, what must never be pasted, and what always stays with a person."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <Field label="Company">
            <Input value={company.company} onChange={(e) => setCompany({ company: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Industry">
              <Input value={company.industry} onChange={(e) => setCompany({ industry: e.target.value })} />
            </Field>
            <Field label="Size">
              <Input value={company.employees} onChange={(e) => setCompany({ employees: e.target.value })} />
            </Field>
          </div>
          <Field label="What this company is like" hint="Shown on the desk">
            <Textarea value={company.about} onChange={(e) => setCompany({ about: e.target.value })} rows={4} />
          </Field>
          <Field label="Tone for drafts">
            <Input value={company.tone} onChange={(e) => setCompany({ tone: e.target.value })} />
          </Field>
        </Card>

        <Card className="space-y-4 p-6">
          <Field label="Approved AI tools" hint="One per line">
            <Textarea value={company.approvedTools.join("\n")} onChange={(e) => setCompany({ approvedTools: lines(e.target.value) })} rows={3} />
          </Field>
          <Field label="Never paste this" hint="One rule per line">
            <Textarea value={company.forbidden.join("\n")} onChange={(e) => setCompany({ forbidden: lines(e.target.value) })} rows={5} />
          </Field>
          <Field label="House rules" hint="One per line">
            <Textarea value={company.houseRules.join("\n")} onChange={(e) => setCompany({ houseRules: lines(e.target.value) })} rows={4} />
          </Field>
          <Field label="Always stays with a person" hint="One per line">
            <Textarea value={company.keepHuman.join("\n")} onChange={(e) => setCompany({ keepHuman: lines(e.target.value) })} rows={4} />
          </Field>
        </Card>
      </div>

      <p className="mt-6 text-[15px] text-muted">
        Changes apply to every desk immediately. Open <span className="font-medium text-ink">My Work</span> to see them on Elena's week.
      </p>
      <Button className="mt-3" onClick={() => useStore.getState().resetDemo()}>
        Restore Northwind demo rules
      </Button>
    </div>
  );
}
