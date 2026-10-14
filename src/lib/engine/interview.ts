import type { Interview } from "../types";
import { classifyTask, OTHER } from "./processes";

export const WEEKS_PER_MONTH = 4.33;
const MAX_TASKS = 5;

const toolNames: [RegExp, string][] = [
  [/excel|spreadsheet/i, "Excel"],
  [/google sheets|\bsheets\b/i, "Google Sheets"],
  [/slack/i, "Slack"],
  [/teams\b/i, "Teams"],
  [/e-?mail|gmail|outlook|inbox/i, "Email"],
  [/salesforce/i, "Salesforce"],
  [/hubspot/i, "HubSpot"],
  [/zendesk/i, "Zendesk"],
  [/netsuite/i, "NetSuite"],
  [/\bsap\b/i, "SAP"],
  [/quickbooks/i, "QuickBooks"],
  [/workday/i, "Workday"],
  [/bamboo/i, "BambooHR"],
  [/jira/i, "Jira"],
  [/asana/i, "Asana"],
  [/notion/i, "Notion"],
  [/power ?bi/i, "Power BI"],
  [/\btms\b/i, "TMS"],
  [/\berp\b/i, "ERP"],
  [/linkedin/i, "LinkedIn"],
  [/google docs|\bword\b|\bdocs\b/i, "Docs"],
  [/slides|powerpoint|deck/i, "Slides"],
  [/chatgpt|copilot|claude|gemini/i, "AI assistant"],
  [/phone|calls?\b/i, "Phone"],
];

export function parseTools(text: string): string[] {
  return toolNames.filter(([re]) => re.test(text)).map(([, name]) => name);
}

const wordNumbers: Record<string, number> = { an: 1, a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, eight: 8, ten: 10, twelve: 12 };

export function parseHours(text: string): number | null {
  const t = text.toLowerCase();
  let hours: number | null = null;
  const range = t.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(h|hours?|hrs?)\b/);
  const num = t.match(/(\d+(?:\.\d+)?)\s*(h|hours?|hrs?|min|minutes?|days?)\b/);
  const word = t.match(/\b(an|a|one|two|three|four|five|six|eight|ten|twelve)\s+(hours?|days?)\b/);
  if (range) hours = (Number(range[1]) + Number(range[2])) / 2;
  else if (num) hours = Number(num[1]) * (num[2].startsWith("min") ? 1 / 60 : num[2].startsWith("day") ? 8 : 1);
  else if (/half (a )?day/.test(t)) hours = 4;
  else if (/full day|whole day/.test(t)) hours = 8;
  else if (word) hours = wordNumbers[word[1]] * (word[2].startsWith("day") ? 8 : 1);
  if (hours == null) return null;
  if (/\bper (month|mo)\b|a month|each month|monthly|month[- ]end/.test(t)) hours = hours / WEEKS_PER_MONTH;
  else if (/\bper day|a day|each day|daily|every day/.test(t) && !/half|full|whole/.test(t)) hours = hours * 5;
  return Math.round(hours * 10) / 10;
}

