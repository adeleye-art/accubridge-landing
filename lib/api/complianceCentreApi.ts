import { baseApi } from "./baseApi";

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface ComplianceSectionBreakdown {
  category: string;
  icon: string;        // "kyc" | "kyb" | "tax" | "bank" | "aml" | "docs" | "history"
  score?: number;      // absent when status is "Not Started"
  maxScore: number;
  status: string;      // "UnderReview" | "Not Started" | "Active" | "Verified" | "InProgress"
  actionLabel: string;
  actionRoute: string;
}

export interface ComplianceCentreDashboard {
  maxScore: number;
  scoreStatus: string;
  lastUpdated: string;
  criticalIssues: string[];
  resolvedIssues: string[];
  scoreBreakdown: ComplianceSectionBreakdown[];
  tasks: ComplianceCentreTask[];
}

export interface ComplianceCentreTask {
  id: number;
  title: string;
  description: string;
  priority: string;   // "High" | "Medium" | "Low"
  category: string;   // "Financial" | "KYC" | "KYB" | "Documents" | "AML"
  status: string;     // "NotStarted" | "InProgress" | "Completed"
}

export interface ComplianceCentreAlert {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;     // "Open" | "Resolved"
  createdAt: string;
}

// ─── Evaluate ─────────────────────────────────────────────────────────────────

export interface EvaluateRuleResult {
  ruleName: string;
  passed: boolean;
  score: number;
  maxScore: number;
  message: string;
}

export interface FundingEligibility {
  isEligible: boolean;
  reasons: string[];
  complianceScore: {
    currentScore: number;
    requiredScore: number;
    meetsRequirement: boolean;
  };
  monthsActive: {
    currentMonths: number;
    requiredMonths: number;
    meetsRequirement: boolean;
  };
}

export interface EvaluateResponse {
  overallScore: number;
  maxScore: number;
  scoreStatus: string;
  lastEvaluated: string;
  categorisationCompleteness: EvaluateRuleResult;
  reconciliationRecency: EvaluateRuleResult;
  identityVerification: EvaluateRuleResult;
  registrationLegal: EvaluateRuleResult;
  amlCheck: EvaluateRuleResult;
  fundingEligibility: FundingEligibility;
}

// ─── KYC ──────────────────────────────────────────────────────────────────────

export interface KycStatus {
  status: string;
  fullName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  phoneNumber: string | null;
  email: string | null;
  residentialAddress: string | null;
  idType: string | null;
  idNumber: string | null;
  idExpiryDate: string | null;
  idDocumentUrl: string | null;
}

export interface SubmitKycInput {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  email: string;
  residentialAddress: string;
  idType: string;
  idNumber: string;
  idExpiryDate: string;
  idDocumentUrl: string;
}

export interface SubmitKycMultiEntryInput {
  personalInformationJson: string;  // JSON-stringified array of personal info objects
  governmentIssuedIdsJson: string;  // JSON-stringified array of ID objects
}

// ─── KYB ──────────────────────────────────────────────────────────────────────

export interface KybStatus {
  status: string;
  jurisdiction: string | null;
  companiesHouseNumber: string | null;
  submittedLegalName: string | null;
  officialLegalName: string | null;
  hasLegalNameMismatch: boolean;
  certificateOfIncorporationUrl: string | null;
}

export interface SubmitKybInput {
  jurisdiction: string;
  companiesHouseNumber: string;
  submittedLegalName: string;
  directorsJson: string;
  certificateOfIncorporationUrl: string;
}

export interface SubmitKybMultiEntryInput {
  jurisdiction: string;
  companiesHouseNumber: string;
  submittedLegalName: string;
  authorizedDirectorsJson: string;  // JSON-stringified array of director objects
  certificateOfIncorporationUrl: string;
}

export interface FixLegalNameInput {
  correctedBusinessName: string;
}

// ─── Financial ────────────────────────────────────────────────────────────────

export interface FinancialRecordStatus {
  isBankConnected: boolean;
  bankProvider: string | null;
  bankJurisdiction: string | null;
  bankConnectedAt: string | null;
  bankSyncActive: boolean;
  isTaxConnected: boolean;
  taxProvider: string | null;
  taxJurisdiction: string | null;
  taxConnectedAt: string | null;
  taxSyncActive: boolean;
}

