"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ComplianceScoreCard } from "./_components/compliance-score-card";
import { ComplianceJourney } from "./_components/compliance-journey";
import { ComplianceOverviewGrid } from "./_components/compliance-overview-grid";
import { CompanyDetailsCard } from "./_components/company-details-card";
import { ComplianceFlagsCard } from "./_components/compliance-flags-card";
import { MissingDocumentsCard } from "./_components/missing-documents-card";
import { QuickActionsBar } from "./_components/quick-actions-bar";
import { KYCSheet } from "./_components/kyc-sheet";
import { PassportSheet } from "./_components/passport-sheet";
import { ComplianceProfile, KYCData, CompliancePassport } from "@/types/compliance";
import { calculateComplianceScore } from "@/lib/compliance/calculate-score";

const FRESH_COMPLIANCE: ComplianceProfile = {
  overall_status:  "unverified",
  compliance_score: 0,

  kyc_status:      "not_started",
  company_status:  "not_started",
  risk_calculated: false,
  passport_status: "locked",

  kyc_data:             undefined,
  company_verification: undefined,
  risk_score:           undefined,
  passport:             undefined,

  company_name:      "Your Company",
  industry:          "Unknown",
  business_type:     "Unknown",
  operating_country: "uk",

  missing_documents: [
    {
      id:          "doc1",
      label:       "Certificate of Incorporation",
      description: "Companies House Certificate of Incorporation (UK) or CAC Certificate",
      required:    true,
      category:    "business",
      uploaded:    false,
    },
    {
      id:          "doc2",
      label:       "Proof of Registered Address",
      description: "Utility bill or bank statement dated within the last 3 months",
      required:    true,
      category:    "business",
      uploaded:    false,
    },
    {
      id:          "doc3",
      label:       "VAT Certificate",
      description: "HMRC or FIRS VAT registration certificate",
      required:    false,
      category:    "tax",
      uploaded:    false,
    },
  ],

  last_reviewed: undefined,
  reviewed_by:   undefined,
};

export default function CompliancePage() {
  const router = useRouter();
  const [profile, setProfile]               = useState<ComplianceProfile>(FRESH_COMPLIANCE);
  const [kycOpen, setKycOpen]               = useState(false);
  const [passportOpen, setPassportOpen]     = useState(false);
  const [requestReviewOpen, setRequestReviewOpen] = useState(false);

  const liveScore   = calculateComplianceScore(profile);
  const liveProfile = { ...profile, compliance_score: liveScore };

  const buildRiskScore = () => ({
    score:              42,
    level:              "medium" as const,
    calculated_at:      new Date().toISOString(),
    aml_status:         "clear" as const,
    pep_flag:           false,
    sanctions_flag:     false,
    adverse_media_flag: false,
  });

  const handleKYCSubmit = async (data: KYCData) => {
    await new Promise((res) => setTimeout(res, 2000));
    setProfile((p) => {
      const companyDone = p.company_status === "verified";
      return {
        ...p,
        kyc_status:      "verified",
        kyc_data:        data,
        overall_status:  "in_progress",
        risk_score:      companyDone ? buildRiskScore() : undefined,
        risk_calculated: companyDone,
        passport_status: companyDone ? "not_generated" : "locked",
      };
    });
  };

  const handleVerifyCompany = async () => {
    setProfile((p) => ({ ...p, company_status: "pending" }));
    await new Promise((res) => setTimeout(res, 2000));
    setProfile((p) => {
      const kycDone = p.kyc_status === "verified";
      return {
        ...p,
        company_status: "verified",
        company_verification: {
          business_name:       p.company_name,
          registration_number: "15234789",
          country:             p.operating_country === "nigeria" ? "nigeria" : "uk",
          verified_at:         new Date().toISOString(),
        },
        overall_status:  "in_progress",
        risk_score:      kycDone ? buildRiskScore() : undefined,
        risk_calculated: kycDone,
        passport_status: kycDone ? "not_generated" : "locked",
      };
    });
  };

  const handleGeneratePassport = async (): Promise<CompliancePassport> => {
    await new Promise((res) => setTimeout(res, 1500));
    const passport: CompliancePassport = {
      passport_id:  `GBR${Math.floor(Math.random() * 9000000) + 1000000}A`,
      issued_at:    new Date().toISOString(),
      expires_at:   new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      status:       "generated",
      verification_badges: { identity: true, company: true, tax: true, aml: true },
    };
    setProfile((p) => ({
      ...p,
      passport_status: "generated",
      passport,
      overall_status:  "verified",
    }));
    return passport;
  };

  const handleDocumentUpload = (docId: string, _file: File) => {
    setProfile((p) => ({
      ...p,
      missing_documents: p.missing_documents.map((d) =>
        d.id === docId ? { ...d, uploaded: true } : d
      ),
    }));
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto">

        <PageHeader
          badge="Client Dashboard"
          title="Compliance Passport"
          description="Complete your compliance journey to generate your digital passport and unlock funding access"
        />

        <ComplianceScoreCard
          score={liveScore}
          overallStatus={liveProfile.overall_status}
          reviewedBy={liveProfile.reviewed_by}
          lastReviewed={liveProfile.last_reviewed}
        />

        <ComplianceJourney
          profile={liveProfile}
          onLaunchKYC={() => setKycOpen(true)}
          onVerifyCompany={handleVerifyCompany}
          onGeneratePassport={() => setPassportOpen(true)}
          onViewRiskScore={() => {
            document.getElementById("risk-score-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />

        <ComplianceOverviewGrid profile={liveProfile} />

        <div id="risk-score-section" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <CompanyDetailsCard profile={liveProfile} />
          <ComplianceFlagsCard profile={liveProfile} />
        </div>

        <div className="mb-5">
          <MissingDocumentsCard
            documents={liveProfile.missing_documents}
            onUpload={handleDocumentUpload}
          />
        </div>

        <QuickActionsBar
          profile={liveProfile}
          onLaunchKYC={() => setKycOpen(true)}
          onVerifyCompany={handleVerifyCompany}
          onGeneratePassport={() => setPassportOpen(true)}
          onRequestReview={() => setRequestReviewOpen(true)}
          onApplyFunding={() => router.push("/client/funding")}
        />

        <KYCSheet
          isOpen={kycOpen}
          onClose={() => setKycOpen(false)}
          existingData={liveProfile.kyc_data}
          onSubmit={handleKYCSubmit}
        />

        <PassportSheet
          isOpen={passportOpen}
          onClose={() => setPassportOpen(false)}
          passport={liveProfile.passport}
          companyName={liveProfile.company_name}
          onGenerate={handleGeneratePassport}
          onDownload={() => { /* TODO: trigger PDF download */ }}
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
          description="Your assigned AccuBridge accountant will review your compliance status and update your score. You'll be notified within 1–2 business days."
          confirmLabel="Request Review"
          cancelLabel="Not Now"
        />

      </div>
    </div>
  );
}
