# PRD: Software 3.0 Rebuild of TR Analysis

## 1. Executive Summary

Build a new version of TR Analysis: a self-hosted portfolio intelligence application for Trade Republic investors, redesigned around Software 3.0 principles. The existing application combines deterministic Software 1.0/2.0-style portfolio calculations with optional LLM-generated insights. The new application should preserve the trusted deterministic financial foundation while making AI the primary interaction, reasoning, explanation, and planning layer.

The product should feel less like a static dashboard with optional AI buttons and more like a living, talking portfolio. The AI doesn't just analyze your data—it *is* your portfolio personified. Users can converse directly with their portfolio ("Hi, I'm feeling a bit tech-heavy today," or "I'm vulnerable to European market shifts right now"). The system understands its own data, explains its own risks, asks follow-up questions, simulates strategies, and produces transparent, auditable recommendations.

This is not a robo-advisor or automated trading product. It is an analysis and decision-support tool. The system must avoid giving regulated financial advice, must clearly explain assumptions, and must keep the user in control.

## 2. Current Product Understanding

The existing TR Analysis app is a React/Vite self-hosted portfolio analyzer for Trade Republic CSV exports.

### Existing Core Capabilities

- **CSV import:** Users upload Trade Republic transaction exports.
- **Portfolio analysis:** The app calculates holdings, costs, performance, and allocation.
- **ETF look-through:** The app estimates underlying company exposure through ETFs.
- **Composition views:** Users can inspect geographic, sector, and company-level allocation.
- **Risk assessment:** Deterministic threshold-based checks identify concentration risks.
- **Strategic alignment:** Portfolio is compared against a 50/40/30 World/Emerging Markets/Europe model.
- **AI insights:** Optional Gemini API integration generates structured analysis for risk, rebalancing, composition, and general insights.
- **Self-hosted privacy posture:** Core functionality works without external APIs. AI features require user-provided Gemini credentials.

### Current Software 2.0 / 3.0 Mix

The current app is primarily deterministic with an AI layer added at specific seams.

- **Software 1.0 / 2.0 traits:** CSV parsing, portfolio math, thresholds, charts, deterministic risk cards, UI tabs.
- **Software 3.0 traits:** Prompt-generated analysis, LLM explanations, structured JSON output, schema validation, floating AI assistant history.
- **Current limitation:** AI is reactive and scoped to individual buttons. It does not yet act as a persistent analyst, planner, conversational interface, or autonomous reasoning layer over the full portfolio context.

## 3. Product Vision

Create an AI-native portfolio experience where the portfolio itself becomes a conversational entity for retail investors. By "humanizing" the portfolio, users who export their Trade Republic data can talk directly to their investments to understand them deeply.

The rebuilt product should allow conversational flows such as:

- **User:** "How are you doing today?"
  **Portfolio:** "I'm doing well, up 2% this week, but I'm feeling a little top-heavy in Apple right now."
- **User:** "What are your hidden risks?"
  **Portfolio:** "Because you hold three different S&P 500 ETFs, I'm secretly carrying 15% overlap in Microsoft. That makes me more vulnerable than I look."
- **User:** "What would happen if we fed you another €500 into Emerging Markets?"
  **Portfolio:** "That would actually balance my geographic drift nicely. Let me show you how my allocation would shift..."
- **User:** "Explain yourself like I am a beginner."
  **Portfolio:** "Think of me as a pie cut into pieces. Right now, almost half the pie is just tech companies..."

The primary interface should be this revolutionary "Talk to Your Portfolio" conversation, supported by interactive dashboards, rather than a dashboard that occasionally calls a disconnected AI.

## 4. Goals

### Product Goals

- **AI-first analysis:** Make the "humanized portfolio" conversation the primary user experience. The portfolio itself is the persona.
- **Trustworthy calculations:** Keep deterministic portfolio math separate, testable, and auditable.
- **Personalization:** Let users define strategy, risk tolerance, investment horizon, preferred regions, excluded sectors, and target allocation.
- **Scenario planning:** Allow users to ask “what if” questions and receive simulated outcomes.
- **Explainability:** Every AI claim should reference underlying portfolio facts, calculations, assumptions, or uncertainty.
- **Privacy-first:** Preserve self-hosted usage and make external AI calls explicit and configurable.
- **Provider flexibility:** Avoid hard-coding to a single LLM provider.

### Business / Adoption Goals

