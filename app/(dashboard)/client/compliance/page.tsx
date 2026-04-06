"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TopBanner } from "./_components/top-banner";
import { SectionCard } from "./_components/section-card";
import { ActionQueue } from "./_components/action-queue";
import { KYCSheet } from "./_components/kyc-sheet";
import { PassportSheet } from "./_components/passport-sheet";
import { UploadDocumentSheet } from "./_components/upload-document-sheet";
import { ConnectDataSheet } from "./_components/connect-data-sheet";
import { FixActionSheet, FixType } from "./_components/fix-action-sheet";
import { ComplianceBreakdown, ActionItem, KYCData, CompliancePassport } from "@/types/compliance";
import { calculateTotal } from "@/lib/compliance/calculate-score";

// ── Mock compliance breakdown — fresh / zero state ───────────────────────────
const MOCK_BREAKDOWN: ComplianceBreakdown = {
  identity: {
    earned: 0, max: 20,
    passed: [],
    missing: [
      "Owner KYC not yet verified (0/8)",
      "Business KYB not started (0/7)",
      "Director details not submitted (0/5)",
    ],
    action_label: "Start KYC Verification",
    action_type: "review",
    checks: [
      {
        label: "Owner KYC passed",
        status: "fail", points: 0, max: 8,
        source: "Sumsub", source_type: "api",
        detail: "KYC not yet initiated. Complete identity verification to score this check.",
        checked_at: "2026-04-06T09:00:00Z",
      },
      {
        label: "Business KYB passed",
        status: "fail", points: 0, max: 7,
        source: "Sumsub", source_type: "api",
        detail: "Business KYB not yet initiated. Required to verify the legal entity.",
        checked_at: "2026-04-06T09:00:00Z",
      },
      {
        label: "Beneficial owner / director details complete",
        status: "fail", points: 0, max: 5,
        source: "User submitted", source_type: "user_input",
        detail: "Director details not yet submitted.",
        checked_at: "2026-04-06T09:00:00Z",
      },
    ],
  },
  registration: {
    earned: 0, max: 15,
    passed: [],
    missing: [
      "Registration number not provided (0/3)",
      "Legal name not verified against official record (0/5)",
      "Entity status not confirmed (0/4)",
      "Core profile incomplete (0/3)",
    ],
    action_label: "Fix Name Match",
    action_type: "fix",
    checks: [
      {
        label: "Registration number provided",
        status: "fail", points: 0, max: 3,
        source: "User submitted", source_type: "user_input",
        detail: "No Companies House or CAC registration number submitted.",
        checked_at: "2026-04-06T08:00:00Z",
      },
      {
        label: "Legal name matches official record",
        status: "fail", points: 0, max: 5,
        source: "Companies House", source_type: "api",
        detail: "Company name not yet verified against the official Companies House record.",
        checked_at: "2026-04-06T08:00:00Z",
      },
      {
        label: "Entity status active",
        status: "fail", points: 0, max: 4,
        source: "Companies House", source_type: "api",
        detail: "Entity status not confirmed. Registration number required first.",
        checked_at: "2026-04-06T08:00:00Z",
      },
      {
        label: "Core profile complete",
        status: "fail", points: 0, max: 3,
        source: "Platform logic", source_type: "internal_logic",
        detail: "Business name, industry, type, and operating country are not all populated.",
        checked_at: "2026-04-06T08:00:00Z",
      },
    ],
  },
  tax: {
    earned: 0, max: 15,
    passed: [],
    missing: [
      "Tax ID not provided (0/4)",
      "VAT / payroll status not declared (0/4)",
      "Filing calendar not configured (0/3)",
      "HMRC obligations not synced (0/4)",
    ],
    action_label: "Connect Tax Data",
    action_type: "connect",
    checks: [
      {
        label: "Tax ID provided",
        status: "fail", points: 0, max: 4,
        source: "User submitted", source_type: "user_input",
        detail: "UTR / tax ID not yet submitted.",
        checked_at: "2026-04-06T11:00:00Z",
      },
      {
        label: "VAT / payroll setup declared",
        status: "fail", points: 0, max: 4,
        source: "User submitted", source_type: "user_input",
        detail: "VAT registration and payroll status not yet declared.",
        checked_at: "2026-04-06T11:00:00Z",
      },
      {
        label: "Filing calendar configured",
        status: "fail", points: 0, max: 3,
        source: "Platform logic", source_type: "internal_logic",
        detail: "No filing calendar set up. Connect your HMRC account to auto-populate obligations.",
        checked_at: "2026-04-06T08:00:00Z",
      },
      {
        label: "Obligations synced from HMRC",
        status: "fail", points: 0, max: 4,
        source: "HMRC VAT API", source_type: "api",
        detail: "VAT obligations not yet retrieved. Connect HMRC to sync open and overdue obligations.",
        checked_at: "2026-04-06T08:00:00Z",
      },
    ],
  },
  financial: {
    earned: 0, max: 20,
    passed: [],
    missing: [
      "No bank connected or statement imported (0/5)",
      "No transactions imported (0/4)",
      "Categorisation at 0% — minimum 80% required (0/4)",
      "Reconciliation not started (0/5)",
      "No receipt coverage (0/2)",
    ],
    action_label: "Connect Bank Account",
    action_type: "connect",
    checks: [
      {
        label: "Bank connected or statement imported",
        status: "fail", points: 0, max: 5,
        source: "TrueLayer", source_type: "api",
        detail: "No bank account connected and no statement uploaded.",
        checked_at: "2026-04-06T07:30:00Z",
      },
      {
        label: "Transactions imported",
        status: "fail", points: 0, max: 4,
        source: "TrueLayer", source_type: "api",
        detail: "No transactions available. Connect a bank account or import a statement first.",
        checked_at: "2026-04-06T07:30:00Z",
      },
      {
        label: "Categorisation completeness",
        status: "fail", points: 0, max: 4,
        source: "Platform logic", source_type: "internal_logic",
        detail: "No transactions categorised. Minimum 80% required for full points.",
        checked_at: "2026-04-06T08:00:00Z",
      },
      {
        label: "Reconciliation current",
        status: "fail", points: 0, max: 5,
        source: "Platform logic", source_type: "internal_logic",
        detail: "No reconciliation started. Reconcile within 30 days to score this check.",
        checked_at: "2026-04-06T08:00:00Z",
      },
      {
        label: "Receipt coverage / support evidence",
        status: "fail", points: 0, max: 2,
        source: "Platform logic", source_type: "internal_logic",
        detail: "No receipts uploaded. Upload receipts for transactions over £50.",
        checked_at: "2026-04-06T08:00:00Z",
      },
    ],
  },
  risk: {
    earned: 0, max: 15,
    passed: [],
    missing: ["AML / sanctions screening not yet completed (0/15)"],
    action_label: "Start AML Screening",
    action_type: "review",
    checks: [
      {
        label: "Sanctions screening clear",
        status: "pending", points: 0, max: 15,
        source: "Sumsub", source_type: "api",
        detail: "AML/sanctions screening not yet initiated. KYC must be completed first.",
        checked_at: "2026-04-06T09:00:00Z",
      },
      {
        label: "PEP check clear",
        status: "pending", points: 0, max: 0,
        source: "Sumsub", source_type: "api",
        detail: "PEP check runs automatically when KYC verification is complete.",
        checked_at: "2026-04-06T09:00:00Z",
      },
      {
        label: "Adverse media check clear",
        status: "pending", points: 0, max: 0,
        source: "Sumsub", source_type: "api",
        detail: "Adverse media check runs automatically when KYC verification is complete.",
        checked_at: "2026-04-06T09:00:00Z",
      },
    ],
  },
  documents: {
    earned: 0, max: 10,
    passed: [],
    missing: [
      "No core documents uploaded (0/6)",
      "No active documents to verify expiry (0/4)",
    ],
    action_label: "Upload Documents",
    action_type: "upload",
    checks: [
      {
        label: "Required documents uploaded",
        status: "fail", points: 0, max: 6,
        source: "User submitted", source_type: "user_input",
        detail: "No documents uploaded. Upload Certificate of Incorporation, proof of address, and director ID.",
        checked_at: "2026-04-06T16:00:00Z",
      },
      {
        label: "No expired core document",
        status: "pending", points: 0, max: 4,
        source: "Platform logic", source_type: "internal_logic",
        detail: "No documents submitted yet. Upload required documents to score this check.",
        checked_at: "2026-04-06T08:00:00Z",
      },
    ],
  },
  behaviour: {
    earned: 0, max: 5,
    passed: [],
    missing: [
      "No platform activity recorded (0/2)",
      "Financial records not updated in 30 days (0/2)",
      "Open compliance alerts unresolved (0/1)",
    ],
    action_label: "Resolve Alerts",
    action_type: "fix",
    checks: [
      {
        label: "Active monthly use",
        status: "fail", points: 0, max: 2,
        source: "Platform logic", source_type: "internal_logic",
        detail: "No platform activity recorded for this account yet.",
        checked_at: "2026-04-06T08:00:00Z",
      },
      {
        label: "Timely record updates",
        status: "fail", points: 0, max: 2,
        source: "Platform logic", source_type: "internal_logic",
        detail: "Financial records have not been updated.",
        checked_at: "2026-04-06T08:00:00Z",
      },
      {
        label: "No long-unresolved alerts",
        status: "fail", points: 0, max: 1,
        source: "Platform logic", source_type: "internal_logic",
        detail: "Open compliance alerts need to be resolved.",
        checked_at: "2026-04-06T08:00:00Z",
      },
    ],
  },
};

