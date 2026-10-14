# Employee First

**Use AI on the work you already do.**

A conversation about someone’s real week, plus the rules of their company, becomes a personal desk: how to use AI on each task, what stays with them, and a practice they can finish. Not a chatbot.

This is the product that grew out of [Fieldwork](https://github.com/MirandaCavalie/uc-berkeley-hackathon). Fieldwork asked everyone how work gets done. Employee First takes the same interview and company context and turns them into **My Work** — the adaptation layer for people who already know the job, including the generation that is usually handed a tool and told to figure it out.

## What you will see

The demo is Elena Rossi, payroll specialist, 22 years in. She tried ChatGPT once, deleted the draft, and will not let a tool touch take-home pay.

| Screen | What it is |
| --- | --- |
| `/my-work` | Her desk. Each repeated task has today’s way, the way with AI, the human stop, and a practice. |
| `/my-work/[task]` | Practice on her last real incident. Checklists and a written decision. No chat thread. |
| `/interview` | The conversation that feeds the desk. |
| `/company` | Approved tools, the forbidden list, house rules, what always stays human. |
| `/people` | Switch to Dana (AP) or Tom (support), or invite someone new. |

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. **Reset demo** in the sidebar restores Elena and Northwind Freight.

No API keys. The desk is generated in the browser from the interview and the company rules.

## How the desk is built

1. The interview captures tasks, hours, tools, the last time it went wrong, current AI use, and what must stay human.
2. Company context adds approved tools, forbidden data, tone, and house rules.
3. Each task is classified (invoice, payroll, FAQ, reconciliation, …) and given a way of working: a repeatable flow, a helper the person calls, a helper that works through the steps and stops, or work that stays human.
4. Practice steps are written in the second person, using their tools and their last incident.

Hours, quotes, and “you decide” lines always trace back to what the person said.

## Stack

Next.js 16, React 19, Tailwind 4, Zustand. Same family as the hackathon app, new product.