- **Lower analysis friction:** Users should get useful insights within minutes of uploading a CSV.
- **Make financial complexity understandable:** Translate portfolio composition into plain-language implications through a relatable portfolio persona.
- **Create emotional connection:** Users should feel they have a financial companion, not just a tool.
- **Increase repeat usage:** The portfolio persona creates natural check-in moments, monthly dialogues, and ongoing relationship.
- **Enable project handoff:** A different implementation team should be able to build from this PRD without needing the original codebase.

## 5. Non-Goals

- **No brokerage execution:** The app must not place trades.
- **No regulated financial advice:** The app must present educational analysis and decision support, not personalized investment instructions framed as guaranteed advice.
- **No custody:** The app must not store brokerage credentials or connect directly to Trade Republic accounts in the MVP.
- **No mandatory cloud backend:** The MVP should be viable as a local/self-hosted web app.
- **No opaque black-box scoring:** Key scores and risks must be explainable.

## 6. Target Users

### Primary Persona: Self-Directed Retail Investor

- Uses Trade Republic.
- Holds ETFs, stocks, and possibly crypto.
- Wants to understand allocation, overlap, and risk.
- Is comfortable exporting CSVs but not necessarily comfortable interpreting portfolio analytics.
- Wants AI assistance but still wants data privacy and control.

### Secondary Persona: AI-Powered Personal Finance Enthusiast

- Wants to experiment with portfolio scenarios.
- Wants natural-language reports and strategy reviews.
- May self-host tools and bring their own API keys.

## 7. User Problems

- **Hidden exposure:** ETF holdings make it hard to know true company, region, and sector exposure.
- **Overconfidence in diversification:** Users may own multiple ETFs that overlap heavily.
- **Portfolio drift:** Users may not notice when allocation deviates from intended strategy.
- **Data interpretation burden:** Charts show facts but do not always explain implications.
- **Generic AI limitation:** A normal chatbot does not know the user’s portfolio unless context is manually supplied.
- **Trust concerns:** AI-generated financial content can hallucinate or overstate confidence.
- **Emotional disconnect:** Traditional portfolio tools feel cold, transactional, and impersonal—users relate to data, not to their investments.
- **Lack of engagement:** Users check portfolios infrequently because there's no compelling reason to return or relationship to maintain.

## 8. Proposed Solution

Build an AI-native portfolio experience with a deterministic calculation engine, structured portfolio memory, agentic analysis workflows, and a revolutionary UX where the portfolio itself is the conversational persona.

### Core Concept

The system has two cooperating layers:

- **Deterministic Finance Engine:** Parses data, calculates holdings, exposure, gains/losses, allocation, drift, thresholds, and look-through metrics.
- **Humanized Portfolio Layer:** Uses tool-calling, retrieval, and structured outputs to give the portfolio a voice. It explains its own data, asks clarifying questions, generates reports about itself, compares scenarios, and guides the user through decisions using a first-person perspective.

The AI layer must never invent portfolio data. It should call deterministic tools for facts and then synthesize explanations from verified outputs.

## 9. Key Product Requirements

### 9.1 Onboarding and Data Import

#### Requirements

- User can upload one or more Trade Republic CSV exports.
- System parses transactions and validates schema.
- System detects duplicates and supports incremental imports.
- System shows import summary before analysis.
- System explains unsupported rows or parsing failures.
- User can optionally add manual metadata for unknown instruments.

#### AI-Native Enhancements

- AI import assistant explains detected issues in plain language.
- AI suggests fixes for unknown symbols, duplicate imports, currency mismatches, and missing asset metadata.
- AI asks clarifying questions when the data is ambiguous.

#### Acceptance Criteria

- Given a valid Trade Republic CSV, the user sees a parsed portfolio summary.
- Given invalid rows, the user sees row-level errors and AI-generated explanation.
- Given unknown assets, the system offers a guided resolution flow.

### 9.2 Portfolio Knowledge Model

#### Requirements

- System creates a normalized portfolio model from transactions.
- Model includes holdings, cash flows, fees, taxes, realized/unrealized performance, allocation, instrument metadata, and look-through exposures.
- Model distinguishes direct stock positions from ETF-derived company exposure.
- Model supports snapshots over time.

#### AI-Native Enhancements

- AI can answer questions against the normalized portfolio model.
- AI can reference exact metrics when explaining conclusions.
- AI can retrieve historical snapshots for trend explanations.

#### Acceptance Criteria

- AI responses cite calculated values such as allocation %, holding weight, sector weight, geographic weight, and drift.
- AI clearly labels ETF-derived exposure versus direct ownership.

