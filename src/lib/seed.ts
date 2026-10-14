import { answer, promptFor, type RunnerState } from "./engine/interview";
import type { CompanyContext, Interview } from "./types";

export const seedCompany: CompanyContext = {
  company: "Northwind Freight",
  industry: "Logistics",
  employees: "640 people",
  synthetic: true,
  about: "A regional freight company. People have been here a long time. The work is invoices, trucks, pay, and customers who want to know where a shipment is.",
  approvedTools: ["Microsoft Copilot in 365", "Northwind knowledge base"],
  forbidden: [
    "Do not paste Social Security numbers, bank details, or full payroll files into any AI tool",
    "Do not upload vendor invoices or customer contracts to tools that are not on the approved list",
    "Do not let a tool send email to an employee or a customer on your behalf",
  ],
  houseRules: [
    "You stay responsible for anything that changes someone's pay or a customer's money.",
    "Use the company tone: plain, calm, no slang, no jokes about delays or pay.",
    "If you are unsure, stop and ask your manager. The tool does not get a vote.",
  ],
  keepHuman: [
    "Pay disputes and garnishments",
    "Anything that changes net pay",
    "Angry customers and escalations",
    "Carrier and employee conversations where trust is the work",
  ],
  tone: "plain, calm, short sentences, no slang",
};

interface Script {
  name: string;
  role: string;
  team: string;
  years: number | null;
  invitedAt: string;
  completedAt?: string;
  answers?: string[];
}

const scripts: Script[] = [
  {
    name: "Elena Rossi",
    role: "Payroll Specialist",
    team: "Finance",
    years: 22,
    invitedAt: "2026-10-05T09:00:00Z",
    completedAt: "2026-10-06T11:10:00Z",
    answers: [
      "I run payroll for the drivers and the office. Twice a month I build the pay run, fix the exceptions, and answer the same questions about pay stubs.",
      "22 years. I started in accounts payable and moved to payroll in 2008.",
      "Building the pay run in Workday\nEntering time-off and garnishments\nAnswering the same pay-stub questions\nRecalculating when hours don't match the bank file",
      "About 10 hours around each pay period, Workday and Excel",
      "Every depot sends time in a different spreadsheet. I retype the exceptions by hand so nobody is shorted.",
      "4 hours a week in Workday",
      "Garnishments and unpaid leave never land the same way twice. One wrong code and someone's take-home changes.",
      "6 hours a week in email and Slack",
      "People ask the same five questions after every payday. I rewrite the answer each time because I don't trust a canned reply with someone's money.",
      "5 hours a week in Excel and Workday",
      "Last Thursday the Oakland depot's hours didn't match the bank file. I spent the afternoon checking each driver so we wouldn't underpay anyone.",
      "Waiting on depot clerks to send time, and on managers to approve overtime.",
      "I tried ChatGPT once to soften an email about a missing timesheet. I deleted it. It sounded like it knew the person. It didn't.",
      "Anything that changes what someone takes home. I know the exceptions in this company. A tool doesn't.",
      "5",
    ],
  },
  {
    name: "Dana Okafor",
    role: "AP Specialist",
    team: "Finance",
    years: 11,
    invitedAt: "2026-10-05T09:00:00Z",
    completedAt: "2026-10-05T15:20:00Z",
    answers: [
      "I run accounts payable. Most of my week is invoices and vendor emails.",
      "11 years here.",
      "Keying invoices into NetSuite\nMatching invoices to purchase orders\nAnswering vendor payment status emails\nMonth-end reconciliation",
      "About 12 hours a week, PDFs from email into NetSuite",
      "Every vendor uses a different layout so I retype every line by hand.",
      "6 hours a week in NetSuite and Excel",
      "Quantities never match. Last Tuesday a carrier billed 14 pallets, the PO said 12, and I spent an hour emailing the warehouse.",
      "4 hours a week in Outlook",
      "Vendors email three times asking the same question: when will we get paid?",
      "2 days a month in Excel",
      "I export from the bank and NetSuite and tick off lines by hand in Excel.",
      "Waiting on managers to approve invoices over $5,000. Some sit for a week.",
      "I tried ChatGPT to read a PDF invoice once, but we're not allowed to upload vendor data.",
      "Deciding whether to pay when a vendor disputes a charge. That needs someone who knows the relationship.",
      "5",
    ],
  },
  {
    name: "Tom Becker",
    role: "Support Agent",
    team: "Customer Support",
    years: 8,
    invitedAt: "2026-10-05T09:00:00Z",
    completedAt: "2026-10-06T16:10:00Z",
    answers: [
      "I answer customer emails and calls about shipments and delays.",
      "8 years.",
      "Answering customer emails about delays\nLooking up tracking in the TMS\nProcessing damage claim forms",
      "20 hours a week in Zendesk",
      "Same question twenty times a day. This morning a storm delayed forty shipments and I wrote the same apology one by one.",
      "6 hours a week in the TMS and Zendesk",
      "I copy-paste the tracking number between three screens because the TMS and Zendesk don't talk.",
      "4 hours a week in email and Excel",
      "Customers send photos and PDFs by email and I fill in the claim form by hand.",
      "Waiting on the claims team and on dispatch for updates I can give the customer.",
      "No, we're not supposed to.",
      "Calming down a customer whose shipment is late for their own customer.",
      "4",
    ],
  },
];

export function blankInterview(id: string, name: string, role: string, team: string, invitedAt: string): Interview {
  return {
    id,
    name,
    role,
    team,
    years: null,
    status: "invited",
    invitedAt,
    completedAt: null,
    transcript: [],
    context: "",
    tasks: [],
    waits: "",
    aiToday: "",
    keepHuman: "",
    satisfaction: null,
  };
}

export function runScript(interview: Interview, answers: string[], company: string): RunnerState {
  let state: RunnerState = { step: "intro", taskIndex: 0, interview };
  const transcript = [...interview.transcript];
  for (const a of answers) {
    transcript.push({ from: "guide", text: promptFor(state, company) }, { from: "person", text: a });
    state = answer(state, a);
  }
  return { ...state, interview: { ...state.interview, transcript } };
}

export const seedPeople: Interview[] = scripts.map((s, i) => {
  const blank = blankInterview(`iv-seed-${i + 1}`, s.name, s.role, s.team, s.invitedAt);
  blank.years = s.years;
  if (!s.answers) return blank;
  const { interview } = runScript(blank, s.answers, seedCompany.company);
  return { ...interview, status: "completed" as const, completedAt: s.completedAt ?? null, years: s.years };
});

export const featuredPersonId = seedPeople[0]?.id ?? "iv-seed-1";