export function parseTaskList(text: string): string[] {
  const parts = text.includes("\n") ? text.split(/\r?\n/) : text.split(/;|,(?![^(]*\))/);
  return parts
    .map((p) => p.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((p) => p.length > 2)
    .slice(0, MAX_TASKS);
}

export type Step = "intro" | "years" | "tasks" | "hours" | "hoursProbe" | "pain" | "painProbe" | "waits" | "aiToday" | "human" | "rating" | "review";

export interface RunnerState {
  step: Step;
  taskIndex: number;
  interview: Interview;
}

const firstName = (name: string) => name.split(" ")[0];
const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export function promptFor(state: RunnerState, company: string): string {
  const { interview: iv, taskIndex } = state;
  const task = iv.tasks[taskIndex]?.name;
  switch (state.step) {
    case "intro":
      return `Hi ${firstName(iv.name)}. I'm going to learn how your week actually works at ${company}, so we can build you a desk that uses AI on your real work — and leaves alone what should stay yours. Talk the way you talk. What's your role, and what does a normal week look like?`;
    case "years":
      return "How long have you been doing this kind of work? A number is enough.";
    case "tasks":
      return "Which tasks do you repeat every week? List up to five, one per line.";
    case "hours":
      return `About how long does “${task}” take you in a typical week, and which tools do you use for it?`;
    case "hoursProbe":
      return `Roughly: an hour, half a day, or a full day a week on “${task}”?`;
    case "pain":
      return `What makes “${task}” slow or frustrating?`;
    case "painProbe":
      return "Can you walk me through the last time that happened?";
    case "waits":
      return "Where does your work wait on someone or something else?";
    case "aiToday":
      return "Have you tried any AI tools, even once? What happened?";
    case "human":
      return "Which part of your job should stay with you, no matter how good the tools get?";
    case "rating":
      return "Last one: how was this conversation, from 1 to 5?";
    case "review":
      return "Thank you. Here's what I heard. Fix anything that's off, then we'll build your desk.";
  }
}

const uid = () => Math.random().toString(36).slice(2, 8);

function parseYears(text: string): number | null {
  const n = text.match(/(\d{1,2})\s*(years?|yrs?)?/i);
  if (!n) return null;
  const years = Number(n[1]);
  return years > 0 && years < 60 ? years : null;
}

export function answer(state: RunnerState, text: string): RunnerState {
  const iv = { ...state.interview, tasks: [...state.interview.tasks] };
  const to = (step: Step, taskIndex = state.taskIndex): RunnerState => ({ step, taskIndex, interview: iv });
  const task = iv.tasks[state.taskIndex];
  const nextTask = () => (state.taskIndex + 1 < iv.tasks.length ? to("hours", state.taskIndex + 1) : to("waits"));

  switch (state.step) {
    case "intro":
      iv.context = text;
      return to("years");
    case "years":
      iv.years = parseYears(text);
      return to("tasks");
    case "tasks": {
      const names = parseTaskList(text);
      if (!names.length) return to("tasks");
      iv.tasks = names.map((name) => ({ id: `t-${uid()}`, name, hoursPerWeek: 0, tools: [], pain: "", process: classifyTask(name) }));
      return to("hours", 0);
    }
    case "hours":
    case "hoursProbe": {
      const hours = parseHours(text);
      const tools = parseTools(text);
      iv.tasks[state.taskIndex] = { ...task, hoursPerWeek: hours ?? task.hoursPerWeek, tools: tools.length ? tools : task.tools };
      if (hours == null && state.step === "hours") return to("hoursProbe");
      return to("pain");
    }
    case "pain": {
      const process = task.process === OTHER ? classifyTask(`${task.name} ${text}`) : task.process;
      const tools = [...new Set([...task.tools, ...parseTools(text)])];
      iv.tasks[state.taskIndex] = { ...task, pain: text, process, tools };
      return words(text) < 7 ? to("painProbe") : nextTask();
    }
    case "painProbe": {
      const pain = `${task.pain} ${text}`.trim();
      const process = task.process === OTHER ? classifyTask(`${task.name} ${pain}`) : task.process;
      iv.tasks[state.taskIndex] = { ...task, pain, process, tools: [...new Set([...task.tools, ...parseTools(text)])] };
      return nextTask();
    }
    case "waits":
      iv.waits = text;
      return to("aiToday");
    case "aiToday":
      iv.aiToday = text;
      return to("human");
    case "human":
      iv.keepHuman = text;
      return to("rating");
    case "rating": {
      const n = Number(text.match(/[1-5]/)?.[0]);
      iv.satisfaction = Number.isFinite(n) ? n : null;
      return to("review");
    }
    case "review":
      return state;
  }
}

export function replay(interview: Interview): RunnerState {
  const answers = interview.transcript.filter((m) => m.from === "person").map((m) => m.text);
  let state: RunnerState = {
    step: "intro",
    taskIndex: 0,
    interview: { ...interview, tasks: [], context: "", waits: "", aiToday: "", keepHuman: "", satisfaction: null, years: interview.years },
  };
  for (const a of answers) state = answer(state, a);
  return state;
}
