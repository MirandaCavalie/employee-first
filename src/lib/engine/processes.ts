import type { Solution } from "../types";

export interface ProcessDef {
  name: string;
  re: RegExp;
  description: string;
  solution: Solution;
  trigger: string;
  inputs: string;
  output: string;
  checkpoint: string;
}

const def = (
  name: string,
  re: RegExp,
  description: string,
  solution: Solution,
  trigger: string,
  inputs: string,
  output: string,
  checkpoint: string,
): ProcessDef => ({ name, re, description, solution, trigger, inputs, output, checkpoint });

/** Order matters: the first pattern that matches a task wins. */
export const processes: ProcessDef[] = [
  def(
    "Invoice & expense processing",
    /invoice|expense|receipt|payable|billing|purchase order|\bpos?\b/i,
    "Reading invoices and receipts, matching them to orders, coding and routing them for payment.",
    "agent",
    "a new invoice or receipt arrives",
    "the PDF, the matching purchase order, and the vendor record",
    "a coded entry ready to post, or an exception with the reason",
    "amounts don't match the order or exceed the approval limit",
  ),
  def(
    "Payroll & pay corrections",
    /payroll|pay ?stub|garnish|net pay|pay run|timesheet|hours don't match|bank file/i,
    "Building the pay run, checking exceptions, and answering questions about pay.",
    "human",
    "a pay period closes or someone asks about their pay",
    "the time file, exceptions, and the employee record",
    "a pay run ready for your sign-off, or a clear exception list",
    "anything that would change what someone is paid",
  ),
  def(
    "Reconciliation & data checks",
    /reconcil|match(ing)? .*(records|accounts|statements)|audit|double[- ]check|verify|spot[- ]check|\bqa\b|errors|check(ing)? (each|every|against)|recalculat/i,
    "Comparing records across systems and chasing the lines that don't match.",
    "agent",
    "a period closes or a new export lands",
    "exports from both systems",
    "a matched set plus a short list of real discrepancies",
    "a discrepancy needs a correcting entry",
  ),
  def(
    "Inbox & ticket triage",
    /triage|ticket|inbox|queue|rout(e|ing)|categori|shared mailbox/i,
    "Reading incoming requests, tagging them, and sending each one to the right person.",
    "agent",
    "a request lands in the shared inbox or ticket queue",
    "the message, the customer record, and past tickets",
    "a tagged, prioritized ticket assigned to the right owner",
    "the request is urgent, angry, or doesn't fit a category",
  ),
  def(
    "Customer replies & FAQs",
    /repl(y|ies)|respond|answer(ing)? (customer|client|employee|the same|\w+ questions)|faq|where is my|pay-?stub|customer (emails?|questions?)|questions about|chat/i,
    "Writing answers to questions people ask every week, most of them repeats.",
    "skill",
    "a question is opened",
    "the question, the record, and the approved answers",
    "a draft reply in the company's tone",
    "the reply promises money, a date, or a policy exception",
  ),
  def(
    "Lead research & CRM hygiene",
    /lead|prospect|enrich|crm|salesforce|hubspot|account research/i,
    "Researching companies and contacts, and keeping CRM records complete.",
    "agent",
    "a new lead is created or a deal changes stage",
    "the company website, LinkedIn, and past emails",
    "an enriched CRM record with a short account brief",
    "the helper wants to email the prospect",
  ),
  def(
    "Reporting & dashboards",
    /report|dashboard|kpi|metrics|recap|numbers|weekly (deck|slides)|performance deck|month[- ]end pack/i,
    "Pulling numbers from several tools into the same weekly or monthly report.",
    "automation",
    "the reporting schedule (weekly or month-end)",
    "exports from the source systems",
    "the finished report, with a written summary of changes",
    "a number moves more than the usual range",
  ),
  def(
    "Data entry & system updates",
    /data entry|enter(ing)?|re-?typ|timesheets?|keyed|copy(ing)?[- ]past|key(ing)? in|input(ting)?|fill(ing)? (in|out)|updat(e|ing) (the )?(erp|system|sheet|spreadsheet|records?)|log(ging)? /i,
    "Retyping information from emails, PDFs, or one system into another.",
    "automation",
    "a record changes in the source system",
    "the source record or document",
    "the same data written to the destination system",
    "a required field is missing or ambiguous",
  ),
  def(
    "Scheduling & coordination",
    /schedul|calendar|book(ing)?|coordinat|dispatch|shift|rota|pickups?|deliver(y|ies) slots?/i,
    "Finding times, booking slots, and reshuffling plans when something changes.",
    "automation",
    "a booking request or a change to the plan",
    "calendars, capacity, and constraints",
    "a confirmed slot sent to everyone involved",
    "no slot satisfies every constraint",
  ),
  def(
    "Status updates & follow-ups",
    /status|follow(ing)?[- ]?ups?|chas(e|ing)|nudg|remind|standup|tracker|update (the )?(team|stakeholders|clients?)/i,
    "Asking people where things stand and copying the answer into trackers and updates.",
    "automation",
    "an item goes past its due date, or the weekly update is due",
    "the tracker and recent activity",
    "a reminder to the owner, and a status digest",
    "an item is blocked for more than a week",
  ),
  def(
    "Onboarding & access requests",
    /onboard|new hires?|access|account set ?up|provision|orientation|offboard|equipment/i,
    "Setting up accounts, equipment, documents, and first-week plans for new people.",
    "agent",
    "a new hire is signed in the HR system",
    "the role, start date, and the access checklist for that role",
    "accounts requested, documents sent, and a first-week plan",
    "access to sensitive systems or anything off the checklist",
  ),
  def(
    "Document drafting",
    /draft|proposal|contract|quote|quotation|rfp|policy|job (description|post)|write|writing|templates?|letters?/i,
    "Writing proposals, quotes, policies, and contracts that mostly reuse past versions.",
    "skill",
    "someone starts a new proposal, quote, or document",
    "the request, past versions, and the template",
    "a first draft that follows the template",
    "pricing, legal terms, or commitments change",
  ),
  def(
    "Research & summarization",
    /research|summar|meeting notes|minutes|read(ing)? (through|documents|contracts)|notes|digest|compil/i,
    "Reading long documents, calls, or threads and turning them into short notes.",
    "skill",
    "a meeting ends or a long document arrives",
    "the transcript, document, or thread",
    "a summary with decisions and next steps",
    "the summary is shared outside the team",
  ),
  def(
    "Approvals & sign-off",
    /approv|sign[- ]?off|authori[sz]/i,
    "Deciding whether something can go ahead and taking responsibility for it.",
    "human",
    "a request needs a decision",
    "the request and its supporting documents",
    "a decision with a reason",
    "always",
  ),
  def(
    "Negotiation & relationships",
    /negotiat|relationship|client calls?|account management|escalat|renewals?|partners?/i,
    "Calls, negotiations, and escalations where trust and judgment matter.",
    "human",
    "a client or partner needs a conversation",
    "the account history",
    "a decision or agreement",
    "always",
  ),
  def(
    "Planning & people decisions",
    /plan(ning)?|strateg|forecast|budget|prioriti|hiring|interview(ing)? candidates|coach|1:1|one[- ]on[- ]ones?|performance reviews?/i,
    "Setting priorities, plans, budgets, and making decisions about people.",
    "human",
    "a planning cycle or a people decision",
    "the numbers and context behind the decision",
    "a plan or decision owned by a person",
    "always",
  ),
];

export const OTHER = "Other";

export function classifyTask(text: string): string {
  return processes.find((p) => p.re.test(text))?.name ?? OTHER;
}

export const processByName = (name: string) => processes.find((p) => p.name === name);

/** Plain-language labels. No jargon on the desk. */
export const solutionMeta: Record<Solution, { label: string; short: string; you: string }> = {
  automation: {
    label: "Repeatable flow",
    short: "Same steps every time",
    you: "The repeatable part can run itself. You check the exceptions.",
  },
  skill: {
    label: "You stay in charge",
    short: "You call it",
    you: "You ask for a draft. You edit it. You send it.",
  },
  agent: {
    label: "Works through the steps",
    short: "Stops when you must decide",
    you: "It can work through the steps and stop when a person has to decide.",
  },
  human: {
    label: "Stays with you",
    short: "AI only prepares",
    you: "This stays with you. AI can only prepare notes. You decide.",
  },
};
