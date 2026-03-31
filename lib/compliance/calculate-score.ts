import { ComplianceProfile } from "@/types/compliance";

export function calculateComplianceScore(profile: ComplianceProfile): number {
  let score = 0;

  if (profile.kyc_status === "verified")       score += 25;
  if (profile.company_status === "verified")   score += 25;
  if (profile.risk_calculated)                 score += 20;
  if (profile.passport_status === "generated") score += 10;
  if (profile.missing_documents.filter((d) => d.required && !d.uploaded).length === 0) score += 10;
  if (profile.company_name && profile.industry) score += 10;

  return Math.min(score, 100);
}

export function getScoreColor(score: number): string {
  if (score >= 81) return "#06D6A0";
  if (score >= 61) return "#3E92CC";
  if (score >= 41) return "#D4AF37";
  return "#ef4444";
}

export function getScoreLabel(score: number): string {
  if (score >= 81) return "Excellent";
  if (score >= 61) return "Good";
  if (score >= 41) return "Fair";
  return "Poor";
}

export function getScoreBand(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 81) return "excellent";
  if (score >= 61) return "good";
  if (score >= 41) return "fair";
  return "poor";
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