### 9.3 Talking to Your Portfolio (Humanized Persona) — REVOLUTIONARY FEATURE

This is the defining feature that separates this rebuild from all other portfolio tools. The portfolio becomes a living, self-aware entity.

#### Requirements

- Product includes a persistent chat interface where the user talks **to** their portfolio, not **about** it with an analyst.
- The portfolio speaks in **first person** with consistent personality, awareness, and voice.
- The portfolio expresses **emotional states** based on its composition: anxious when concentrated, confident when balanced, curious when data is missing, excited when milestones are hit.
- The portfolio has **memory** of past conversations, goals discussed, and commitments made.
- The portfolio can **initiate conversations** with check-in messages, drift alerts, and milestone celebrations.
- The portfolio uses deterministic tools for all factual statements about its composition.
- User can customize portfolio personality: conservative vs. adventurous, serious vs. playful, technical vs. simple.
- Session history is stored locally with conversational continuity across sessions.

#### Portfolio Personality Dimensions

The portfolio persona should have configurable personality traits:

- **Risk Temperament:** Conservative (worries early), Balanced, Adventurous (celebrates risk-taking)
- **Communication Style:** Professional, Friendly, Casual
- **Technical Level:** Beginner-friendly, Intermediate, Advanced
- **Proactivity:** Reactive (only answers questions), Balanced (occasional check-ins), Proactive (frequent updates and suggestions)

#### Portfolio Emotional Intelligence

The portfolio's "mood" should reflect its actual state:

- **Anxious/Concerned:** High concentration risk, missed rebalancing targets, crypto overweight, sector concentration
- **Confident/Healthy:** Balanced allocation, on-target drift, diversified holdings
- **Curious/Inquisitive:** Unknown symbols, missing strategy preferences, unexplained transactions
- **Proud/Celebratory:** Allocation targets hit, successful rebalancing, portfolio milestones
- **Confused/Uncertain:** Conflicting goals, ambiguous user requests, incomplete data

The portfolio should express these moods naturally in conversation while maintaining professionalism.

#### Example User Interactions

**First Meeting:**
- **User:** "Hello, who are you?"
- **Portfolio:** "Hi! I'm your investment portfolio. Right now I'm holding €15,234 across 8 different positions. I'm feeling a bit tech-heavy to be honest—about 42% of me is in technology companies. Want to talk about it?"

**Daily Check-In:**
- **Portfolio:** *(initiates)* "Morning! I noticed you haven't added anything new in 3 weeks. Are we still planning that monthly €500 contribution we talked about?"

**Risk Conversation:**
- **User:** "What's worrying you?"
- **Portfolio:** "Honestly? I'm getting nervous about my crypto exposure. You set my limit at 8%, but I've drifted up to 11% because Bitcoin's been climbing. I think we should talk about rebalancing."

**Scenario Exploration:**
- **User:** "What would happen if I added €300 to Emerging Markets?"
- **Portfolio:** "Ooh, I'd love that! It would bring my EM allocation from 8% to 12%, which gets me much closer to your 15% target. I'd feel more geographically balanced."

**Beginner Explanation:**
- **User:** "Explain yourself like I'm a beginner."
- **Portfolio:** "Think of me as a basket holding your money. Right now, almost half of that basket is full of tech companies like Apple and Microsoft. If something bad happens to tech, a big chunk of me gets hurt. That's why people are always talking about diversification—spreading me out across different types of investments."

**Milestone Celebration:**
- **Portfolio:** *(initiates)* "Hey! We just hit a milestone—I've crossed €20,000 in total value! 🎉 You started with €12,000 eighteen months ago. That's 67% growth!"

**Proactive Alert:**
- **Portfolio:** *(initiates)* "I've been watching my geographic allocation drift. I was supposed to be 50% World / 30% Europe / 20% Emerging Markets, but right now I'm at 58% World / 26% Europe / 16% EM. Should we fix this?"

#### Acceptance Criteria

- Portfolio can maintain first-person perspective across 100+ conversation turns without breaking character.
- Portfolio can answer at least 30 predefined questions using tool-backed data.
- Portfolio refuses or carefully scopes requests that require regulated financial advice while staying in character.
- Portfolio expresses appropriate emotional tone based on its actual calculated state.
- Portfolio includes assumptions and uncertainty when data is incomplete.
- Portfolio can switch between personality modes when user changes settings.
- Portfolio never fabricates holdings, allocation percentages, or risk metrics—all statements are tool-verified.

