import { usePortfolioStore } from "@/store/portfolio-store";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (params: Record<string, unknown>) => unknown;
}

function getStore() {
  return usePortfolioStore.getState();
}

export const portfolioTools: ToolDefinition[] = [
  {
    name: "getPortfolioSummary",
    description:
      "Get the overall portfolio summary including total value, cost, gain/loss, holdings count, dividends, fees, and taxes.",
    parameters: {},
    execute: () => {
      const { summary } = getStore();
      return summary || { error: "No portfolio data available" };
    },
  },
  {
    name: "getHoldings",
    description:
      "Get all current holdings with shares, cost, value, weight, and asset class.",
    parameters: {},
    execute: () => {
      const { holdings } = getStore();
      return holdings.map((h) => ({
        name: h.name,
        isin: h.isin,
        assetClass: h.assetClass,
        shares: h.shares,
        avgCost: h.avgCostPerShare,
        totalCost: h.totalCost,
        currentValue: h.currentValue,
        weight: h.weight,
        unrealizedGain: h.unrealizedGain,
        unrealizedGainPercent: h.unrealizedGainPercent,
      }));
    },
  },
  {
    name: "getGeographicExposure",
    description:
      "Get geographic exposure breakdown including ETF look-through derived regions.",
    parameters: {},
    execute: () => {
      const { exposure } = getStore();
      return exposure?.geographic || [];
    },
  },
  {
    name: "getSectorExposure",
    description:
      "Get sector exposure breakdown including ETF look-through derived sectors.",
    parameters: {},
    execute: () => {
      const { exposure } = getStore();
      return exposure?.sector || [];
    },
  },
  {
    name: "getCompanyExposure",
    description:
      "Get company-level exposure including hidden concentrations through ETFs.",
    parameters: {},
    execute: () => {
      const { exposure } = getStore();
      return exposure?.company || [];
    },
  },
  {
    name: "getAssetClassBreakdown",
    description: "Get asset class breakdown (stocks, ETFs, crypto, etc.).",
    parameters: {},
    execute: () => {
      const { exposure } = getStore();
      return exposure?.assetClass || [];
    },
  },
  {
    name: "getRiskAssessments",
    description:
      "Get all current risk assessments with severity, thresholds, and current values.",
    parameters: {},
    execute: () => {
      const { risks } = getStore();
      return risks;
    },
  },
  {
    name: "getStrategyProfile",
    description:
      "Get the user's investment strategy profile including target allocation, risk tolerance, and preferences.",
    parameters: {},
    execute: () => {
      const { strategyProfile } = getStore();
      return strategyProfile;
    },
  },
  {
    name: "getRiskThresholds",
    description: "Get the current risk threshold configuration.",
    parameters: {},
    execute: () => {
      const { riskThresholds } = getStore();
      return riskThresholds;
    },
  },
  {
    name: "simulateTransaction",
    description:
      "Simulate a buy or sell transaction and see the before/after impact on allocation and risks.",
    parameters: {
      action: { type: "string", description: "buy or sell", required: true },
      instrumentName: {
        type: "string",
        description: "Name of the instrument",
        required: true,
      },
      amount: {
        type: "number",
        description: "Amount in EUR",
        required: true,
      },
      isin: { type: "string", description: "ISIN if known" },
    },
    execute: (params) => {
      const result = getStore().runSimulation({
        action: params.action as "buy" | "sell",
        instrumentName: params.instrumentName as string,
        isin: (params.isin as string) || "",
        amount: params.amount as number,
      });
      return result || { error: "No portfolio data to simulate against" };
    },
  },
  {
    name: "compareToTargetAllocation",
    description:
      "Compare current allocation to the user's target allocation and show drift.",
    parameters: {},
    execute: () => {
      const { holdings, strategyProfile } = getStore();
      const target = strategyProfile.targetAllocation;
      if (!target || Object.keys(target).length === 0) {
        return { error: "No target allocation defined. Ask the user to set one." };
      }

      const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
      const current: Record<string, number> = {};
      for (const h of holdings) {
        const key = h.name;
        current[key] = (current[key] || 0) + (totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0);
      }

      const comparison = Object.entries(target).map(([label, targetPct]) => {
        const currentPct = current[label] || 0;
        return {
          label,
          target: targetPct,
          current: currentPct,
          drift: currentPct - targetPct,
        };
      });

      return comparison;
    },
  },
];

export function getToolByName(name: string): ToolDefinition | undefined {
  return portfolioTools.find((t) => t.name === name);
}

export function executeToolCall(
  name: string,
  params: Record<string, unknown> = {}
): unknown {
  const tool = getToolByName(name);
  if (!tool) return { error: `Unknown tool: ${name}` };
  try {
    return tool.execute(params);
  } catch (e) {
    return { error: `Tool execution failed: ${e instanceof Error ? e.message : "Unknown error"}` };
  }
}

export function getToolDescriptionsForPrompt(): string {
  return portfolioTools
    .map(
      (t) =>
        `- ${t.name}: ${t.description}${
          Object.keys(t.parameters).length > 0
            ? ` | Parameters: ${JSON.stringify(t.parameters)}`
            : ""
        }`
    )
    .join("\n");
}
