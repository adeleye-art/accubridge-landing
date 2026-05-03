"use client";

import { useMemo, useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthUserId } from "@/lib/accubridge/auth";
import { PageHeader } from "@/components/accubridge/shared/page-header";
import { ConfirmDialog } from "@/components/accubridge/shared/confirm-dialog";
import { TopBanner } from "./_components/top-banner";
import { SectionCard } from "./_components/section-card";
import { ActionQueue } from "./_components/action-queue";
import { KYCSheet } from "./_components/kyc-sheet";
import { PassportSheet } from "./_components/passport-sheet";
import { UploadDocumentSheet } from "./_components/upload-document-sheet";
import { ConnectDataSheet } from "./_components/connect-data-sheet";
import { FixActionSheet, FixType } from "./_components/fix-action-sheet";
import { ComplianceBreakdown, ActionItem, KYCData, CompliancePassport, SectionScore } from "@/types/accubridge/compliance";
import {
  useGetComplianceCentreDashboardQuery,
  useEvaluateComplianceQuery,
  useGetKycStatusQuery,
  useGetFinancialStatusQuery,
  useSubmitKycMultiEntryMutation,
  useGetAmlReportQuery,
  useGetComplianceDocumentsQuery,
  useGetComplianceAlertsQuery,
  useGetOperatingHistoryQuery,
  ComplianceSectionBreakdown,
  AmlReport,
  EvaluateResponse,
  EvaluateRuleResult,
  FinancialRecordStatus,
  ComplianceCentreAlert,
  OperatingHistoryResponse,
} from "@/lib/accubridge/api/complianceCentreApi";
import { useToast } from "@/components/accubridge/shared/toast";

// ── HMRC result toast — reads ?hmrc= param set by the callback page ──────────
function HmrcResultHandler() {
  const params  = useSearchParams();
  const router  = useRouter();
  const { toast } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const hmrc = params.get("hmrc");
    if (!hmrc) return;
    handled.current = true;

    if (hmrc === "connected") {
      toast({ title: "HMRC connected successfully. VAT obligations will sync shortly.", variant: "success" });
    } else if (hmrc === "error") {
      toast({ title: "HMRC connection failed. Please try connecting again.", variant: "error" });
    }

    // Strip the query param without a full navigation
    const url = new URL(window.location.href);
    url.searchParams.delete("hmrc");
    router.replace(url.pathname + (url.search || ""));
  }, [params, router, toast]);

  return null;
}

// ── Fallback baseline structure — used when evaluate data is absent ──────────
function buildFallbackSection(max: number, actionLabel: string, actionType: SectionScore["action_type"]): SectionScore {
  return {
    earned: 0, max,
    passed: [],
    missing: ["Awaiting verification data"],
    action_label: actionLabel,
    action_type: actionType,
    checks: [],
  };
}

// ── Converts an EvaluateRuleResult into a SectionScore ───────────────────────
function ruleToSection(
  rule: EvaluateRuleResult,
  actionLabel: string,
  actionType: SectionScore["action_type"],
  source: string,
): SectionScore {
  const isPassed = rule.passed === true;
  const score = rule.score ?? 0;
  return {
    earned: score,
    max: rule.maxScore,
    passed: isPassed ? [rule.message] : [],
    missing: isPassed ? [] : [rule.message],
    action_label: actionLabel,
    action_type: actionType,
    checks: [
      {
        label: rule.ruleName,
        status: isPassed ? "pass" : "fail",
        points: score,
        max: rule.maxScore,
        source,
        source_type: "api",
        detail: rule.message,
        checked_at: new Date().toISOString(),
      },
    ],
  };
}