### 9.4 Agentic Analysis Workflows

#### Requirements

The system should include predefined AI workflows that operate as guided analyst tasks.

#### Required Workflows

- **Portfolio Health Review:** Identify top risks, opportunities, and missing information.
- **Concentration Detective:** Find sector, geography, company, ETF overlap, and crypto concentration.
- **Rebalancing Planner:** Compare current allocation to user-defined targets and simulate adjustments.
- **ETF Look-Through Explainer:** Explain what the user owns indirectly through ETFs.
- **Monthly Review Generator:** Produce a concise report with changes, risks, and next questions.
- **Beginner Explanation Mode:** Translate analysis into simple, educational language.

#### Workflow Behavior

Each workflow should:

- Collect required context.
- Call deterministic calculation tools.
- Identify missing data.
- Generate structured output.
- Provide a human-readable explanation.
- Offer follow-up questions.

#### Acceptance Criteria

- Each workflow has a typed input and typed output schema.
- Each workflow produces repeatable structure even if natural language varies.
- Workflow outputs can be saved as local reports.

### 9.5 Risk and Threshold System

#### Requirements

- User can configure thresholds for crypto, sector, geography, company, income reliance, and diversity.
- System computes deterministic risk triggers.
- System labels risks as critical, warning, or info.
- User can ask AI to explain any risk card.

#### AI-Native Enhancements

- AI explains why a risk matters in the user’s context.
- AI compares risk to user-defined strategy and tolerance.
- AI suggests multiple possible paths, not a single instruction.
- AI distinguishes factual risk from subjective preference.

#### Acceptance Criteria

- Risk cards remain useful without AI.
- AI explanations reference the threshold and current value.
- AI never presents recommendations as guaranteed outcomes.

### 9.6 Strategy and Preferences Layer

#### Requirements

- User can define investment strategy profile:
  - Target allocation.
  - Risk tolerance.
  - Investment horizon.
  - Monthly contribution amount.
  - Preferred/avoided sectors.
  - Preferred/avoided regions.
  - Crypto comfort level.
  - ESG or thematic preferences, if desired.
- Preferences are stored locally by default.

#### AI-Native Enhancements

- AI uses strategy profile when interpreting risk and opportunities.
- AI can interview the user to create or refine the strategy profile.
- AI flags conflicts between stated goals and actual portfolio.

#### Acceptance Criteria

- User can complete strategy setup conversationally.
- AI can explain how a recommendation changes when strategy settings change.

### 9.7 Scenario Simulation

#### Requirements

- User can simulate buys, sells, deposits, and target allocations without changing actual portfolio data.
- System calculates before/after allocation, drift, concentration, and risk triggers.
- Simulations are temporary unless saved.

#### AI-Native Enhancements

- User can describe scenarios in natural language.
- AI converts user intent into structured simulation inputs.
- AI explains trade-offs across multiple scenarios.

#### Example Scenarios

- “What if I add €500 to MSCI World?”
- “How much Emerging Markets would bring me back to target?”
- “What happens if crypto doubles?”
- “How would selling half of my largest stock affect concentration?”

#### Acceptance Criteria

- Simulation results are calculated by deterministic functions.
- AI-generated simulation inputs require user confirmation before execution.
- Results show before/after values and changed risk flags.

### 9.8 Reports and Exports

#### Requirements

- User can generate reports from AI workflows.
- Reports can be saved locally or exported as Markdown/PDF.
- Reports include calculation timestamp, data source, assumptions, and disclaimer.

#### Required Reports

- Portfolio Health Report.
- Monthly Review.
- Rebalancing Scenario Report.
- ETF Exposure Report.

#### Acceptance Criteria

- Report content is reproducible from saved inputs and model configuration.
- Reports clearly separate facts, AI interpretation, and user-defined assumptions.

## 10. Software 3.0 Architecture Requirements

### 10.1 AI Orchestration Layer

The application should use an AI orchestration layer rather than direct prompt calls from UI components.

#### Required Capabilities

- Provider abstraction for Gemini, OpenAI-compatible APIs, Anthropic-compatible APIs, and local models where practical.
- Tool registry for deterministic portfolio functions.
- Structured output validation using schemas.
- Retry, timeout, and error handling.
- Prompt/version registry.
- Workflow definitions for agentic tasks.
- Evaluation harness for AI output quality.

### 10.2 Tool-Calling Design

The AI layer should call tools for facts.

#### Example Tools

