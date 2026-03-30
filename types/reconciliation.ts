export type ReconciliationStatus = "matched" | "unmatched" | "flagged";

export interface BankStatementLine {
  id: string;
  date: string;
  description: string;
  amount: number;           // positive = credit, negative = debit
  rawType: "credit" | "debit";
  status: ReconciliationStatus;
  matchedTransactionId?: string;
  matchedTransactionLabel?: string;
  confidence?: number;      // 0–100 auto-match confidence score
  flagReason?: string;
}

export interface ReconciliationStats {
  total: number;
  matched: number;
  unmatched: number;
  flagged: number;
  matchedAmount: number;
  unmatchedAmount: number;
}

export interface InternalTransaction {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  status: "pending" | "reconciled" | "unreconciled";
}
