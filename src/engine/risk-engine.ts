import type {
  Holding,
  PortfolioExposure,
  RiskAssessment,
  RiskThresholds,
  RiskSeverity,
} from "@/types/portfolio";

const DEFAULT_THRESHOLDS: RiskThresholds = {
  maxCryptoPercent: 10,
  maxSingleStockPercent: 15,
  maxSingleSectorPercent: 30,
  maxSingleRegionPercent: 60,
  minHoldingsCount: 5,
  maxEtfOverlapPercent: 20,
};

function severity(current: number, threshold: number, isMin = false): RiskSeverity {
  if (isMin) {
    if (current < threshold * 0.5) return "critical";
    if (current < threshold) return "warning";
    return "info";
  }
  if (current > threshold * 1.5) return "critical";
  if (current > threshold) return "warning";
  return "info";
}

export function assessRisks(
  holdings: Holding[],
  exposure: PortfolioExposure,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS
): RiskAssessment[] {
  const risks: RiskAssessment[] = [];
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  if (totalValue === 0) return risks;

  // 1. Crypto concentration
  const cryptoWeight = holdings
    .filter((h) => h.assetClass === "crypto")
    .reduce((s, h) => s + h.weight, 0);
  if (cryptoWeight > 0) {
    const sev = severity(cryptoWeight, thresholds.maxCryptoPercent);
    risks.push({
      id: "crypto-concentration",
      category: "Concentration",
      title: "Crypto Allocation",
      description: `Crypto makes up ${cryptoWeight.toFixed(1)}% of the portfolio (threshold: ${thresholds.maxCryptoPercent}%).`,
      severity: sev,
      currentValue: cryptoWeight,
      threshold: thresholds.maxCryptoPercent,
      metric: "crypto_weight_percent",
    });
  }

  // 2. Single stock concentration
  for (const holding of holdings) {
    if (holding.assetClass === "stock" && holding.weight > thresholds.maxSingleStockPercent) {
      risks.push({
        id: `stock-concentration-${holding.isin}`,
        category: "Concentration",
        title: `${holding.name} Overweight`,
        description: `${holding.name} is ${holding.weight.toFixed(1)}% of the portfolio (threshold: ${thresholds.maxSingleStockPercent}%).`,
        severity: severity(holding.weight, thresholds.maxSingleStockPercent),
        currentValue: holding.weight,
        threshold: thresholds.maxSingleStockPercent,
        metric: "single_stock_weight_percent",
      });
    }
  }

  // 3. Sector concentration
  for (const entry of exposure.sector) {
    if (entry.percent > thresholds.maxSingleSectorPercent) {
      risks.push({
        id: `sector-concentration-${entry.name}`,
        category: "Sector",
        title: `${entry.name} Sector Overweight`,
        description: `${entry.name} sector is ${entry.percent.toFixed(1)}% of exposure (threshold: ${thresholds.maxSingleSectorPercent}%).`,
        severity: severity(entry.percent, thresholds.maxSingleSectorPercent),
        currentValue: entry.percent,
        threshold: thresholds.maxSingleSectorPercent,
        metric: "sector_weight_percent",
      });
    }
  }

  // 4. Geographic concentration
  for (const entry of exposure.geographic) {
    if (entry.percent > thresholds.maxSingleRegionPercent) {
      risks.push({
        id: `geo-concentration-${entry.name}`,
        category: "Geographic",
        title: `${entry.name} Region Overweight`,
        description: `${entry.name} is ${entry.percent.toFixed(1)}% of geographic exposure (threshold: ${thresholds.maxSingleRegionPercent}%).`,
        severity: severity(entry.percent, thresholds.maxSingleRegionPercent),
        currentValue: entry.percent,
        threshold: thresholds.maxSingleRegionPercent,
        metric: "region_weight_percent",
      });
    }
  }

  // 5. Low diversification
  if (holdings.length < thresholds.minHoldingsCount) {
    risks.push({
      id: "low-diversification",
      category: "Diversification",
      title: "Low Number of Holdings",
      description: `Portfolio has only ${holdings.length} holdings (minimum recommended: ${thresholds.minHoldingsCount}).`,
      severity: severity(holdings.length, thresholds.minHoldingsCount, true),
      currentValue: holdings.length,
      threshold: thresholds.minHoldingsCount,
      metric: "holdings_count",
    });
  }

  // 6. Company overlap through ETFs
  const companyExposures = exposure.company.filter((c) => c.source === "mixed" || c.source === "etf-derived");
  for (const comp of companyExposures) {
    if (comp.percent > thresholds.maxEtfOverlapPercent) {
      risks.push({
        id: `etf-overlap-${comp.name}`,
        category: "ETF Overlap",
        title: `${comp.name} Hidden Concentration`,
        description: `${comp.name} appears across multiple ETFs totaling ${comp.percent.toFixed(1)}% exposure (threshold: ${thresholds.maxEtfOverlapPercent}%).`,
        severity: severity(comp.percent, thresholds.maxEtfOverlapPercent),
        currentValue: comp.percent,
        threshold: thresholds.maxEtfOverlapPercent,
        metric: "company_overlap_percent",
      });
    }
  }

  // Sort: critical first, then warning, then info
  const severityOrder: Record<RiskSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return risks;
}
