import type {
  Transaction,
  Holding,
  PortfolioSummary,
  PortfolioExposure,
  ExposureEntry,
  Instrument,
} from "@/types/portfolio";
import { getInstrumentData, guessAssetClass } from "./etf-data";

interface PositionAccumulator {
  isin: string;
  name: string;
  shares: number;
  totalCostBasis: number;
  sector?: string;
  region?: string;
  country?: string;
  currency: string;
}

export function calculateHoldings(transactions: Transaction[]): Holding[] {
  const positions = new Map<string, PositionAccumulator>();

  for (const tx of transactions) {
    const key = tx.isin || tx.instrumentName;
    if (!key) continue;

    if (tx.type === "buy" || tx.type === "saveback" || tx.type === "card_cashback") {
      const existing = positions.get(key);
      if (existing) {
        existing.shares += tx.shares;
        existing.totalCostBasis += Math.abs(tx.totalAmount);
      } else {
        const instrument = tx.isin ? getInstrumentData(tx.isin) : undefined;
        positions.set(key, {
          isin: tx.isin || key,
          name: tx.instrumentName,
          shares: tx.shares,
          totalCostBasis: Math.abs(tx.totalAmount),
          sector: instrument?.sector,
          region: instrument?.region,
          country: instrument?.country,
          currency: tx.currency,
        });
      }
    } else if (tx.type === "sell") {
      const existing = positions.get(key);
      if (existing) {
        const soldRatio = tx.shares / existing.shares;
        existing.totalCostBasis -= existing.totalCostBasis * soldRatio;
        existing.shares -= tx.shares;
        if (existing.shares <= 0.0001) {
          positions.delete(key);
        }
      }
    }
  }

  // Calculate current values (use avg cost as proxy when no market data)
  const holdings: Holding[] = [];
  let totalPortfolioValue = 0;

  for (const pos of positions.values()) {
    if (pos.shares <= 0) continue;
    const avgCost = pos.totalCostBasis / pos.shares;
    // Without live market data, we use cost basis as current value
    const currentPrice = avgCost;
    const currentValue = pos.shares * currentPrice;
    totalPortfolioValue += currentValue;

    const instrument = getInstrumentData(pos.isin);
    const assetClass = guessAssetClass(pos.name, pos.isin);

    holdings.push({
      isin: pos.isin,
      name: pos.name,
      assetClass,
      shares: pos.shares,
      avgCostPerShare: avgCost,
      totalCost: pos.totalCostBasis,
      currentPrice,
      currentValue,
      unrealizedGain: 0, // No market data yet
      unrealizedGainPercent: 0,
      weight: 0, // Set below
      sector: instrument?.sector || pos.sector,
      region: instrument?.region || pos.region,
      country: instrument?.country || pos.country,
      currency: pos.currency,
    });
  }

  // Calculate weights
  for (const h of holdings) {
    h.weight = totalPortfolioValue > 0 ? (h.currentValue / totalPortfolioValue) * 100 : 0;
  }

  // Sort by value descending
  holdings.sort((a, b) => b.currentValue - a.currentValue);

  return holdings;
}

export function calculatePortfolioSummary(
  transactions: Transaction[],
  holdings: Holding[]
): PortfolioSummary {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const totalDividends = transactions
    .filter((t) => t.type === "dividend" || t.type === "interest")
    .reduce((sum, t) => sum + Math.abs(t.totalAmount), 0);

  const totalFees = transactions
    .filter((t) => t.type === "fee")
    .reduce((sum, t) => sum + Math.abs(t.totalAmount), 0);

  const totalTaxes = transactions
    .reduce((sum, t) => sum + t.tax, 0);

  const assetClassBreakdown: Record<string, number> = {};
  for (const h of holdings) {
    const cls = h.assetClass;
    assetClassBreakdown[cls] = (assetClassBreakdown[cls] || 0) + h.weight;
  }

  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
    holdingsCount: holdings.length,
    assetClassBreakdown,
    totalDividends,
    totalFees,
    totalTaxes,
    lastUpdated: new Date().toISOString(),
  };
}

