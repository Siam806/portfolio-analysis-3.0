import { z } from "zod";

// ─── Transaction Schema ───
export const TransactionTypeEnum = z.enum([
  "buy",
  "sell",
  "dividend",
  "interest",
  "deposit",
  "withdrawal",
  "fee",
  "tax",
  "saveback",
  "card_cashback",
  "card_refund",
  "unknown",
]);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: TransactionTypeEnum,
  instrumentName: z.string(),
  isin: z.string().optional(),
  shares: z.number(),
  pricePerShare: z.number(),
  totalAmount: z.number(),
  fee: z.number().default(0),
  tax: z.number().default(0),
  currency: z.string().default("EUR"),
  note: z.string().optional(),
  rawRow: z.record(z.string()).optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

// ─── Instrument Metadata ───
export const AssetClassEnum = z.enum([
  "stock",
  "etf",
  "bond",
  "crypto",
  "commodity",
  "cash",
  "unknown",
]);
export type AssetClass = z.infer<typeof AssetClassEnum>;

export const InstrumentSchema = z.object({
  isin: z.string(),
  name: z.string(),
  ticker: z.string().optional(),
  assetClass: AssetClassEnum,
  sector: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().default("EUR"),
  // ETF look-through data
  topHoldings: z
    .array(
      z.object({
        name: z.string(),
        isin: z.string().optional(),
        weight: z.number(), // 0–100
        sector: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .optional(),
  geographicBreakdown: z
    .record(z.number()) // region -> %
    .optional(),
  sectorBreakdown: z
    .record(z.number()) // sector -> %
    .optional(),
});
export type Instrument = z.infer<typeof InstrumentSchema>;

// ─── Holding ───
export interface Holding {
  isin: string;
  name: string;
  assetClass: AssetClass;
  shares: number;
  avgCostPerShare: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  weight: number; // % of total portfolio
  sector?: string;
  region?: string;
  country?: string;
  currency: string;
}

// ─── Exposure ───
export interface ExposureEntry {
  name: string;
  value: number;
  percent: number;
  source: "direct" | "etf-derived" | "mixed";
}

export interface PortfolioExposure {
  geographic: ExposureEntry[];
  sector: ExposureEntry[];
  company: ExposureEntry[];
  assetClass: ExposureEntry[];
}

// ─── Risk ───
export type RiskSeverity = "critical" | "warning" | "info";

export interface RiskAssessment {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  currentValue: number;
  threshold: number;
  metric: string;
}

// ─── Strategy Profile ───
export const StrategyProfileSchema = z.object({
  targetAllocation: z
    .record(z.number()) // label -> %
    .default({}),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).default("moderate"),
  investmentHorizon: z.enum(["short", "medium", "long"]).default("long"),
  monthlyContribution: z.number().default(0),
  preferredSectors: z.array(z.string()).default([]),
  avoidedSectors: z.array(z.string()).default([]),
  preferredRegions: z.array(z.string()).default([]),
  avoidedRegions: z.array(z.string()).default([]),
  cryptoComfortLevel: z.enum(["none", "low", "medium", "high"]).default("low"),
});
export type StrategyProfile = z.infer<typeof StrategyProfileSchema>;

// ─── Portfolio Summary ───
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  holdingsCount: number;
  assetClassBreakdown: Record<string, number>;
  totalDividends: number;
  totalFees: number;
  totalTaxes: number;
  lastUpdated: string;
}

// ─── Scenario Simulation ───
export interface SimulationInput {
  action: "buy" | "sell";
  isin: string;
  instrumentName: string;
  amount: number; // in EUR
  pricePerShare?: number;
}

export interface SimulationResult {
  input: SimulationInput;
  before: {
    allocation: Record<string, number>;
    totalValue: number;
    risks: RiskAssessment[];
  };
  after: {
    allocation: Record<string, number>;
    totalValue: number;
    risks: RiskAssessment[];
  };
  changes: {
    metric: string;
    before: number;
    after: number;
    delta: number;
  }[];
}

// ─── Risk Thresholds ───
export const RiskThresholdsSchema = z.object({
  maxCryptoPercent: z.number().default(10),
  maxSingleStockPercent: z.number().default(15),
  maxSingleSectorPercent: z.number().default(30),
  maxSingleRegionPercent: z.number().default(60),
  minHoldingsCount: z.number().default(5),
  maxEtfOverlapPercent: z.number().default(20),
});
export type RiskThresholds = z.infer<typeof RiskThresholdsSchema>;

// ─── Chat / AI ───
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  toolCalls?: ToolCallRecord[];
  citations?: Citation[];
}

export interface ToolCallRecord {
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
}

export interface Citation {
  label: string;
  metric: string;
  value: string | number;
}

// ─── AI Provider Config ───
export const AIProviderConfigSchema = z.object({
  provider: z.enum(["gemini", "openai", "anthropic", "custom"]).default("gemini"),
  apiKey: z.string().default(""),
  model: z.string().default("gemini-2.0-flash"),
  baseUrl: z.string().optional(),
  enabled: z.boolean().default(false),
});
export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;

// ─── Personality Config ───
export const PersonalityConfigSchema = z.object({
  riskTemperament: z.enum(["conservative", "balanced", "adventurous"]).default("balanced"),
  communicationStyle: z.enum(["professional", "friendly", "casual"]).default("friendly"),
  technicalLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  proactivity: z.enum(["reactive", "balanced", "proactive"]).default("balanced"),
});
export type PersonalityConfig = z.infer<typeof PersonalityConfigSchema>;

// ─── Import Result ───
export interface ImportResult {
  transactions: Transaction[];
  errors: ImportError[];
  warnings: ImportWarning[];
  duplicatesSkipped: number;
  totalRows: number;
  successRows: number;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  rawData?: Record<string, string>;
}

export interface ImportWarning {
  row: number;
  message: string;
  suggestion?: string;
}