const MOCK_ACTIONS: ActionItem[] = [
  {
    id: "a1",
    title: "Complete owner identity verification (KYC)",
    description: "Verify your identity via Sumsub to unlock the identity score and start AML checks.",
    action_type: "review",
    priority: "high",
    section: "identity",
  },
  {
    id: "a2",
    title: "Start business KYB verification",
    description: "Submit your registration number and Certificate of Incorporation to verify your legal entity.",
    action_type: "fix",
    priority: "high",
    section: "identity",
  },
  {
    id: "a3",
    title: "Connect bank account or import statement",
    description: "Link your bank via TrueLayer (UK) or Mono (Nigeria) to import transactions and unlock the financial score.",
    action_type: "connect",
    priority: "high",
    section: "financial",
  },
  {
    id: "a4",
    title: "Upload core compliance documents",
    description: "Upload your Certificate of Incorporation, proof of registered address, and director ID.",
    action_type: "upload",
    priority: "high",
    section: "documents",
  },
  {
    id: "a5",
    title: "Connect HMRC to sync tax obligations",
    description: "Connect your HMRC account to automatically retrieve VAT obligations and populate your filing calendar.",
    action_type: "connect",
    priority: "medium",
    due_date: "2026-04-30",
    section: "tax",
  },
  {
    id: "a6",
    title: "Fix legal name mismatch",
    description: "Your submitted company name differs from the Companies House record. Update to match exactly.",
    action_type: "fix",
    priority: "medium",
    section: "registration",
  },
  {
    id: "a7",
    title: "Resolve open compliance alerts",
    description: "Review and close open compliance alerts to start building your behaviour score.",
    action_type: "fix",
    priority: "medium",
    section: "behaviour",
  },
];

