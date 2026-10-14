import { ArrowRight, BookOpen, Building2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BRAND, Wordmark } from "@/components/brand";

const steps = [
  {
    n: "1",
    title: "Hear how the week actually works",
    body: "A short conversation: repeated tasks, hours, tools, what goes wrong, what they already tried, and what must stay human.",
  },
  {
    n: "2",
    title: "Add the company, not a prompt",
    body: "Approved tools, what must never be pasted, house rules, and the decisions that always stay with a person.",
  },
  {
    n: "3",
    title: "A desk, not a chatbot",
    body: "Each task becomes a way of working: today, with AI, you decide, and a practice built from their own last incident.",
  },
];

const notThis = [
  { bad: "A generic chatbot on the intranet", good: "A desk generated from their week and your rules" },
  { bad: "A one-day training they forget", good: "Practice on the last time the work went wrong" },
  { bad: "“Just use Copilot”", good: "You stay in charge. The tool drafts. They send." },
  { bad: "A roadmap for leadership", good: "A personal way to use AI on Tuesday morning" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="Employee First home">
            <Wordmark size={30} />
          </Link>
          <nav className="flex items-center gap-1 text-[15px]">
            <a href="#how" className="hidden rounded-lg px-3 py-1.5 text-ink-2 hover:bg-sunken sm:block">
              How it works
            </a>
            <Link
              href="/my-work"
              className="pressable ml-2 inline-flex h-11 items-center rounded-xl bg-ink px-4 font-medium text-white hover:bg-ink-2"
            >
              Open Elena's desk
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[14px] text-muted shadow-card">
            <span className="size-1.5 rounded-full bg-signal" />
            AI adaptation for the people who already know the work
          </div>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.035em] text-ink sm:text-[58px]">
            {BRAND.tagline.slice(0, -1)}
            <span className="text-signal">.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[19px] leading-relaxed text-ink-2">{BRAND.pitch}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/my-work"
              className="pressable inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-5 text-[16px] font-medium text-white hover:bg-accent-2"
            >
              See Elena's desk <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/company"
              className="pressable inline-flex h-12 items-center rounded-xl bg-surface px-5 text-[16px] font-medium shadow-card hover:bg-[#fbfaf7]"
            >
              Read the company rules
            </Link>
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-line bg-surface/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="mb-3 grid size-9 place-items-center rounded-full bg-accent text-[14px] font-semibold text-white">{s.n}</div>
              <h2 className="text-[20px] font-semibold leading-tight">{s.title}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-[32px] leading-tight">Not another chatbot</h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-2">
          Older employees are not behind. They are the ones who know the exceptions. Most AI products ignore that and hand them a blank prompt.
        </p>
        <div className="mt-8 divide-y divide-line rounded-2xl bg-surface shadow-card">
          {notThis.map((row) => (
            <div key={row.bad} className="grid gap-2 px-5 py-4 md:grid-cols-2">
              <div className="text-[16px] text-muted line-through decoration-line-strong">{row.bad}</div>
              <div className="text-[16px] text-ink">{row.good}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          <div className="flex gap-3">
            <BookOpen className="mt-1 size-5 shrink-0 text-accent" />
            <div>
              <div className="text-[17px] font-semibold">Practice, then the real week</div>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-2">Each task has a walk-through built from their own last incident. No role-play with a stranger.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 size-5 shrink-0 text-accent" />
            <div>
              <div className="text-[17px] font-semibold">Judgment stays human</div>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-2">Pay, disputes, angry customers, and anything that needs a name on it stay with the person.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Building2 className="mt-1 size-5 shrink-0 text-accent" />
            <div>
              <div className="text-[17px] font-semibold">Company rules on every card</div>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-2">Approved tools and the forbidden list are not a PDF. They sit on the task they apply to.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-[14px] text-muted">
          <Wordmark size={24} />
          <div>From the Fieldwork interviews at the UC Berkeley hackathon. The product is the desk.</div>
        </div>
      </footer>
    </div>
  );
}
