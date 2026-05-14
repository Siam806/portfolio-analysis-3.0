import type { Instrument } from "@/types/portfolio";

// Pre-built ETF metadata for common Trade Republic ETFs
// In production this would be fetched/updated from a data source
export const ETF_DATABASE: Record<string, Instrument> = {
  IE00B4L5Y983: {
    isin: "IE00B4L5Y983",
    name: "iShares Core MSCI World UCITS ETF",
    ticker: "EUNL",
    assetClass: "etf",
    region: "World",
    currency: "EUR",
    topHoldings: [
      { name: "Apple Inc", isin: "US0378331005", weight: 4.8, sector: "Technology", country: "US" },
      { name: "Microsoft Corp", isin: "US5949181045", weight: 4.2, sector: "Technology", country: "US" },
      { name: "NVIDIA Corp", isin: "US67066G1040", weight: 3.8, sector: "Technology", country: "US" },
      { name: "Amazon.com Inc", isin: "US0231351067", weight: 2.8, sector: "Consumer Discretionary", country: "US" },
      { name: "Meta Platforms Inc", isin: "US30303M1027", weight: 1.8, sector: "Communication Services", country: "US" },
      { name: "Alphabet Inc A", isin: "US02079K3059", weight: 1.7, sector: "Communication Services", country: "US" },
      { name: "Alphabet Inc C", isin: "US02079K1079", weight: 1.5, sector: "Communication Services", country: "US" },
      { name: "Tesla Inc", isin: "US88160R1014", weight: 1.2, sector: "Consumer Discretionary", country: "US" },
      { name: "Broadcom Inc", isin: "US11135F1012", weight: 1.1, sector: "Technology", country: "US" },
      { name: "JPMorgan Chase", isin: "US46625H1005", weight: 1.0, sector: "Financials", country: "US" },
    ],
    geographicBreakdown: {
      "North America": 70,
      Europe: 16,
      "Asia Pacific": 10,
      "Other": 4,
    },
    sectorBreakdown: {
      Technology: 24,
      Financials: 15,
      "Health Care": 12,
      "Consumer Discretionary": 11,
      Industrials: 10,
      "Communication Services": 8,
      "Consumer Staples": 7,
      Energy: 5,
      Materials: 4,
      Utilities: 3,
      "Real Estate": 1,
    },
  },
  IE00BKM4GZ66: {
    isin: "IE00BKM4GZ66",
    name: "iShares Core MSCI Emerging Markets IMI UCITS ETF",
    ticker: "IS3N",
    assetClass: "etf",
    region: "Emerging Markets",
    currency: "EUR",
    topHoldings: [
      { name: "Taiwan Semiconductor", isin: "TW0002330008", weight: 8.5, sector: "Technology", country: "TW" },
      { name: "Samsung Electronics", isin: "KR7005930003", weight: 3.8, sector: "Technology", country: "KR" },
      { name: "Tencent Holdings", isin: "KYG875721634", weight: 3.2, sector: "Communication Services", country: "CN" },
      { name: "Alibaba Group", isin: "KYG017191142", weight: 2.1, sector: "Consumer Discretionary", country: "CN" },
      { name: "Reliance Industries", isin: "INE002A01018", weight: 1.5, sector: "Energy", country: "IN" },
      { name: "ICICI Bank", isin: "INE090A01021", weight: 0.9, sector: "Financials", country: "IN" },
    ],
    geographicBreakdown: {
      China: 28,
      Taiwan: 18,
      India: 16,
      "South Korea": 13,
      Brazil: 5,
      "Saudi Arabia": 4,
      "South Africa": 3,
      "Other Emerging": 13,
    },
    sectorBreakdown: {
      Technology: 22,
      Financials: 21,
      "Consumer Discretionary": 14,
      "Communication Services": 9,
      Materials: 8,
      Industrials: 7,
      Energy: 6,
      "Consumer Staples": 5,
      "Health Care": 4,
      Utilities: 3,
      "Real Estate": 1,
    },
  },
  IE00B4K48X80: {
    isin: "IE00B4K48X80",
    name: "iShares Core MSCI Europe UCITS ETF",
    ticker: "IMAE",
    assetClass: "etf",
    region: "Europe",
    currency: "EUR",
    topHoldings: [
      { name: "Novo Nordisk", isin: "DK0060534915", weight: 4.1, sector: "Health Care", country: "DK" },
      { name: "ASML Holding", isin: "NL0010273215", weight: 3.8, sector: "Technology", country: "NL" },
      { name: "Nestlé", isin: "CH0038863350", weight: 2.5, sector: "Consumer Staples", country: "CH" },
      { name: "SAP SE", isin: "DE0007164600", weight: 2.2, sector: "Technology", country: "DE" },
      { name: "Roche Holding", isin: "CH0012032048", weight: 2.0, sector: "Health Care", country: "CH" },
      { name: "AstraZeneca", isin: "GB0009895292", weight: 1.9, sector: "Health Care", country: "GB" },
      { name: "LVMH", isin: "FR0000121014", weight: 1.8, sector: "Consumer Discretionary", country: "FR" },
      { name: "Shell plc", isin: "GB00BP6MXD84", weight: 1.6, sector: "Energy", country: "GB" },
    ],
    geographicBreakdown: {
      "United Kingdom": 24,
      France: 17,
      Switzerland: 15,
      Germany: 14,
      Netherlands: 7,
      Sweden: 5,
      Denmark: 5,
      Spain: 4,
      Italy: 4,
      "Other Europe": 5,
    },
    sectorBreakdown: {
      Financials: 18,
      "Health Care": 16,
      Industrials: 15,
      "Consumer Staples": 11,
      Technology: 9,
      "Consumer Discretionary": 8,
      Energy: 7,
      Materials: 7,
      Utilities: 5,
      "Communication Services": 3,
      "Real Estate": 1,
    },
  },
  IE00B3RBWM25: {
    isin: "IE00B3RBWM25",
    name: "Vanguard FTSE All-World UCITS ETF",
    ticker: "VWRL",
    assetClass: "etf",
    region: "World",
    currency: "EUR",
    topHoldings: [
      { name: "Apple Inc", isin: "US0378331005", weight: 4.2, sector: "Technology", country: "US" },
      { name: "Microsoft Corp", isin: "US5949181045", weight: 3.8, sector: "Technology", country: "US" },
      { name: "NVIDIA Corp", isin: "US67066G1040", weight: 3.2, sector: "Technology", country: "US" },
      { name: "Amazon.com Inc", isin: "US0231351067", weight: 2.4, sector: "Consumer Discretionary", country: "US" },
      { name: "Meta Platforms Inc", isin: "US30303M1027", weight: 1.5, sector: "Communication Services", country: "US" },
      { name: "Taiwan Semiconductor", isin: "TW0002330008", weight: 1.4, sector: "Technology", country: "TW" },
    ],
    geographicBreakdown: {
      "North America": 62,
      Europe: 16,
      "Asia Pacific": 12,
      "Emerging Markets": 10,
    },
    sectorBreakdown: {
      Technology: 23,
      Financials: 16,
      "Consumer Discretionary": 12,
      "Health Care": 11,
      Industrials: 10,
      "Communication Services": 8,
      "Consumer Staples": 6,
      Energy: 5,
      Materials: 4,
      Utilities: 3,
      "Real Estate": 2,
    },
  },
  IE00BJ0KDQ92: {
    isin: "IE00BJ0KDQ92",
    name: "Xtrackers MSCI World UCITS ETF 1C",
    ticker: "XDWD",
    assetClass: "etf",
    region: "World",
    currency: "EUR",
    topHoldings: [
      { name: "Apple Inc", isin: "US0378331005", weight: 4.9, sector: "Technology", country: "US" },
      { name: "Microsoft Corp", isin: "US5949181045", weight: 4.3, sector: "Technology", country: "US" },
      { name: "NVIDIA Corp", isin: "US67066G1040", weight: 3.9, sector: "Technology", country: "US" },
      { name: "Amazon.com Inc", isin: "US0231351067", weight: 2.9, sector: "Consumer Discretionary", country: "US" },
      { name: "Meta Platforms Inc", isin: "US30303M1027", weight: 1.9, sector: "Communication Services", country: "US" },
    ],
    geographicBreakdown: {
      "North America": 70,
      Europe: 16,
      "Asia Pacific": 10,
      "Other": 4,
    },
    sectorBreakdown: {
      Technology: 24,
      Financials: 15,
      "Health Care": 12,
      "Consumer Discretionary": 11,
      Industrials: 10,
      "Communication Services": 8,
      "Consumer Staples": 7,
      Energy: 5,
      Materials: 4,
      Utilities: 3,
      "Real Estate": 1,
    },
  },
};

export function getInstrumentData(isin: string): Instrument | undefined {
  return ETF_DATABASE[isin];
}

export function isKnownETF(isin: string): boolean {
  return isin in ETF_DATABASE;
}

// Heuristic to identify ETFs from instrument name
export function guessAssetClass(
  name: string,
  isin?: string
): "etf" | "crypto" | "stock" | "unknown" {
  if (isin && ETF_DATABASE[isin]) return "etf";
  const lower = name.toLowerCase();
  if (
    lower.includes("etf") ||
    lower.includes("ucits") ||
    lower.includes("ishares") ||
    lower.includes("vanguard") ||
    lower.includes("xtrackers") ||
    lower.includes("lyxor") ||
    lower.includes("amundi") ||
    lower.includes("spdr")
  ) {
    return "etf";
  }
  if (
    lower.includes("bitcoin") ||
    lower.includes("ethereum") ||
    lower.includes("crypto") ||
    lower === "btc" ||
    lower === "eth"
  ) {
    return "crypto";
  }
  if (isin) return "stock";
  return "unknown";
}