const SECTION_KEYS = [
  "identity", "registration", "tax", "financial", "risk", "documents", "behaviour",
] as const;

export default function CompliancePage() {
  const [breakdown] = useState<ComplianceBreakdown>(MOCK_BREAKDOWN);
  const [requestReviewOpen, setRequestReviewOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [passport, setPassport] = useState<CompliancePassport | undefined>(undefined);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("");
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectDefaultTab, setConnectDefaultTab] = useState<"bank" | "tax">("bank");
  const [fixOpen, setFixOpen] = useState(false);
  const [fixType, setFixType] = useState<FixType>("reconcile");

  const totalScore = calculateTotal(breakdown);
  const manualReviewRequired = false; // would be driven by backend flags

  const handleAction = (item: ActionItem) => {
    switch (item.action_type) {
      case "upload":
        setUploadDocType(item.section === "documents" ? "director_id" : "");
        setUploadOpen(true);
        break;
      case "connect":
        setConnectDefaultTab(item.section === "tax" ? "tax" : "bank");
        setConnectOpen(true);
        break;
      case "fix":
        if (item.section === "identity")      { setFixType("kyb");        setFixOpen(true); }
        else if (item.section === "registration") { setFixType("name_match"); setFixOpen(true); }
        else if (item.section === "financial" && item.id === "a6") { setFixType("categorise"); setFixOpen(true); }
        else if (item.section === "financial") { setFixType("reconcile");  setFixOpen(true); }
        else if (item.section === "behaviour") { setFixType("alerts");     setFixOpen(true); }
        else                                   { setFixType("record_updates"); setFixOpen(true); }
        return;
      case "review":
        if (item.section === "identity")      setKycOpen(true);
        else if (item.section === "risk")     { setFixType("alerts_review"); setFixOpen(true); }
        else if (item.section === "behaviour"){ setFixType("alerts");       setFixOpen(true); }
        break;
    }
  };

  const handleSectionAction = (sectionKey: string, fixType?: string) => {
    // Identity & Verification
    if (fixType === "kyc") { setKycOpen(true); return; }
    if (fixType === "kyb" || fixType === "director") { setFixType("kyb"); setFixOpen(true); return; }

    // Registration & Legal Status
    if (fixType === "name_match") { setFixType("name_match"); setFixOpen(true); return; }
    if (fixType === "registration_number") { setFixType("registration_number"); setFixOpen(true); return; }
    if (fixType === "entity_status") { setFixType("entity_status"); setFixOpen(true); return; }
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
    if (fixType === "import_transactions") { setFixType("import_transactions"); setFixOpen(true); return; }
    if (fixType === "categorise") { setFixType("categorise"); setFixOpen(true); return; }
    if (fixType === "reconcile") { setFixType("reconcile"); setFixOpen(true); return; }
    if (fixType === "receipts") { setFixType("receipts"); setFixOpen(true); return; }
    if (fixType === "financial_setup") { setConnectDefaultTab("bank"); setConnectOpen(true); return; }

    // AML / Risk
    if (fixType === "alerts_review") { setFixType("alerts_review"); setFixOpen(true); return; }
    if (fixType === "aml_review") { setFixType("alerts_review"); setFixOpen(true); return; }

    // Documents
    if (fixType === "documents_upload") { setFixType("documents_upload"); setFixOpen(true); return; }
    if (fixType === "documents_check") { setFixType("documents_check"); setFixOpen(true); return; }

    // Operating History / Behaviour
    if (fixType === "activity_check") { setFixType("activity_check"); setFixOpen(true); return; }
    if (fixType === "alerts") { setFixType("alerts"); setFixOpen(true); return; }
    if (fixType === "record_updates") { setFixType("record_updates"); setFixOpen(true); return; }

    // Fallback: section-based actions for footer button
    switch (sectionKey) {
      case "identity":     setKycOpen(true);                                             break;
      case "registration": setFixType("name_match");   setFixOpen(true);                 break;
      case "tax":          setConnectDefaultTab("tax"); setConnectOpen(true);            break;
      case "financial":    setConnectDefaultTab("bank"); setConnectOpen(true);           break;
      case "risk":         setFixType("alerts_review"); setFixOpen(true);                break;
      case "documents":    setUploadDocType("");        setUploadOpen(true);             break;
      case "behaviour":    setFixType("alerts");        setFixOpen(true);                break;
    }
  };

  const handleKYCSubmit = async (_data: KYCData) => {
    await new Promise((res) => setTimeout(res, 1500));
    // Modal stays open - user clicks close/back button to dismiss
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

  const handleDownload = () => {
    setPassportOpen(true);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto">

        <PageHeader
          badge="Compliance"
          title="Compliance Centre"
          description="Your AccuBridge readiness score — built from verified identity, registration, tax, financials, and risk"
        />

        {/* Top banner — score + 3 buttons */}
        <TopBanner
          score={totalScore}
          lastUpdated="2026-04-06T08:00:00Z"
          manualReviewRequired={manualReviewRequired}
          onDownload={handleDownload}
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
                onAction={(fixType) => handleSectionAction(key, fixType)}
              />
            ))}
          </div>
        </div>

        {/* Action queue */}
        <div id="action-queue" className="mb-8">
          <ActionQueue
            items={MOCK_ACTIONS}
            onAction={handleAction}
          />
        </div>

        {/* Sheets */}
        <KYCSheet
          isOpen={kycOpen}
          onClose={() => setKycOpen(false)}
          existingData={undefined}
          onSubmit={handleKYCSubmit}
        />

        <PassportSheet
          isOpen={passportOpen}
          onClose={() => setPassportOpen(false)}
          passport={passport}
          companyName="Apex Solutions Ltd"
          onGenerate={handleGeneratePassport}
          onDownload={() => {}}
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
        />

        <FixActionSheet
          isOpen={fixOpen}
          onClose={() => setFixOpen(false)}
          fixType={fixType}
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
