import type {
  Holding,
  SimulationInput,
  SimulationResult,
  RiskAssessment,
  PortfolioExposure,
} from "@/types/portfolio";
import { calculateExposure } from "./portfolio-calculator";
import { assessRisks } from "./risk-engine";

function cloneHoldings(holdings: Holding[]): Holding[] {
  return holdings.map((h) => ({ ...h }));
}

function getAllocation(holdings: Holding[]): Record<string, number> {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  const alloc: Record<string, number> = {};
  for (const h of holdings) {
    alloc[h.name] = total > 0 ? (h.currentValue / total) * 100 : 0;
  }
  return alloc;
}

export function simulateTransaction(
  holdings: Holding[],
  input: SimulationInput
): SimulationResult {
  const beforeHoldings = cloneHoldings(holdings);
  const beforeTotal = beforeHoldings.reduce((s, h) => s + h.currentValue, 0);
  const beforeAlloc = getAllocation(beforeHoldings);
  const beforeExposure = calculateExposure(beforeHoldings);
  const beforeRisks = assessRisks(beforeHoldings, beforeExposure);

  const afterHoldings = cloneHoldings(holdings);

  if (input.action === "buy") {
    const existing = afterHoldings.find((h) => h.isin === input.isin || h.name === input.instrumentName);
    if (existing) {
      const price = input.pricePerShare || existing.avgCostPerShare;
      const newShares = input.amount / price;
      existing.shares += newShares;
      existing.totalCost += input.amount;
      existing.currentValue += input.amount;
      existing.avgCostPerShare = existing.totalCost / existing.shares;
      existing.currentPrice = price;
    } else {
      const price = input.pricePerShare || 1;
      const shares = input.amount / price;
      afterHoldings.push({
        isin: input.isin,
        name: input.instrumentName,
        assetClass: "unknown",
        shares,
        avgCostPerShare: price,
        totalCost: input.amount,
        currentPrice: price,
        currentValue: input.amount,
        unrealizedGain: 0,
        unrealizedGainPercent: 0,
        weight: 0,
        currency: "EUR",
      });
    }
  } else if (input.action === "sell") {
    const existing = afterHoldings.find((h) => h.isin === input.isin || h.name === input.instrumentName);
    if (existing) {
      const price = input.pricePerShare || existing.currentPrice;
      const sharesToSell = Math.min(input.amount / price, existing.shares);
      const costReduction = (sharesToSell / existing.shares) * existing.totalCost;
      existing.shares -= sharesToSell;
      existing.totalCost -= costReduction;
      existing.currentValue = existing.shares * existing.currentPrice;
      if (existing.shares <= 0.0001) {
        const idx = afterHoldings.indexOf(existing);
        if (idx >= 0) afterHoldings.splice(idx, 1);
      }
    }
  }

  // Recalculate weights
  const afterTotal = afterHoldings.reduce((s, h) => s + h.currentValue, 0);
  for (const h of afterHoldings) {
    h.weight = afterTotal > 0 ? (h.currentValue / afterTotal) * 100 : 0;
  }

  const afterAlloc = getAllocation(afterHoldings);
  const afterExposure = calculateExposure(afterHoldings);
  const afterRisks = assessRisks(afterHoldings, afterExposure);

  // Compute changes
  const changes: SimulationResult["changes"] = [
    {
      metric: "Total Value",
      before: beforeTotal,
      after: afterTotal,
      delta: afterTotal - beforeTotal,
    },
  ];

  // Track allocation changes for modified position
  const targetName = input.instrumentName;
  const beforeWeight = beforeAlloc[targetName] || 0;
  const afterWeight = afterAlloc[targetName] || 0;
  changes.push({
    metric: `${targetName} Weight`,
    before: beforeWeight,
    after: afterWeight,
    delta: afterWeight - beforeWeight,
  });

  return {
    input,
    before: {
      allocation: beforeAlloc,
      totalValue: beforeTotal,
      risks: beforeRisks,
    },
    after: {
      allocation: afterAlloc,
      totalValue: afterTotal,
      risks: afterRisks,
    },
    changes,
  };
}
