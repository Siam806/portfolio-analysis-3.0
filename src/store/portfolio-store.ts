import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Transaction,
  Holding,
  PortfolioSummary,
  PortfolioExposure,
  RiskAssessment,
  RiskThresholds,
  StrategyProfile,
  ImportResult,
  ChatMessage,
  AIProviderConfig,
  PersonalityConfig,
  SimulationInput,
  SimulationResult,
} from "@/types/portfolio";
import { RiskThresholdsSchema, StrategyProfileSchema } from "@/types/portfolio";
import { parseTradeRepublicCSV } from "@/engine/csv-parser";
import {
  calculateHoldings,
  calculatePortfolioSummary,
  calculateExposure,
} from "@/engine/portfolio-calculator";
import { assessRisks } from "@/engine/risk-engine";
import { simulateTransaction } from "@/engine/scenario-simulator";

interface PortfolioState {
  // Data
  transactions: Transaction[];
  holdings: Holding[];
  summary: PortfolioSummary | null;
  exposure: PortfolioExposure | null;
  risks: RiskAssessment[];
  importResult: ImportResult | null;

  // Config
  riskThresholds: RiskThresholds;
  strategyProfile: StrategyProfile;
  aiConfig: AIProviderConfig;
  personalityConfig: PersonalityConfig;

  // Chat
  chatMessages: ChatMessage[];

  // UI state
  activeView: string;
  isImporting: boolean;

  // Actions
  importCSV: (csvText: string) => ImportResult;
  recalculate: () => void;
  setActiveView: (view: string) => void;
  updateRiskThresholds: (thresholds: Partial<RiskThresholds>) => void;
  updateStrategyProfile: (profile: Partial<StrategyProfile>) => void;
  updateAIConfig: (config: Partial<AIProviderConfig>) => void;
  updatePersonalityConfig: (config: Partial<PersonalityConfig>) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  clearAllData: () => void;
  runSimulation: (input: SimulationInput) => SimulationResult | null;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      // Initial state
      transactions: [],
      holdings: [],
      summary: null,
      exposure: null,
      risks: [],
      importResult: null,
      riskThresholds: RiskThresholdsSchema.parse({}),
      strategyProfile: StrategyProfileSchema.parse({}),
      aiConfig: {
        provider: "gemini",
        apiKey: "",
        model: "gemini-2.0-flash",
        enabled: false,
      },
      personalityConfig: {
        riskTemperament: "balanced",
        communicationStyle: "friendly",
        technicalLevel: "intermediate",
        proactivity: "balanced",
      },
      chatMessages: [],
      activeView: "upload",
      isImporting: false,

      importCSV: (csvText: string) => {
        set({ isImporting: true });
        const result = parseTradeRepublicCSV(csvText);
        const existingTxs = get().transactions;
        const existingIds = new Set(
          existingTxs.map((t) => `${t.date}|${t.type}|${t.isin || t.instrumentName}|${t.totalAmount}`)
        );

        const newTxs = result.transactions.filter((t) => {
          const key = `${t.date}|${t.type}|${t.isin || t.instrumentName}|${t.totalAmount}`;
          return !existingIds.has(key);
        });

        const allTransactions = [...existingTxs, ...newTxs].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const holdings = calculateHoldings(allTransactions);
        const summary = calculatePortfolioSummary(allTransactions, holdings);
        const exposure = calculateExposure(holdings);
        const risks = assessRisks(holdings, exposure, get().riskThresholds);

        set({
          transactions: allTransactions,
          holdings,
          summary,
          exposure,
          risks,
          importResult: result,
          isImporting: false,
          activeView: "dashboard",
        });

        return result;
      },

      recalculate: () => {
        const txs = get().transactions;
        if (txs.length === 0) return;
        const holdings = calculateHoldings(txs);
        const summary = calculatePortfolioSummary(txs, holdings);
        const exposure = calculateExposure(holdings);
        const risks = assessRisks(holdings, exposure, get().riskThresholds);
        set({ holdings, summary, exposure, risks });
      },

      setActiveView: (view) => set({ activeView: view }),

      updateRiskThresholds: (thresholds) => {
        const current = get().riskThresholds;
        const updated = { ...current, ...thresholds };
        set({ riskThresholds: updated });
        get().recalculate();
      },

      updateStrategyProfile: (profile) => {
        const current = get().strategyProfile;
        set({ strategyProfile: { ...current, ...profile } });
      },

      updateAIConfig: (config) => {
        const current = get().aiConfig;
        set({ aiConfig: { ...current, ...config } });
      },

      updatePersonalityConfig: (config) => {
        const current = get().personalityConfig;
        set({ personalityConfig: { ...current, ...config } });
      },

      addChatMessage: (message) => {
        set({ chatMessages: [...get().chatMessages, message] });
      },

      clearChat: () => set({ chatMessages: [] }),

      clearAllData: () =>
        set({
          transactions: [],
          holdings: [],
          summary: null,
          exposure: null,
          risks: [],
          importResult: null,
          chatMessages: [],
          activeView: "upload",
        }),

      runSimulation: (input) => {
        const holdings = get().holdings;
        if (holdings.length === 0) return null;
        return simulateTransaction(holdings, input);
      },
    }),
    {
      name: "portfolio-analysis-3",
      partialize: (state) => ({
        transactions: state.transactions,
        riskThresholds: state.riskThresholds,
        strategyProfile: state.strategyProfile,
        aiConfig: { ...state.aiConfig, apiKey: "" }, // Don't persist API key
        personalityConfig: state.personalityConfig,
        chatMessages: state.chatMessages.slice(-100), // Keep last 100 messages
      }),
    }
  )
);