export interface ConnectBankInput {
  provider: string;    // "TrueLayer" | "Mono"
  jurisdiction: string; // "GB" | "NG"
}

export interface ConnectTaxInput {
  provider: string;      // "HMRC" | "FIRS"
  jurisdiction: string;  // "GB" | "NG"
  vatNumber?: string;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface ComplianceDocument {
  id: number;
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  status: string;   // "Pending" | "Verified" | "Rejected"
  uploadedAt: string;
  verifiedAt: string | null;
}

export interface DocumentsResponse {
  documents: ComplianceDocument[];
}

export interface UploadDocumentInput {
  documentType: string;
  fileUrl?: string;
  file?: File;
  fileName?: string;
  fileSizeBytes?: number;
  notes?: string;
}

// ─── AML ──────────────────────────────────────────────────────────────────────

export interface AmlReport {
  amlScreeningStatus: string;
  sanctionsScreeningStatus: string;
  pepCheckStatus: string;
  hasPepFlags: boolean;
  adverseMediaStatus: string;
  ongoingMonitoringActive: boolean;
  monitoringIntervalDays: number;
  lastScannedAt: string | null;
  nextScanAt: string | null;
  isReportReviewed: boolean;
}

// ─── Alerts & History ─────────────────────────────────────────────────────────

export interface AlertsResponse {
  alerts: ComplianceCentreAlert[];
}

export interface OperatingHistoryItem {
  id: number;
  title: string;
  description: string;
  occurredAt: string;
  isPenalty: boolean;
}

export interface OperatingHistoryResponse {
  history: OperatingHistoryItem[];
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const complianceCentreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getComplianceCentreDashboard: builder.query<ComplianceCentreDashboard, void>({
      query: () => "/compliancecentre",
      transformResponse: (res: { success: boolean; data: ComplianceCentreDashboard } | ComplianceCentreDashboard) =>
        "data" in res && res.data ? res.data : (res as ComplianceCentreDashboard),
      providesTags: ["ComplianceCentre"],
    }),

    // Evaluate compliance (real scoring engine)
    evaluateCompliance: builder.query<EvaluateResponse, void>({
      query: () => "/compliancecentre/evaluate",
      transformResponse: (res: { success: boolean; data: EvaluateResponse } | EvaluateResponse) =>
        "data" in res && res.data ? res.data : (res as EvaluateResponse),
      providesTags: ["ComplianceCentre"],
    }),

    // KYC status
    getKycStatus: builder.query<KycStatus, void>({
      query: () => "/compliancecentre/kyc",
      transformResponse: (res: { success: boolean; data: KycStatus } | KycStatus) =>
        "data" in res && res.data ? res.data : (res as KycStatus),
      providesTags: ["ComplianceCentre"],
    }),

