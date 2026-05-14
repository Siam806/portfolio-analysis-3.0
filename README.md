# Portfolio Analysis 3.0 — Talk to Your Portfolio

AI-native portfolio intelligence for Trade Republic investors. Your portfolio, personified.

## Features

- **Talk to Your Portfolio** — Revolutionary conversational interface where your portfolio speaks in first person
- **Trade Republic CSV Import** — Upload your transaction exports for instant analysis
- **Deterministic Finance Engine** — Trusted calculations for holdings, allocation, gains/losses
- **ETF Look-Through** — See your true underlying exposure through ETFs
- **Risk Engine** — Configurable threshold-based risk detection
- **Scenario Simulation** — Test what-if buy/sell scenarios
- **AI Workflows** — Health reviews, concentration checks, rebalancing plans, monthly reports
- **Markdown Reports** — Export portfolio reports locally
- **Privacy-First** — Self-hosted, local storage, your API keys stay on your machine

## Tech Stack

- **Framework:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts
- **State:** Zustand (persisted to localStorage)
- **Schema Validation:** Zod
- **AI:** Provider-neutral (Gemini, OpenAI, Anthropic, or custom endpoints)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setup

1. Upload a Trade Republic CSV export
2. Go to **Settings** and configure your AI provider (API key)
3. Navigate to **AI Analyst** and start talking to your portfolio

## Architecture

```
src/
├── ai/               # AI orchestration (providers, prompts, tool registry)
├── app/              # Next.js app router
├── components/       # React components
│   ├── ui/           # Base UI components (shadcn-style)
│   └── views/        # Page views
├── engine/           # Deterministic finance engine
│   ├── csv-parser.ts       # Trade Republic CSV parser
│   ├── etf-data.ts         # ETF metadata & look-through data
│   ├── portfolio-calculator.ts  # Holdings, summary, exposure calculations
│   ├── risk-engine.ts      # Threshold-based risk assessment
│   └── scenario-simulator.ts   # What-if simulation
├── lib/              # Utilities
├── store/            # Zustand state management
└── types/            # TypeScript types & Zod schemas
```

## Privacy

- Core analysis works **entirely offline** — no API calls needed
- AI features are **opt-in** and require your own API key
- All data stored in **browser localStorage** only
- API keys are never transmitted to any server besides the chosen LLM provider

## Disclaimer

This is an educational analysis tool. It does not constitute financial advice and should not be used as the sole basis for investment decisions.
