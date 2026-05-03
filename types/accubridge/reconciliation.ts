// Re-exported from the API layer for convenience in component imports
export type {
  ApiReconciliationLine,
  ReconciliationDetail,
  ReconciliationListItem,
  ReconciliationsListResponse,
  ReconciliationSummary,
  MatchCandidate,
} from "@/lib/accubridge/api/reconciliationApi";

// ─── Frontend display types ───────────────────────────────────────────────────

/** Derived stats shown in the stats cards and gauge */
export interface ReconciliationStats {
  total: number;
  matched: number;
  unmatched: number;
  flagged: number;
  matchedAmount: number;
  unmatchedAmount: number;
}