- `getPortfolioSummary()`
- `getHoldings()`
- `getGeographicExposure()`
- `getSectorExposure()`
- `getCompanyExposure()`
- `getEtfOverlap()`
- `getRiskAssessments()`
- `simulateTransaction()`
- `compareToTargetAllocation()`
- `getHistoricalSnapshots()`
- `resolveInstrumentMetadata()`

Tool outputs should be typed, deterministic, and testable.

### 10.3 Context and Memory

#### Requirements

- Session memory for current conversation.
- Local user memory for preferences and saved strategy profile.
- Portfolio memory derived from uploaded CSVs and snapshots.
- Report memory for saved outputs.

#### Constraints

- No sensitive data should be sent to AI providers unless the user enables AI features.
- User must be able to clear memory.
- Product must clearly show what data is being sent externally.

### 10.4 Guardrails

#### Requirements

- Financial advice disclaimer.
- Refusal or safe-completion behavior for requests that ask for guaranteed returns, market timing certainty, or instructions framed as personal financial advice.
- Clear separation between educational analysis and user decisions.
- Hallucination mitigation through tool-backed facts.
- Schema validation for structured outputs.
- Confidence/uncertainty labels where appropriate.

### 10.5 Evaluation and Quality

The project should include automated and manual evaluation for AI behavior.

#### Required Eval Sets

- Portfolio Q&A correctness.
- Risk explanation accuracy.
- Scenario parsing accuracy.
- Refusal/safety behavior.
- Report structure validity.
- No-hallucination checks for unsupported claims.

#### Acceptance Criteria

- At least 50 golden test cases for AI analyst responses.
- All structured outputs pass schema validation.
- AI answers must cite tool-derived facts for factual claims.

## 11. UX Requirements

### 11.1 Primary UX Model

The app should have two complementary surfaces:

- **AI Analyst Workspace:** Main conversational and workflow-driven interface.
- **Portfolio Dashboard:** Visual confirmation layer with charts, tables, risk cards, and simulations.

### 11.2 Navigation

Suggested sections:

- Upload / Import.
- AI Analyst.
- Dashboard.
- Holdings.
- Exposure.
- Risks.
- Scenarios.
- Reports.
- Settings / Privacy.

### 11.3 AI Interaction Patterns

- Persistent analyst sidebar or main chat workspace.
- Suggested starter questions after import.
- Context-aware buttons on cards: “Explain,” “Simulate fix,” “Add to report,” “Ask follow-up.”
- Workflow cards for predefined agentic analyses.
- Citation chips linking AI claims to dashboard data.
- Confirmation step before running simulations from natural language.

### 11.4 Visual Design Direction

The existing project uses a dark financial-platform style with yellow primary accents, trading green/red semantics, dense card-based layouts, and responsive design. The rebuild may preserve this general direction, but the AI workspace should feel more central and polished.

Important UI principles:

- Data-dense but understandable.
- Financial numbers should be visually trustworthy and easy to scan.
- AI explanations should be readable and not hidden in tiny cards.
- Distinguish facts, interpretations, assumptions, and actions visually.
- Mobile should support upload review, AI chat, and key risk summaries.

## 12. Data and Privacy Requirements

### Requirements

- Core portfolio analysis works without external APIs.
- AI features are opt-in.
- User can bring their own LLM API key.
- User can choose provider where supported.
- System displays a data-sharing notice before first AI request.
- User can inspect the payload sent to the AI provider.
- API keys must not be hard-coded or committed.
- Local-first storage should be preferred for user data.

### Sensitive Data Handling

Potentially sensitive data includes:

- Portfolio holdings.
- Transaction history.
- Investment amounts.
- Strategy preferences.
- Generated reports.
- API keys.

The implementation should minimize transmission and retention of this data.

## 13. Technical Requirements

### Recommended Stack

The exact stack may vary, but the implementation should support typed deterministic logic, structured AI orchestration, and modern frontend UX.

Suggested default:

- **Frontend:** React or Next.js.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS or equivalent design system.
- **Charts:** Recharts, Visx, or similar.
- **Schema validation:** Zod or equivalent.
- **AI orchestration:** Provider-neutral custom layer or a lightweight agent framework.
- **Storage:** Browser local storage / IndexedDB for MVP; optional backend later.
- **Testing:** Unit tests for finance engine, integration tests for workflows, AI eval harness.

### Architecture Principles

