import { ComplianceBreakdown } from "@/types/accubridge/compliance";

// ── Score bands (per PDF spec) ──────────────────────────────────────────────
export function getScoreBandLabel(score: number): string {
  if (score >= 85) return "Strong / Funding Ready";
  if (score >= 70) return "Good / Minor Gaps";
  if (score >= 50) return "Needs Attention";
  return "High Risk / Incomplete";
}

export function getScoreBand(score: number): "strong" | "good" | "attention" | "high_risk" {
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  if (score >= 50) return "attention";
  return "high_risk";
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "#06D6A0";
  if (score >= 70) return "#3E92CC";
  if (score >= 50) return "#D4AF37";
  return "#ef4444";
}

export function getSectionColor(earned: number, max: number): "green" | "amber" | "red" {
  const pct = earned / max;
  if (pct >= 0.75) return "green";
  if (pct >= 0.4)  return "amber";
  return "red";
}

export function getSectionHex(earned: number, max: number): string {
  const c = getSectionColor(earned, max);
  return c === "green" ? "#06D6A0" : c === "amber" ? "#D4AF37" : "#ef4444";
}

export function calculateTotal(breakdown: ComplianceBreakdown): number {
  return (
    breakdown.identity.earned +
    breakdown.registration.earned +
    breakdown.tax.earned +
    breakdown.financial.earned +
    breakdown.risk.earned +
    breakdown.documents.earned +
    breakdown.behaviour.earned
  );
}

// Legacy helpers kept for backward compat
export function getScoreLabel(score: number): string {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

export function getRiskColor(level: string): string {
  switch (level) {
    case "low":       return "#06D6A0";
    case "medium":    return "#D4AF37";
    case "high":      return "#fb923c";
    case "very_high": return "#ef4444";
    default:          return "#6B7280";
  }
}
