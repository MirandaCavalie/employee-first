import type { CompanyContext, Desk, DeskCard, Interview, InterviewTask, PracticeStep, Solution } from "../types";
import { classifyTask, OTHER, processByName, solutionMeta } from "./processes";

const firstName = (name: string) => name.split(" ")[0];

export function stanceOf(aiToday: string): Desk["stance"] {
  if (!aiToday || /^\s*(no|nope|not really|none|never|we're not supposed)\b/i.test(aiToday)) return "new";
  if (/tried|once|not allowed|deleted|unsure|afraid|worried|not supposed/i.test(aiToday)) return "cautious";
  return "informal";
}

export function stanceCopy(stance: Desk["stance"], aiToday: string): string {
  if (stance === "new") return "You have not been using AI at work. We will start with one task, on your terms.";
  if (stance === "cautious") return aiToday || "You have tried AI once and were not sure. That is a good place to start.";
  return aiToday;
}

function matchingRule(task: InterviewTask, company: CompanyContext): string | null {
  const hay = `${task.name} ${task.pain} ${task.process}`.toLowerCase();
  const hit = company.forbidden.find((rule) => {
    const keys = rule.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    return keys.some((k) => hay.includes(k));
  });
  if (hit) return hit;
  if (/payroll|pay|employee|ssn|bank|vendor|invoice|customer/i.test(hay)) {
    return company.forbidden[0] ?? company.houseRules[0] ?? null;
  }
  return company.houseRules[0] ?? null;
}

function overrideHuman(task: InterviewTask, interview: Interview, company: CompanyContext): boolean {
  const hay = `${task.name} ${task.pain} ${interview.keepHuman} ${company.keepHuman.join(" ")}`.toLowerCase();
  return /decid|judgment|relationship|dispute|negotiat|pay when|change.*pay|who gets|hard conversation/i.test(hay) &&
    /approv|decid|disput|negotiat|relationship|exception|garnish/i.test(`${task.name} ${task.pain} ${task.process}`);
}

function stepsFor(task: InterviewTask, solution: Solution, processName: string, company: CompanyContext): string[] {
  const tools = task.tools.length ? task.tools.slice(0, 2).join(" and ") : "the tools you already use";
  const p = processByName(processName);
  const inputs = p?.inputs ?? "what you already have in front of you";
  const output = p?.output ?? "a first pass you can check";

  switch (solution) {
    case "skill":
      return [
        `Open the work in ${tools}, the way you do now.`,
        `Ask the approved helper for a draft using ${inputs}. Do not paste anything on the forbidden list.`,
        `Read the draft against what you know. Fix the tone so it sounds like ${company.company}.`,
        "You send it. Nothing goes out without you.",
      ];
    case "automation":
      return [
        `Keep ${tools} as the place you work.`,
        `Let the repeatable part pull ${inputs} on a schedule.`,
        `You only open the exceptions — the lines that do not match.`,
        `If a number looks wrong, you stop it. The flow does not send anything you have not seen.`,
      ];
    case "agent":
      return [
        `When new work arrives, the helper reads ${inputs} in ${tools}.`,
        `It works through the usual steps and prepares ${output}.`,
        "It stops and shows you anything that does not fit the usual pattern.",
        "You decide what happens next. It does not act in your name.",
      ];
    case "human":
      return [
        `You still own this. The helper can only gather ${inputs} beforehand.`,
        "Read the prep the way you would read a note from a careful colleague.",
        "You make the call. You write the reason.",
        "Nothing about pay, policy, or a person is final until you say so.",
      ];
  }
}

function practiceSteps(task: InterviewTask, solution: Solution, company: CompanyContext): PracticeStep[] {
  const tools = task.tools[0] ?? "your usual tool";
  return [
    {
      id: "read",
      title: "Read the last time it happened",
      instruction: "This is your own words, not a made-up case. Sit with it for a moment before you touch a tool.",
      kind: "read",
    },
    {
      id: "prep",
      title: "Get only what you are allowed to use",
      instruction: `Open ${tools}. Pull the record you need. Do not copy ${company.forbidden[0] ?? "personal or financial details"} into any new window.`,
      kind: "do",
      hint: "If you are unsure whether something is allowed, leave it out. You can still do the work.",
    },
    {
      id: "ask",
      title: solution === "human" ? "Ask only for prep" : "Ask for a first pass",
      instruction:
        solution === "human"
          ? "Ask the helper to list the facts and the open questions. Do not ask it to decide."
          : `Ask the approved helper for a first pass. Tell it the company tone: ${company.tone}`,
      kind: "do",
      hint: company.approvedTools.length
        ? `Approved here: ${company.approvedTools.join(", ")}.`
        : "Use only tools your company has approved.",
    },
    {
      id: "check",
      title: "Check it against what you know",
      instruction: "Mark anything that is wrong, too confident, or missing the exception you remember.",
      kind: "check",
      hint: "Your years on this job are the quality check. If it feels off, it is off.",
    },
    {
      id: "decide",
      title: "You decide",
      instruction:
        solution === "human"
          ? "Write the decision in one sentence, in your words. That sentence is the work."
          : "Edit the draft until you would put your name on it. Then it can go.",
      kind: "decide",
    },
  ];
}

function buildCard(task: InterviewTask, interview: Interview, company: CompanyContext): DeskCard {
  const process = task.process === OTHER ? classifyTask(`${task.name} ${task.pain}`) : task.process;
  const def = processByName(process);
  let solution: Solution = def?.solution ?? "skill";
  if (overrideHuman(task, interview, company)) solution = "human";

  const today = task.pain || `You do “${task.name}” by hand in ${task.tools.join(" and ") || "your current tools"}.`;
  const promise = solutionMeta[solution].you;
  const youDecide = def
    ? `You step in when ${def.checkpoint}. ${interview.keepHuman ? `You also said: “${interview.keepHuman}”` : ""}`.trim()
    : interview.keepHuman || "You step in whenever it would change a person's money, standing, or trust.";

  return {
    taskId: task.id,
    name: task.name,
    hoursPerWeek: task.hoursPerWeek,
    tools: task.tools,
    process,
    solution,
    today,
    promise,
    steps: stepsFor(task, solution, process, company),
    youDecide,
    whyThis: def?.description ?? "This is repeated work we can practice with a clear stop for you.",
    companyRule: matchingRule(task, company),
    practice: {
      title: `Practice: ${task.name}`,
      scene: task.pain || `${firstName(interview.name)}'s usual week on this task.`,
      steps: practiceSteps(task, solution, company),
    },
  };
}

export function buildDesk(interview: Interview, company: CompanyContext): Desk {
  const stance = stanceOf(interview.aiToday);
  const rules = [...company.houseRules.slice(0, 3), ...company.forbidden.slice(0, 2)];
  return {
    personId: interview.id,
    name: interview.name,
    firstName: firstName(interview.name),
    role: interview.role,
    team: interview.team,
    years: interview.years,
    weekHours: Math.round(interview.tasks.reduce((n, t) => n + t.hoursPerWeek, 0) * 10) / 10,
    stance,
    stanceNote: stanceCopy(stance, interview.aiToday),
    keepHuman: interview.keepHuman,
    waits: interview.waits,
    rules,
    cards: interview.tasks.map((t) => buildCard(t, interview, company)),
  };
}

export function deskStats(desk: Desk, progress: Record<string, { status: string }>) {
  const total = desk.cards.length;
  const practiced = desk.cards.filter((c) => {
    const s = progress[c.taskId]?.status;
    return s === "practiced" || s === "using";
  }).length;
  const using = desk.cards.filter((c) => progress[c.taskId]?.status === "using").length;
  const hours = desk.cards.reduce((n, c) => n + c.hoursPerWeek, 0);
  return { total, practiced, using, hours };
}