- Keep financial calculations deterministic and isolated.
- Keep AI prompts versioned and testable.
- Keep model providers replaceable.
- Treat AI outputs as untrusted until parsed and validated.
- Prefer typed domain objects over ad hoc JSON.
- Build seams for future backend, market data integrations, and local LLM support.

## 14. MVP Scope

### Must Have

- Trade Republic CSV import.
- Deterministic portfolio summary.
- Holdings view.
- Geographic/sector/company exposure.
- ETF look-through support at least to the level of current app parity.
- Threshold-based risk engine.
- AI analyst chat with portfolio-aware tools.
- AI workflows for health review, risk explanation, rebalancing planner, and monthly report.
- Strategy profile setup.
- Scenario simulation for simple buys/sells.
- Local report export as Markdown.
- Provider configuration for at least Gemini and one provider-neutral interface.
- Privacy notice and API key settings.

### Should Have

- PDF export.
- Historical snapshots.
- ETF overlap detector.
- Unknown instrument resolution assistant.
- Saved prompts/reports.
- AI response citations.

### Could Have

- Local LLM support.
- Browser-only embeddings for local retrieval.
- Optional cloud sync.
- Market price refresh integrations.
- Multi-broker import adapters.

## 15. Success Metrics

### User Value Metrics

- Time from upload to first useful insight under 2 minutes.
- User can get an understandable answer to common portfolio questions without navigating charts manually.
- User can generate a monthly report in under 3 clicks after setup.
- User can simulate a contribution scenario in natural language.

### Quality Metrics

- 95%+ valid structured AI workflow outputs.
- 90%+ correctness on golden portfolio Q&A evals.
- 0 known cases where AI fabricates unsupported holdings or allocation values in eval suite.
- Deterministic finance engine has high unit test coverage for core calculations.

### Privacy / Trust Metrics

- User can complete core analysis without AI provider setup.
- User can preview AI payloads.
- User can clear local data and AI history.

## 16. Risks and Mitigations

### Risk: AI Hallucination

- **Mitigation:** Tool-backed facts, citations, schema validation, evals, explicit uncertainty.

### Risk: Financial Advice Liability

- **Mitigation:** Educational framing, disclaimers, refusal patterns, no trade execution, user confirmation for simulations.

### Risk: Privacy Concerns

- **Mitigation:** Local-first design, opt-in AI, payload preview, provider choice, clear data controls.

### Risk: Incorrect Portfolio Calculations

- **Mitigation:** Deterministic engine tests, clear import validation, reconciliation summaries, user-editable metadata.

### Risk: LLM Provider Lock-In

- **Mitigation:** Provider abstraction, model configuration, prompt registry independent from provider API details.

### Risk: Over-Agentic UX Confuses Users

- **Mitigation:** Pair AI chat with visible dashboards, suggested actions, confirmations, and transparent reasoning.

## 17. Open Questions

- Should the MVP remain entirely frontend-only, or can a lightweight backend be used for secure API proxying and report generation?
- What exact ETF data source should power look-through analysis in the rebuild?
- Should user portfolio data be stored only locally, or should optional encrypted sync be planned?
- Which LLM providers must be supported at launch?
- How strict should the financial advice guardrails be for different jurisdictions?
- Should the app support only Trade Republic initially or define an import adapter system from day one?

## 18. Suggested Delivery Phases

### Phase 1: Deterministic Foundation

- CSV import.
- Normalized portfolio model.
- Core calculations.
- Risk engine.
- Basic dashboard.

### Phase 2: AI Orchestration Foundation

- Provider abstraction.
- Tool registry.
- Prompt/workflow registry.
- Structured output validation.
- AI settings and privacy notice.

### Phase 3: AI Analyst MVP

- Portfolio-aware chat.
- Health review workflow.
- Risk explanation workflow.
- Rebalancing planner workflow.
- Monthly report generation.

### Phase 4: Scenario and Personalization

- Strategy profile.
- Natural-language scenario simulation.
- Saved reports.
- Historical snapshots.

### Phase 5: Trust, Evals, and Expansion

- AI eval harness.
- Citation UI.
- ETF overlap improvements.
- Multi-provider support.
- Optional backend/local LLM enhancements.

## 19. Handoff Summary

The rebuilt application should preserve the original app’s core value: private, self-hosted Trade Republic portfolio analysis with ETF look-through and risk detection. The key product shift is to make AI the central analyst and interaction layer, not an optional enhancement.

The implementation team should design the product around this principle:

> Deterministic code calculates the truth. AI explains, questions, simulates, and helps the user reason about that truth.
