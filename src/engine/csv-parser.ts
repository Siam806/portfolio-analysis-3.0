import Papa from "papaparse";
import { v4 as uuid } from "uuid";
import type {
  Transaction,
  TransactionType,
  ImportResult,
  ImportError,
  ImportWarning,
} from "@/types/portfolio";

// Trade Republic CSV column mappings
const TR_COLUMN_MAP: Record<string, string> = {
  datum: "date",
  date: "date",
  typ: "type",
  type: "type",
  wertpapier: "instrumentName",
  asset: "instrumentName",
  "asset name": "instrumentName",
  name: "instrumentName",
  isin: "isin",
  symbol: "isin",
  anzahl: "shares",
  shares: "shares",
  "anzahl (stk.)": "shares",
  kurs: "pricePerShare",
  price: "pricePerShare",
  "price per share": "pricePerShare",
  "kurs pro aktie": "pricePerShare",
  betrag: "totalAmount",
  amount: "totalAmount",
  wert: "totalAmount",
  "gesamt (eur)": "totalAmount",
  gebühr: "fee",
  fee: "fee",
  steuer: "tax",
  tax: "tax",
  notiz: "note",
  note: "note",
  description: "note",
};

const TR_TYPE_MAP: Record<string, TransactionType> = {
  kauf: "buy",
  buy: "buy",
  purchase: "buy",
  BUY: "buy",
  verkauf: "sell",
  sell: "sell",
  sale: "sell",
  SELL: "sell",
  dividende: "dividend",
  dividend: "dividend",
  DIVIDEND: "dividend",
  zinsen: "interest",
  interest: "interest",
  INTEREST: "interest",
  INTEREST_PAYMENT: "interest",
  einzahlung: "deposit",
  deposit: "deposit",
  DEPOSIT: "deposit",
  TRANSFER_INSTANT_INBOUND: "deposit",
  TRANSFER_INBOUND: "deposit",
  auszahlung: "withdrawal",
  withdrawal: "withdrawal",
  WITHDRAWAL: "withdrawal",
  gebühr: "fee",
  fee: "fee",
  FEE: "fee",
  steuer: "tax",
  tax: "tax",
  TAX: "tax",
  saveback: "saveback",
  "card cashback": "card_cashback",
  "card refund": "card_refund",
  "karten-cashback": "card_cashback",
  "karten-erstattung": "card_refund",
  CARD_TRANSACTION: "card_transaction",
  "card transaction": "card_transaction",
};

function normalizeColumnName(col: string): string {
  const lower = col.trim().toLowerCase();
  return TR_COLUMN_MAP[lower] || lower;
}

function mapTransactionType(raw: string): TransactionType {
  const lower = raw.trim().toLowerCase();
  return TR_TYPE_MAP[lower] || "unknown";
}

function parseNumber(val: string | undefined | null): number {
  if (!val) return 0;
  // Remove currency symbols and spaces
  let cleaned = val.replace(/[€$\s]/g, "");
  
  // Check if it's European format (has comma as decimal separator and dots as thousands)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // European format: 1.234,56 -> 1234.56
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(',')) {
    // Could be European decimal: 1234,56 -> 1234.56
    // Check if comma is used as decimal (only one comma and it's near the end)
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = cleaned.replace(",", ".");
    }
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(val: string): string {
  if (!val) return new Date().toISOString();
  // Try ISO format first
  const isoDate = new Date(val);
  if (!isNaN(isoDate.getTime())) return isoDate.toISOString();
  // Try DD.MM.YYYY (German format)
  const parts = val.split(".");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  // Try DD/MM/YYYY
  const slashParts = val.split("/");
  if (slashParts.length === 3) {
    const [day, month, year] = slashParts;
    const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

export function parseTradeRepublicCSV(csvText: string): ImportResult {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  const transactions: Transaction[] = [];
  const seenIds = new Set<string>();
  let duplicatesSkipped = 0;

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => normalizeColumnName(header),
  });

  if (parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      errors.push({
        row: err.row ?? 0,
        message: `CSV parse error: ${err.message}`,
      });
    }
  }

  const totalRows = parsed.data.length;

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i] as Record<string, string>;
    const rowNum = i + 2; // 1-indexed + header row

    try {
      const type = mapTransactionType(row.type || "");
      const instrumentName = (row.instrumentName || row.instrumentname || "").trim();
      const isin = (row.isin || row.symbol || "").trim();
      const date = parseDate(row.date || "");
      const shares = parseNumber(row.shares);
      const pricePerShare = parseNumber(row.pricepershare || row.pricePerShare || row.price);
      const totalAmount = parseNumber(row.totalamount || row.totalAmount || row.amount);
      const fee = parseNumber(row.fee);
      const tax = parseNumber(row.tax);

      if (type === "unknown" && !instrumentName && totalAmount === 0) {
        warnings.push({
          row: rowNum,
          message: "Empty or unrecognizable row, skipped.",
        });
        continue;
      }

      // Deduplication key
      const dedupKey = `${date}|${type}|${isin || instrumentName}|${totalAmount}|${shares}`;
      if (seenIds.has(dedupKey)) {
        duplicatesSkipped++;
        continue;
      }
      seenIds.add(dedupKey);

      if (type === "unknown") {
        warnings.push({
          row: rowNum,
          message: `Unknown transaction type: "${row.type}"`,
          suggestion: "This row may need manual classification.",
        });
      }

      if (!isin && instrumentName && (type === "buy" || type === "sell")) {
        warnings.push({
          row: rowNum,
          message: `Missing ISIN for "${instrumentName}"`,
          suggestion: "Consider adding ISIN manually for accurate tracking.",
        });
      }

      const transaction: Transaction = {
        id: uuid(),
        date,
        type,
        instrumentName,
        isin: isin || undefined,
        shares: Math.abs(shares),
        pricePerShare: Math.abs(pricePerShare),
        totalAmount,
        fee: Math.abs(fee),
        tax: Math.abs(tax),
        currency: "EUR",
        rawRow: row,
      };

      transactions.push(transaction);
    } catch (e) {
      errors.push({
        row: rowNum,
        message: `Failed to parse row: ${e instanceof Error ? e.message : "Unknown error"}`,
        rawData: row,
      });
    }
  }

  // Sort by date
  transactions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    transactions,
    errors,
    warnings,
    duplicatesSkipped,
    totalRows,
    successRows: transactions.length,
  };
}