// ── Build full ComplianceBreakdown from all API data ─────────────────────────
function buildBreakdown(
  evaluateData: EvaluateResponse | undefined,
  amlData: AmlReport | undefined,
  documentsData: { documents: { documentType: string; fileName: string; status: string; uploadedAt: string; fileSizeBytes: number }[] } | undefined,
  financialStatus: FinancialRecordStatus | undefined,
  alertsData: { alerts: ComplianceCentreAlert[] } | undefined,
  historyData: OperatingHistoryResponse | undefined,
): ComplianceBreakdown {
  // ── Identity & Verification (max 20) ────────────────────────────────────────
  const identity: SectionScore = evaluateData
    ? ruleToSection(evaluateData.identityVerification, "Verify Identity", "review", "Platform")
    : buildFallbackSection(20, "Start KYC Verification", "review");

  // Enrich identity checks — KYC uses identityVerification, KYB uses registrationLegal
  identity.checks = [
    {
      label: "Owner KYC passed",
      status: evaluateData?.identityVerification?.passed === true ? "pass" : "fail",
      points: evaluateData?.identityVerification?.score ?? 0,
      max: evaluateData?.identityVerification?.maxScore ?? 100,
      source: "Sumsub", source_type: "api",
      detail: evaluateData?.identityVerification?.message
        ?? "KYC not yet initiated. Complete identity verification to score this check.",
      checked_at: evaluateData?.lastEvaluated ?? new Date().toISOString(),
    },
    {
      label: "Business KYB passed",
      status: evaluateData?.registrationLegal?.passed === true ? "pass" : "fail",
      points: evaluateData?.registrationLegal?.score ?? 0,
      max: evaluateData?.registrationLegal?.maxScore ?? 100,
      source: "Sumsub", source_type: "api",
      detail: evaluateData?.registrationLegal?.message
        ?? "Business KYB not yet initiated. Required to verify the legal entity.",
      checked_at: evaluateData?.lastEvaluated ?? new Date().toISOString(),
    },
  ];

  // ── Registration & Legal Status (max 15) ────────────────────────────────────
  const registration: SectionScore = evaluateData
    ? ruleToSection(evaluateData.registrationLegal, "Fix Registration", "fix", "Companies House")
    : buildFallbackSection(15, "Fix Name Match", "fix");

  registration.checks = [
    {
      label: "Registration & Legal (KYB)",
      status: evaluateData?.registrationLegal?.passed === true ? "pass" : "fail",
      points: evaluateData?.registrationLegal?.score ?? 0,
      max: evaluateData?.registrationLegal?.maxScore ?? 100,
      source: "Companies House", source_type: "api",
      detail: evaluateData?.registrationLegal?.message
        ?? "Business registration not yet verified.",
      checked_at: evaluateData?.lastEvaluated ?? new Date().toISOString(),
    },
    {
      label: evaluateData?.profileCompletion?.ruleName ?? "Profile Completion / Onboarding",
      status: evaluateData?.profileCompletion?.passed === true ? "pass" : "fail",
      points: evaluateData?.profileCompletion?.score ?? 0,
      max: evaluateData?.profileCompletion?.maxScore ?? 100,
      source: "Platform logic", source_type: "internal_logic",
      detail: evaluateData?.profileCompletion?.message
        ?? "Business name, industry, type, and operating country are not all populated.",
      checked_at: evaluateData?.lastEvaluated ?? new Date().toISOString(),
    },
  ];

  // ── Tax Setup (max 15) ──────────────────────────────────────────────────────
  const taxConnected = financialStatus?.isTaxConnected ?? false;
  const tax: SectionScore = {
    earned: 0,
    max: 0,
    passed: taxConnected ? [`${financialStatus?.taxProvider ?? "Tax provider"} connected`] : [],
    missing: taxConnected ? [] : [
      "Tax ID not provided (0/4)",
      "VAT / payroll status not declared (0/4)",
      "HMRC obligations not synced (0/7)",
    ],
    action_label: taxConnected ? "View Tax Connection" : "Connect Tax Data",
    action_type: "connect",
    checks: [
      {
        label: "Tax ID provided",
        status: taxConnected ? "pass" : "fail",
        points: 0,
        max: 0,
        source: "User submitted", source_type: "user_input",
        detail: taxConnected ? "Tax ID verified via connected provider." : "UTR / tax ID not yet submitted.",
        checked_at: financialStatus?.taxConnectedAt ?? new Date().toISOString(),
      },
      {
        label: "VAT / payroll setup declared",
        status: taxConnected ? "pass" : "fail",
        points: 0,
        max: 0,
        source: "User submitted", source_type: "user_input",
        detail: taxConnected
          ? "VAT registration and payroll status confirmed."
          : "VAT registration and payroll status not yet declared.",
        checked_at: financialStatus?.taxConnectedAt ?? new Date().toISOString(),
      },
      {
        label: "Obligations synced from HMRC / FIRS",
        status: taxConnected ? (financialStatus?.taxSyncActive ? "pass" : "review") : "fail",
        points: 0,
        max: 0,
        source: "HMRC / FIRS API", source_type: "api",
        detail: taxConnected
          ? financialStatus?.taxSyncActive
            ? "Tax obligations synced and up to date."
            : "Connected but sync not yet active."
          : "Tax obligations not yet retrieved. Connect HMRC (UK) or FIRS (Nigeria) to sync open and overdue obligations.",
        checked_at: financialStatus?.taxConnectedAt ?? new Date().toISOString(),
      },
    ],
  };

  // ── Financial Records (max 20) ──────────────────────────────────────────────
  const catRule = evaluateData?.categorisationCompleteness;
  const recRule = evaluateData?.reconciliationRecency;
  const bankConnected = financialStatus?.isBankConnected ?? false;
  const financialEarned =
    (evaluateData?.financialSetup?.score ?? 0) +
    (evaluateData?.transactionImport?.score ?? 0) +
    (catRule?.score ?? 0) +
    (recRule?.score ?? 0);
  const financialMax =
    (evaluateData?.financialSetup?.maxScore ?? 100) +
    (evaluateData?.transactionImport?.maxScore ?? 100) +
    (catRule?.maxScore ?? 100) +
    (recRule?.maxScore ?? 100);

  const financial: SectionScore = {
    earned: financialEarned,
    max: financialMax,
    passed: [
      ...(catRule?.passed ? [catRule.message] : []),
      ...(recRule?.passed ? [recRule.message] : []),
    ],
    missing: [
      ...(catRule && !catRule.passed ? [catRule.message] : []),
      ...(recRule && !recRule.passed ? [recRule.message] : []),
      ...(!bankConnected && !catRule ? ["No bank connected or statement imported (0/5)"] : []),
    ],
    action_label: bankConnected ? "View Financial Records" : "Connect Bank Account",
    action_type: "connect",
    checks: [
      {
        label: evaluateData?.financialSetup?.ruleName ?? "Financial Setup",
        status: evaluateData?.financialSetup?.passed === true ? "pass" : "fail",
        points: evaluateData?.financialSetup?.score ?? 0,
        max: evaluateData?.financialSetup?.maxScore ?? 100,
        source: "TrueLayer", source_type: "api",
        detail: evaluateData?.financialSetup?.message
          ?? (bankConnected
            ? `${financialStatus?.bankProvider ?? "Bank"} connected${financialStatus?.bankConnectedAt ? ` on ${new Date(financialStatus.bankConnectedAt).toLocaleDateString("en-GB")}` : ""}.`
            : "No bank account connected and no statement uploaded."),
        checked_at: financialStatus?.bankConnectedAt ?? new Date().toISOString(),
      },
      {
        label: evaluateData?.transactionImport?.ruleName ?? "Transaction Import",
        status: evaluateData?.transactionImport?.passed === true ? "pass" : "fail",
        points: evaluateData?.transactionImport?.score ?? 0,
        max: evaluateData?.transactionImport?.maxScore ?? 100,
        source: "Platform", source_type: "api",
        detail: evaluateData?.transactionImport?.message
          ?? "No transactions available. Connect a bank account or import a statement first.",
        checked_at: evaluateData?.lastEvaluated ?? new Date().toISOString(),
      },
      {
        label: catRule?.ruleName ?? "Categorisation Completeness",
        status: catRule?.passed === true ? "pass" : "fail",
        points: catRule?.score ?? 0,
        max: catRule?.maxScore ?? 100,
        source: "Platform logic", source_type: "internal_logic",
        detail: catRule?.message ?? "No transactions categorised. Minimum 80% required for full points.",
        checked_at: evaluateData?.lastEvaluated ?? new Date().toISOString(),
      },
      {
        label: recRule?.ruleName ?? "Reconciliation Recency",
        status: recRule?.passed === true ? "pass" : "fail",
        points: recRule?.score ?? 0,
        max: recRule?.maxScore ?? 100,
        source: "Platform logic", source_type: "internal_logic",
        detail: recRule?.message ?? "No reconciliation started. Reconcile within 30 days to score this check.",
        checked_at: evaluateData?.lastEvaluated ?? new Date().toISOString(),
      },
    ],
  };

  // ── AML / Risk (max 15) ─────────────────────────────────────────────────────
  const risk: SectionScore = evaluateData
    ? ruleToSection(evaluateData.amlCheck, "View AML Report", "review", "Sumsub")
    : buildFallbackSection(15, "Start AML Screening", "review");

  risk.checks = [
    {
      label: "Sanctions screening clear",
      status: amlData?.sanctionsScreeningStatus === "Clear" ? "pass" : "pending",
      points: 0,
      max: 0,
      source: "Sumsub", source_type: "api",
      detail: amlData?.sanctionsScreeningStatus === "Clear"
        ? "No matches found across OFAC, UN, EU, and UK sanctions lists."
        : "AML/sanctions screening not yet initiated. KYC must be completed first.",
      checked_at: amlData?.lastScannedAt ?? evaluateData?.lastEvaluated ?? new Date().toISOString(),
    },
    {
      label: "PEP check clear",
      status: amlData && !amlData.hasPepFlags ? "pass" : "pending",
      points: 0,
      max: 0,
      source: "Sumsub", source_type: "api",
      detail: amlData && !amlData.hasPepFlags
        ? "Not identified as a Politically Exposed Person or close associate."
        : "PEP check runs automatically when KYC verification is complete.",
      checked_at: amlData?.lastScannedAt ?? evaluateData?.lastEvaluated ?? new Date().toISOString(),
    },
    {
      label: "Adverse media check clear",
      status: amlData?.adverseMediaStatus === "Clear" ? "pass" : "pending",
      points: 0,
      max: 0,
      source: "Sumsub", source_type: "api",
      detail: amlData?.adverseMediaStatus === "Clear"
        ? "No relevant adverse media results from global news database scan."
        : "Adverse media check runs automatically when KYC verification is complete.",
      checked_at: amlData?.lastScannedAt ?? evaluateData?.lastEvaluated ?? new Date().toISOString(),
    },
  ];

  // ── Documents (max 10) ──────────────────────────────────────────────────────
  const docs = documentsData?.documents ?? [];
  const verifiedDocs = docs.filter((d) => d.status === "Verified");

  const documents: SectionScore = {
    earned: 0,
    max: 0,
    passed: verifiedDocs.map((d) => `${d.documentType}: ${d.fileName}`),
    missing: docs.length === 0
      ? ["No core documents uploaded", "No active documents to verify expiry"]
      : [],
    action_label: "Upload Documents",
    action_type: "upload",
    checks: docs.length > 0
      ? docs.map((doc) => ({
          label: `${doc.documentType}: ${doc.fileName}`,
          status: doc.status === "Verified" ? "pass" as const : "review" as const,
          points: 0,
          max: 0,
          source: "User submitted", source_type: "user_input" as const,
          detail: `Status: ${doc.status} · Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString("en-GB")} · Size: ${(doc.fileSizeBytes / 1024).toFixed(2)} KB`,
          checked_at: doc.uploadedAt,
        }))
      : [
          {
            label: "Required documents uploaded",
            status: "fail" as const, points: 0, max: 0,
            source: "User submitted", source_type: "user_input" as const,
            detail: "No documents uploaded. Upload Certificate of Incorporation, proof of address, and director ID.",
            checked_at: new Date().toISOString(),
          },
          {
            label: "No expired core document",
            status: "pending" as const, points: 0, max: 0,
            source: "Platform logic", source_type: "internal_logic" as const,
            detail: "No documents submitted yet. Upload required documents to score this check.",
            checked_at: new Date().toISOString(),
          },
        ],
  };

  // ── Operating History / Behaviour (max 5) ───────────────────────────────────
  const openAlerts = (alertsData?.alerts ?? []).filter((a) => a.status === "Open");
  const hasHistory = (historyData?.history?.length ?? 0) > 0;

  const behaviour: SectionScore = {
    earned: 0,
    max: 0,
    passed: hasHistory ? ["Platform activity recorded"] : [],
    missing: [
      ...(openAlerts.length > 0 ? [`${openAlerts.length} open compliance alert(s) unresolved`] : []),
      ...(!hasHistory ? ["No platform activity recorded"] : []),
    ],
    action_label: openAlerts.length > 0 ? "Resolve Alerts" : "View History",
    action_type: "fix",
    checks: [
      {
        label: "Active monthly use",
        status: hasHistory ? "pass" : "fail",
        points: 0,
        max: 0,
        source: "Platform logic", source_type: "internal_logic",
        detail: hasHistory
          ? "Platform activity recorded for this account."
          : "No platform activity recorded for this account yet.",
        checked_at: historyData?.history?.[0]?.occurredAt ?? new Date().toISOString(),
      },
      {
        label: "Timely record updates",
        status: hasHistory ? "pass" : "fail",
        points: 0,
        max: 0,
        source: "Platform logic", source_type: "internal_logic",
        detail: hasHistory ? "Financial records have been updated recently." : "Financial records have not been updated.",
        checked_at: new Date().toISOString(),
      },
      {
        label: "No long-unresolved alerts",
        status: openAlerts.length === 0 ? "pass" : "fail",
        points: 0,
        max: 0,
        source: "Platform logic", source_type: "internal_logic",
        detail: openAlerts.length === 0
          ? "All compliance alerts have been resolved."
          : `${openAlerts.length} open compliance alert(s) need to be resolved.`,
        checked_at: new Date().toISOString(),
      },
    ],
  };

  // ── Attach evaluate messages so section cards can show them ──────────────────
  identity.evalMessage = evaluateData?.identityVerification.message;
  registration.evalMessage = evaluateData?.registrationLegal.message;
  risk.evalMessage = evaluateData?.amlCheck.message;
  // Financial: prefer the first failing rule's message, fall back to success message
  financial.evalMessage =
    (recRule && !recRule.passed)  ? recRule.message :
    (catRule && !catRule.passed)  ? catRule.message :
    catRule?.message;

  return { identity, registration, tax, financial, risk, documents, behaviour };
}