export function calculateExposure(holdings: Holding[]): PortfolioExposure {
  const geoMap = new Map<string, { value: number; source: Set<"direct" | "etf-derived"> }>();
  const sectorMap = new Map<string, { value: number; source: Set<"direct" | "etf-derived"> }>();
  const companyMap = new Map<string, { value: number; source: Set<"direct" | "etf-derived"> }>();
  const assetClassMap = new Map<string, { value: number; source: Set<"direct" | "etf-derived"> }>();

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  if (totalValue === 0) {
    return { geographic: [], sector: [], company: [], assetClass: [] };
  }

  for (const holding of holdings) {
    const instrument: Instrument | undefined = getInstrumentData(holding.isin);

    // Asset class exposure
    const acKey = holding.assetClass;
    const acEntry = assetClassMap.get(acKey) || { value: 0, source: new Set<"direct" | "etf-derived">() };
    acEntry.value += holding.currentValue;
    acEntry.source.add("direct");
    assetClassMap.set(acKey, acEntry);

    if (instrument && holding.assetClass === "etf") {
      // ETF look-through: geographic
      if (instrument.geographicBreakdown) {
        for (const [region, pct] of Object.entries(instrument.geographicBreakdown)) {
          const entry = geoMap.get(region) || { value: 0, source: new Set<"direct" | "etf-derived">() };
          entry.value += (holding.currentValue * pct) / 100;
          entry.source.add("etf-derived");
          geoMap.set(region, entry);
        }
      }

      // ETF look-through: sector
      if (instrument.sectorBreakdown) {
        for (const [sector, pct] of Object.entries(instrument.sectorBreakdown)) {
          const entry = sectorMap.get(sector) || { value: 0, source: new Set<"direct" | "etf-derived">() };
          entry.value += (holding.currentValue * pct) / 100;
          entry.source.add("etf-derived");
          sectorMap.set(sector, entry);
        }
      }

      // ETF look-through: company
      if (instrument.topHoldings) {
        for (const comp of instrument.topHoldings) {
          const entry = companyMap.get(comp.name) || { value: 0, source: new Set<"direct" | "etf-derived">() };
          entry.value += (holding.currentValue * comp.weight) / 100;
          entry.source.add("etf-derived");
          companyMap.set(comp.name, entry);
        }
      }
    } else {
      // Direct holding
      if (holding.region) {
        const entry = geoMap.get(holding.region) || { value: 0, source: new Set<"direct" | "etf-derived">() };
        entry.value += holding.currentValue;
        entry.source.add("direct");
        geoMap.set(holding.region, entry);
      }

      if (holding.sector) {
        const entry = sectorMap.get(holding.sector) || { value: 0, source: new Set<"direct" | "etf-derived">() };
        entry.value += holding.currentValue;
        entry.source.add("direct");
        sectorMap.set(holding.sector, entry);
      }

      // Direct stock as company exposure
      if (holding.assetClass === "stock") {
        const entry = companyMap.get(holding.name) || { value: 0, source: new Set<"direct" | "etf-derived">() };
        entry.value += holding.currentValue;
        entry.source.add("direct");
        companyMap.set(holding.name, entry);
      }
    }
  }

  const toExposureEntries = (
    map: Map<string, { value: number; source: Set<"direct" | "etf-derived"> }>
  ): ExposureEntry[] => {
    return Array.from(map.entries())
      .map(([name, { value, source }]) => ({
        name,
        value,
        percent: (value / totalValue) * 100,
        source: (source.size > 1 ? "mixed" : source.values().next().value) as
          | "direct"
          | "etf-derived"
          | "mixed",
      }))
      .sort((a, b) => b.percent - a.percent);
  };

  return {
    geographic: toExposureEntries(geoMap),
    sector: toExposureEntries(sectorMap),
    company: toExposureEntries(companyMap),
    assetClass: toExposureEntries(assetClassMap),
  };
}
