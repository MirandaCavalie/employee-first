/** How AI should take on a piece of work. */
export type Solution = "automation" | "skill" | "agent" | "human";

export type TaskStatus = "new" | "learned" | "practiced" | "using";

export interface CompanyContext {
  company: string;
  industry: string;
  employees: string;
  synthetic: boolean;
  about: string;
  approvedTools: string[];
  forbidden: string[];
  houseRules: string[];
  keepHuman: string[];
  tone: string;
}

export interface InterviewTask {
  id: string;
  name: string;
  hoursPerWeek: number;
  tools: string[];
  process: string;
  pain: string;
}

export interface InterviewMessage {
  from: "guide" | "person";
  text: string;
}

export interface Interview {
  id: string;
  name: string;
  role: string;
  team: string;
  years: number | null;
  status: "invited" | "in-progress" | "completed";
  invitedAt: string;
  completedAt: string | null;
  transcript: InterviewMessage[];
  context: string;
  tasks: InterviewTask[];
  waits: string;
  aiToday: string;
  keepHuman: string;
  satisfaction: number | null;
}

export interface TaskProgress {
  status: TaskStatus;
  practicedAt: string | null;
  note: string;
}

export interface PracticeStep {
  id: string;
  title: string;
  instruction: string;
  kind: "read" | "do" | "check" | "decide";
  hint?: string;
}

export interface DeskCard {
  taskId: string;
  name: string;
  hoursPerWeek: number;
  tools: string[];
  process: string;
  solution: Solution;
  today: string;
  promise: string;
  steps: string[];
  youDecide: string;
  whyThis: string;
  companyRule: string | null;
  practice: {
    title: string;
    scene: string;
    steps: PracticeStep[];
  };
}

export interface Desk {
  personId: string;
  name: string;
  firstName: string;
  role: string;
  team: string;
  years: number | null;
  weekHours: number;
  stance: "new" | "cautious" | "informal";
  stanceNote: string;
  keepHuman: string;
  waits: string;
  rules: string[];
  cards: DeskCard[];
}