// ── Maps KycStatus (API shape) → Partial<KYCData> (form shape) ───────────────
function kycStatusToFormData(s: NonNullable<ReturnType<typeof useGetKycStatusQuery>["data"]>): import("@/types/accubridge/compliance").KYCData {
  const idTypeMap: Record<string, import("@/types/accubridge/compliance").KYCData["id_type"]> = {
    Passport:       "passport",
    DriversLicence: "drivers_licence",
    NationalId:     "national_id",
  };
  return {
    full_name:       s.fullName ?? "",
    dob:             s.dateOfBirth ?? "",
    nationality:     s.nationality ?? "",
    phone_number:    s.phoneNumber ?? "",
    email:           s.email ?? "",
    address:         s.residentialAddress ?? "",
    city:            "",
    postcode:        "",
    country:         "uk",
    id_type:         s.idType ? (idTypeMap[s.idType] ?? "passport") : "passport",
    id_number:       s.idNumber ?? "",
    id_expiry:       s.idExpiryDate ?? "",
    id_document_url: s.idDocumentUrl ?? "",
  };
}

const SECTION_KEYS = [
  "identity", "registration", "tax", "financial", "risk", "documents", "behaviour",
] as const;


export default function CompliancePage() {
  const router = useRouter();
  const { toast } = useToast();

  // ── All compliance centre queries ──────────────────────────────────────────
  const { data: centreData }      = useGetComplianceCentreDashboardQuery();
  const { data: evaluateData }    = useEvaluateComplianceQuery();
  const { data: kycStatus }       = useGetKycStatusQuery();
  const { data: financialStatus } = useGetFinancialStatusQuery();
  const { data: amlData }         = useGetAmlReportQuery();
  const { data: documentsData }   = useGetComplianceDocumentsQuery();
  const { data: alertsData }      = useGetComplianceAlertsQuery();
  const { data: historyData }     = useGetOperatingHistoryQuery();

  const [submitKycMultiEntry] = useSubmitKycMultiEntryMutation();

  // ── Passport charge pricing (in pence for GBP, kobo for NGN) ────────────────
  const compliancePriceGBP = 29.99;  // £29.99
  const compliancePriceNGN = 15000;  // ₦15,000
  
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<number | undefined>(undefined);

  // ── Retrieve user credentials from localStorage ─────────────────────────────
  useEffect(() => {
    const email = localStorage.getItem("auth_user_email") || "";
    const id = getAuthUserId();
    setUserEmail(email);
    setUserId(id ?? undefined);
  }, []);

  // ── Sheet state ────────────────────────────────────────────────────────────
  const [openSectionKey, setOpenSectionKey]       = useState<string | null>(null);
  const [requestReviewOpen, setRequestReviewOpen] = useState(false);
  const [kycOpen, setKycOpen]                     = useState(false);
  const [passportOpen, setPassportOpen]           = useState(false);
  const [passport, setPassport]                   = useState<CompliancePassport | undefined>(undefined);
  const [uploadOpen, setUploadOpen]               = useState(false);
  const [uploadDocType, setUploadDocType]         = useState("");
  const [connectOpen, setConnectOpen]             = useState(false);
  const [connectDefaultTab, setConnectDefaultTab] = useState<"bank" | "tax">("bank");
  const [fixOpen, setFixOpen]                     = useState(false);
  const [fixType, setFixType]                     = useState<FixType>("reconcile");

  // ── Map API icon keys → section card keys ─────────────────────────────────
  const ICON_TO_KEY: Record<string, keyof ComplianceBreakdown> = {
    kyc:     "identity",
    kyb:     "registration",
    tax:     "tax",
    bank:    "financial",
    aml:     "risk",
    docs:    "documents",
    history: "behaviour",
  };

  const apiSectionMap: Partial<Record<keyof ComplianceBreakdown, ComplianceSectionBreakdown>> = {};
  (centreData?.scoreBreakdown ?? []).forEach((s) => {
    const key = ICON_TO_KEY[s.icon];
    if (key) apiSectionMap[key] = s;
  });

  // ── Overall score from evaluate endpoint ──────────────────────────────────
  const totalScore = evaluateData?.overallScore ?? 0;
  const lastEvaluated = evaluateData?.lastEvaluated ?? centreData?.lastUpdated ?? new Date().toISOString();

  // ── Build real breakdown from all API data ────────────────────────────────
  const breakdown = useMemo(
    () => buildBreakdown(evaluateData, amlData, documentsData, financialStatus, alertsData, historyData),
    [evaluateData, amlData, documentsData, financialStatus, alertsData, historyData],
  );

  // ── Action queue from evaluate endpoint ───────────────────────────────────
  const actionItems: ActionItem[] = useMemo(() => {
    if (!evaluateData) return [];
    const items: ActionItem[] = [];

    const { transactionImport, categorisationCompleteness, reconciliationRecency,
            identityVerification, registrationLegal, amlCheck, financialSetup } = evaluateData;

    if (transactionImport && transactionImport.passed !== true)
      items.push({ id: "transactionImport", title: "Import Transactions",
        description: transactionImport.message, priority: "high",
        action_type: "fix", section: "financial", route: "/accubridge/client/transactions" });

    if (categorisationCompleteness && categorisationCompleteness.passed !== true)
      items.push({ id: "categorisationCompleteness", title: "Categorise Transactions",
        description: categorisationCompleteness.message, priority: "medium",
        action_type: "fix", section: "financial", route: "/accubridge/client/transactions" });

    if (reconciliationRecency && reconciliationRecency.passed !== true)
      items.push({ id: "reconciliationRecency", title: "Complete Bank Reconciliation",
        description: reconciliationRecency.message, priority: "high",
        action_type: "fix", section: "financial",
        route: "/accubridge/client/transactions/reconciliation/new" });

    if (identityVerification && identityVerification.passed !== true)
      items.push({ id: "identityVerification", title: "Verify Your Identity (KYC)",
        description: identityVerification.message,
        priority: (identityVerification.score ?? 0) > 0 ? "medium" : "high",
        action_type: "review", section: "identity" });

    if (registrationLegal && registrationLegal.passed !== true)
      items.push({ id: "registrationLegal", title: "Fix Business Registration",
        description: registrationLegal.message, priority: "high",
        action_type: "fix", section: "registration" });

    if (amlCheck && amlCheck.passed !== true)
      items.push({ id: "amlCheck", title: "Run AML Screening",
        description: amlCheck.message, priority: "medium",
        action_type: "review", section: "risk" });

    if (financialSetup && financialSetup.passed !== true)
      items.push({ id: "financialSetup", title: "Connect Bank Account",
        description: financialSetup.message, priority: "high",
        action_type: "connect", section: "financial" });

    return items;
  }, [evaluateData]);

  const handleAction = (item: ActionItem) => {
    if (item.route) { router.push(item.route); return; }
    setOpenSectionKey(item.section);
  };

  const handleSectionAction = (sectionKey: string, fixType?: string) => {
    // Identity & Verification
    if (fixType === "kyc") { setKycOpen(true); return; }
    if (fixType === "kyb" || fixType === "director") { setFixType("kyb"); setFixOpen(true); return; }

    // Registration & Legal Status
    if (fixType === "name_match") { setFixType("name_match"); setFixOpen(true); return; }
    if (fixType === "registration_number") { setFixType("registration_number"); setFixOpen(true); return; }
    if (fixType === "entity_status") { setFixType("entity_status"); setFixOpen(true); return; }
    if (fixType === "onboarding") { router.push("/onboarding"); return; }
    if (fixType === "business_profile") { setFixType("business_profile"); setFixOpen(true); return; }
    if (fixType === "registration") { setFixType("name_match"); setFixOpen(true); return; }

    // Tax Setup
    if (fixType === "tax_id") { setFixType("tax_id"); setFixOpen(true); return; }
    if (fixType === "vat_setup") { setFixType("vat_setup"); setFixOpen(true); return; }
    if (fixType === "hmrc_connect") { setFixType("hmrc_connect"); setFixOpen(true); return; }
    if (fixType === "hmrc_sync") { setFixType("hmrc_sync"); setFixOpen(true); return; }
    if (fixType === "tax_setup") { setConnectDefaultTab("tax"); setConnectOpen(true); return; }

    // Financial Records
    if (fixType === "bank_connect") { setFixType("bank_connect"); setFixOpen(true); return; }
    if (fixType === "import_transactions") { router.push("/accubridge/client/transactions"); return; }
    if (fixType === "categorise") { router.push("/accubridge/client/transactions"); return; }
    if (fixType === "reconcile") { router.push("/accubridge/client/transactions/reconciliation/new"); return; }
    if (fixType === "receipts") { setFixType("receipts"); setFixOpen(true); return; }
    if (fixType === "financial_setup") { setConnectDefaultTab("bank"); setConnectOpen(true); return; }

    // AML / Risk
    if (fixType === "alerts_review" || fixType === "aml_review") {
      setFixType("alerts_review");
      setFixOpen(true);
      return;
    }

    // Documents
    if (fixType === "documents_upload") { setFixType("documents_upload"); setFixOpen(true); return; }
    if (fixType === "documents_check") { setFixType("documents_check"); setFixOpen(true); return; }

    // Operating History / Behaviour
    if (fixType === "activity_check") { setFixType("activity_check"); setFixOpen(true); return; }
    if (fixType === "alerts") { setFixType("alerts"); setFixOpen(true); return; }
    if (fixType === "record_updates") { setFixType("record_updates"); setFixOpen(true); return; }

    // Fallback: section-based actions
    switch (sectionKey) {
      case "identity":     setKycOpen(true);                                              break;
      case "registration": setFixType("name_match");    setFixOpen(true);                 break;
      case "tax":          setConnectDefaultTab("tax");  setConnectOpen(true);             break;
      case "financial":    setConnectDefaultTab("bank"); setConnectOpen(true);             break;
      case "risk":         setFixType("alerts_review");  setFixOpen(true);                 break;
      case "documents":    setUploadDocType("");         setUploadOpen(true);              break;
      case "behaviour":    setFixType("alerts");         setFixOpen(true);                 break;
    }
  };

  // ── KYC submit — uses multi-entry endpoint ─────────────────────────────────
  const handleKYCSubmit = async (data: KYCData) => {
    try {
      const personalInfo = [{
        fullName:            data.full_name,
        dateOfBirth:         data.dob,
        nationality:         data.nationality,
        phoneNumber:         data.phone_number,
        email:               data.email,
        residentialAddress:  [data.address, data.city, data.postcode].filter(Boolean).join(", "),
      }];
      const govIds = [{
        idType:       data.id_type === "passport"        ? "Passport"
                    : data.id_type === "drivers_licence" ? "DriversLicence"
                    : "NationalId",
        idNumber:     data.id_number,
        idExpiryDate: data.id_expiry,
        idDocumentUrl: data.id_document_url || "",
      }];
      await submitKycMultiEntry({
        personalInformationJson: JSON.stringify(personalInfo),
        governmentIssuedIdsJson:  JSON.stringify(govIds),
      }).unwrap();
      toast({ title: "KYC submitted successfully", variant: "success" });
    } catch {
      toast({ title: "KYC submission failed. Please try again.", variant: "error" });
    }
  };

  const handleGeneratePassport = async (): Promise<CompliancePassport> => {
    await new Promise((res) => setTimeout(res, 1500));
    const p: CompliancePassport = {
      passport_id: `GBR${Math.floor(Math.random() * 9000000) + 1000000}A`,
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: "generated",
      verification_badges: { identity: true, company: true, tax: true, aml: true },
    };
    setPassport(p);
    return p;
  };

  return (
    <div className="p-5 md:p-8 text-white">
      {/* Detects ?hmrc=connected|error set by /hmrc/callback and shows a toast */}
      <Suspense fallback={null}>
        <HmrcResultHandler />
      </Suspense>

      <div className="max-w-5xl mx-auto">

        <PageHeader
          badge="Compliance"
          title="Compliance Centre"
          description="Your AccuBridge readiness score — built from verified identity, registration, tax, financials, and risk"
        />

        {/* Top banner — score + 3 buttons */}
        <TopBanner
          score={totalScore}
          lastUpdated={lastEvaluated}
          manualReviewRequired={false}
          onDownload={() => setPassportOpen(true)}
          onRequestReview={() => setRequestReviewOpen(true)}
          onApplyFixes={() => document.getElementById("action-queue")?.scrollIntoView({ behavior: "smooth" })}
        />

        {/* Section cards grid — 7 sections */}
        <div className="mb-8">
          <div className="mb-3">
            <h3 className="text-white font-bold text-base">Score Breakdown</h3>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              Click any card to view evidence, sources, and details for that section
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTION_KEYS.map((key) => (
              <SectionCard
                key={key}
                sectionKey={key}
                section={breakdown[key]}
                apiSection={apiSectionMap[key]}
                onAction={(fixType) => handleSectionAction(key, fixType)}
                externalOpen={openSectionKey === key}
                onExternalClose={() => setOpenSectionKey(null)}
                financialStatus={financialStatus}
                historyData={historyData}
              />
            ))}
          </div>
        </div>

        {/* Action queue */}
        <div id="action-queue" className="mb-8">
          <ActionQueue items={actionItems} onAction={handleAction} />
        </div>

        {/* Sheets */}
        <KYCSheet
          isOpen={kycOpen}
          onClose={() => setKycOpen(false)}
          existingData={kycStatus ? kycStatusToFormData(kycStatus) : undefined}
          onSubmit={handleKYCSubmit}
        />

        <PassportSheet
          isOpen={passportOpen}
          onClose={() => setPassportOpen(false)}
          passport={passport}
          companyName="Apex Solutions Ltd"
          onGenerate={handleGeneratePassport}
          onDownload={() => {}}
          compliancePriceNGN={compliancePriceNGN}
          compliancePriceGBP={compliancePriceGBP}
          userEmail={userEmail}
          userId={userId}
        />

        <UploadDocumentSheet
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          defaultDocType={uploadDocType}
        />

        <ConnectDataSheet
          isOpen={connectOpen}
          onClose={() => setConnectOpen(false)}
          defaultTab={connectDefaultTab}
          financialStatus={financialStatus}
        />

        <FixActionSheet
          isOpen={fixOpen}
          onClose={() => setFixOpen(false)}
          fixType={fixType}
          alerts={alertsData?.alerts}
          amlData={amlData}
          historyData={historyData}
        />

        <ConfirmDialog
          open={requestReviewOpen}
          onCancel={() => setRequestReviewOpen(false)}
          onConfirm={async () => {
            await new Promise((res) => setTimeout(res, 600));
            setRequestReviewOpen(false);
          }}
          variant="default"
          title="Request Compliance Review"
          description="Your assigned AccuBridge accountant will review your compliance status and update your score. You will be notified within 1–2 business days."
          confirmLabel="Request Review"
          cancelLabel="Not Now"
        />

      </div>
    </div>
  );
}