    // Submit KYC (single entry)
    submitKyc: builder.mutation<{ message: string }, SubmitKycInput>({
      query: (body) => ({ url: "/compliancecentre/kyc", method: "POST", body }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Submit KYC (multi-entry)
    submitKycMultiEntry: builder.mutation<{ message: string }, SubmitKycMultiEntryInput>({
      query: (body) => ({ url: "/compliancecentre/kyc/multi-entry", method: "POST", body }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // KYB status
    getKybStatus: builder.query<KybStatus, void>({
      query: () => "/compliancecentre/kyb",
      transformResponse: (res: { success: boolean; data: KybStatus } | KybStatus) =>
        "data" in res && res.data ? res.data : (res as KybStatus),
      providesTags: ["ComplianceCentre"],
    }),

    // Submit KYB (single entry)
    submitKyb: builder.mutation<{ message: string }, SubmitKybInput>({
      query: (body) => ({ url: "/compliancecentre/kyb", method: "POST", body }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Submit KYB (multi-entry — multiple directors)
    submitKybMultiEntry: builder.mutation<{ message: string }, SubmitKybMultiEntryInput>({
      query: (body) => ({ url: "/compliancecentre/kyb/multi-entry", method: "POST", body }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Fix legal name mismatch
    fixLegalName: builder.mutation<{ message: string }, FixLegalNameInput>({
      query: (body) => ({ url: "/compliancecentre/kyb/legal-name", method: "PUT", body }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Financial record status
    getFinancialStatus: builder.query<FinancialRecordStatus, void>({
      query: () => "/compliancecentre/financial",
      transformResponse: (res: { success: boolean; data: FinancialRecordStatus } | FinancialRecordStatus) =>
        "data" in res && res.data ? res.data : (res as FinancialRecordStatus),
      providesTags: ["ComplianceCentre"],
    }),

    // Connect bank account
    connectBank: builder.mutation<{ message: string }, ConnectBankInput>({
      query: (body) => ({ url: "/compliancecentre/financial/bank/connect", method: "POST", body }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Connect tax / VAT provider
    connectTax: builder.mutation<{ message: string }, ConnectTaxInput>({
      query: (body) => ({ url: "/compliancecentre/financial/tax/connect", method: "POST", body }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Get compliance documents
    getComplianceDocuments: builder.query<DocumentsResponse, void>({
      query: () => "/compliancecentre/documents",
      transformResponse: (res: { success: boolean; data: DocumentsResponse } | DocumentsResponse) =>
        "data" in res && res.data ? res.data : (res as DocumentsResponse),
      providesTags: ["ComplianceCentre"],
    }),

    // Upload compliance document
    uploadComplianceDocument: builder.mutation<{ message: string }, UploadDocumentInput>({
      query: (data) => {
        const formData = new FormData();
        formData.append("DocumentType", data.documentType);
        if (data.fileUrl) formData.append("FileUrl", data.fileUrl);
        if (data.file) formData.append("File", data.file);
        if (data.fileName) formData.append("FileName", data.fileName);
        if (data.fileSizeBytes !== undefined) formData.append("FileSizeBytes", String(data.fileSizeBytes));
        if (data.notes) formData.append("Notes", data.notes);
        return { url: "/compliancecentre/documents", method: "POST", body: formData };
      },
      invalidatesTags: ["ComplianceCentre"],
    }),

    // AML / risk report
    getAmlReport: builder.query<AmlReport, void>({
      query: () => "/compliancecentre/aml",
      transformResponse: (res: { success: boolean; data: AmlReport } | AmlReport) =>
        "data" in res && res.data ? res.data : (res as AmlReport),
      providesTags: ["ComplianceCentre"],
    }),

    // Mark AML report as reviewed
    reviewAml: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/compliancecentre/aml/review", method: "POST", body: { isReviewed: true } }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Get open compliance alerts
    getComplianceAlerts: builder.query<AlertsResponse, void>({
      query: () => "/compliancecentre/alerts",
      transformResponse: (res: { success: boolean; data: AlertsResponse } | AlertsResponse) =>
        "data" in res && res.data ? res.data : (res as AlertsResponse),
      providesTags: ["ComplianceCentre"],
    }),

    // Resolve a single alert
    resolveAlert: builder.mutation<{ message: string }, number>({
      query: (alertId) => ({ url: `/compliancecentre/alerts/${alertId}/resolve`, method: "POST", body: { alertId } }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Resolve all open alerts
    resolveAllAlerts: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/compliancecentre/alerts/resolve-all", method: "POST" }),
      invalidatesTags: ["ComplianceCentre"],
    }),

    // Operating history
    getOperatingHistory: builder.query<OperatingHistoryResponse, void>({
      query: () => "/compliancecentre/operating-history",
      transformResponse: (res: { success: boolean; data: OperatingHistoryResponse } | OperatingHistoryResponse) =>
        "data" in res && res.data ? res.data : (res as OperatingHistoryResponse),
      providesTags: ["ComplianceCentre"],
    }),
  }),
});

export const {
  useGetComplianceCentreDashboardQuery,
  useEvaluateComplianceQuery,
  useGetKycStatusQuery,
  useSubmitKycMutation,
  useSubmitKycMultiEntryMutation,
  useGetKybStatusQuery,
  useSubmitKybMutation,
  useSubmitKybMultiEntryMutation,
  useFixLegalNameMutation,
  useGetFinancialStatusQuery,
  useConnectBankMutation,
  useConnectTaxMutation,
  useGetComplianceDocumentsQuery,
  useUploadComplianceDocumentMutation,
  useGetAmlReportQuery,
  useReviewAmlMutation,
  useGetComplianceAlertsQuery,
  useResolveAlertMutation,
  useResolveAllAlertsMutation,
  useGetOperatingHistoryQuery,
} = complianceCentreApi;
