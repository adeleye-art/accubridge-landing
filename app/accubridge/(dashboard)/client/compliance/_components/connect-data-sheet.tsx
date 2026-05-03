"use client";

import React, { useState, useEffect } from "react";
import { SystemSheet } from "@/components/accubridge/shared/system-sheet";
import { Link2, CheckCircle2, Loader2, Building, Calculator, ExternalLink } from "lucide-react";
import { useConnectBankMutation, useConnectTaxMutation, FinancialRecordStatus } from "@/lib/accubridge/api/complianceCentreApi";
import { useLazyGetHmrcAuthorizeUrlQuery } from "@/lib/accubridge/api/hmrcApi";
import { useToast } from "@/components/accubridge/shared/toast";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

type TabKey = "bank" | "tax";

const BANK_PROVIDERS = [
  { id: "truelayer", name: "TrueLayer", provider: "TrueLayer", jurisdiction: "GB", desc: "Connect UK bank accounts — Barclays, HSBC, Lloyds, NatWest, Monzo, and 60+ banks", flag: "🇬🇧", color: BRAND.accent },
  { id: "mono",      name: "Mono",      provider: "Mono",       jurisdiction: "NG", desc: "Connect Nigerian bank accounts — GTBank, Access, Zenith, First Bank, and 30+ institutions", flag: "🇳🇬", color: BRAND.green },
];

const TAX_PROVIDERS = [
  { id: "hmrc", name: "HMRC VAT API",   provider: "HMRC", jurisdiction: "GB", desc: "Sync VAT obligations, returns, liabilities, and filing calendar for UK businesses", flag: "🇬🇧", color: BRAND.accent },
  { id: "firs", name: "FIRS (Nigeria)", provider: "FIRS", jurisdiction: "NG", desc: "Connect Nigerian tax filings and obligations via FIRS integration", flag: "🇳🇬", color: BRAND.green },
];

interface ConnectDataSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TabKey;
  financialStatus?: FinancialRecordStatus;
}

export function ConnectDataSheet({ isOpen, onClose, defaultTab = "bank", financialStatus }: ConnectDataSheetProps) {
  const [tab, setTab]             = useState<TabKey>(defaultTab);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected]   = useState<string[]>([]);
  // VAT number for HMRC/FIRS tax connections (optional)
  const [vatNumber, setVatNumber] = useState("");

  // Seed connected state from real API status whenever the sheet opens
  useEffect(() => {
    if (!isOpen || !financialStatus) return;
    const initial: string[] = [];
    if (financialStatus.isBankConnected) {
      const p = financialStatus.bankProvider?.toLowerCase();
      if (p === "truelayer") initial.push("truelayer");
      else if (p === "mono")  initial.push("mono");
    }
    if (financialStatus.isTaxConnected) {
      const p = financialStatus.taxProvider?.toUpperCase();
      if (p === "HMRC") initial.push("hmrc");
      else if (p === "FIRS") initial.push("firs");
    }
    setConnected(initial);
  }, [isOpen, financialStatus]);

  const { toast } = useToast();
  const [connectBank] = useConnectBankMutation();
  const [connectTax]  = useConnectTaxMutation();
  const [triggerGetHmrcAuthorizeUrl] = useLazyGetHmrcAuthorizeUrlQuery();

  const handleConnect = async (id: string) => {
    const bankProvider = BANK_PROVIDERS.find((p) => p.id === id);
    const taxProvider  = TAX_PROVIDERS.find((p) => p.id === id);
    const providerInfo = bankProvider ?? taxProvider;
    if (!providerInfo) return;

    setConnecting(id);
    try {
      if (tab === "bank" && bankProvider) {
        await connectBank({ provider: bankProvider.provider, jurisdiction: bankProvider.jurisdiction }).unwrap();
        setConnected((prev) => [...prev, id]);
        toast({ title: `${providerInfo.name} connected successfully`, variant: "success" });
      } else if (tab === "tax" && taxProvider) {
        if (taxProvider.provider === "HMRC") {
          // Real HMRC OAuth redirect
          const state = btoa(JSON.stringify({
            redirectTo: "/hmrc/callback",
            vatNumber: vatNumber.trim() || null,
            nonce: Math.random().toString(36).slice(2),
          }));
          const { authorizationUrl } = await triggerGetHmrcAuthorizeUrl(state).unwrap();
          window.location.href = authorizationUrl;
          // Navigating away — don't update state
          return;
        } else {
          // FIRS: direct POST
          await connectTax({
            provider: taxProvider.provider,
            jurisdiction: taxProvider.jurisdiction,
            vatNumber: vatNumber.trim() || undefined,
          }).unwrap();
          setConnected((prev) => [...prev, id]);
          toast({ title: `${providerInfo.name} connected successfully`, variant: "success" });
        }
      }
    } catch {
      toast({ title: `Failed to connect ${providerInfo.name}`, variant: "error" });
    } finally {
      setConnecting(null);
    }
  };

  const providers = tab === "bank" ? BANK_PROVIDERS : TAX_PROVIDERS;

  return (
    <SystemSheet
      open={isOpen}
      onClose={onClose}
      title="Connect Data Source"
      description="Link your bank or tax account to improve your compliance score"
      width={520}
    >
      <button
        type="button"
        onClick={onClose}
        className="mb-4 text-sm font-semibold flex items-center gap-1.5 transition-colors"
        style={{ color: BRAND.accent }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        ← Back to Summary
      </button>
      <div className="flex flex-col gap-5">
        {/* Tab switcher */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          {(["bank", "tax"] as TabKey[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
                color: tab === t ? "#fff" : BRAND.muted,
              }}
            >
              {t === "bank" ? <Building size={14} /> : <Calculator size={14} />}
              {t === "bank" ? "Bank Account" : "Tax / VAT"}
            </button>
          ))}
        </div>

        {/* Info banner */}
        <div
          className="rounded-xl border p-4 text-xs leading-relaxed"
          style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20`, color: "rgba(255,255,255,0.55)" }}
        >
          {tab === "bank"
            ? "🔒 Bank connections use read-only access via Open Banking. AccuBridge cannot make payments or transfers. Connection is revocable at any time."
            : "🔒 Tax connections use OAuth authorisation. AccuBridge reads obligation data only — no filing or payment actions are taken on your behalf."}
        </div>

        {/* VAT number input — shown only on Tax tab */}
        {tab === "tax" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>
              VAT Number <span style={{ color: BRAND.muted, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. GB123456789"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              className="w-full h-10 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 placeholder-[#6B7280]"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(62,146,204,0.6)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
          </div>
        )}

        {/* Provider cards */}
        <div className="flex flex-col gap-3">
          {providers.map((p) => {
            const isConnecting = connecting === p.id;
            const isConnected = connected.includes(p.id);

            return (
              <div
                key={p.id}
                className="rounded-xl border p-5 flex items-center gap-4"
                style={{
                  backgroundColor: isConnected ? `${BRAND.green}08` : "rgba(255,255,255,0.04)",
                  borderColor: isConnected ? `${BRAND.green}30` : "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: isConnected ? `${BRAND.green}15` : `${p.color}12` }}
                >
                  {p.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{p.name}</span>
                    {isConnected && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green, borderColor: `${BRAND.green}25` }}
                      >
                        Connected
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{p.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => !isConnected && handleConnect(p.id)}
                  disabled={isConnecting || isConnected}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-bold flex-shrink-0 transition-all duration-200 disabled:opacity-60"
                  style={{
                    backgroundColor: isConnected ? `${BRAND.green}15` : p.color,
                    color: isConnected ? BRAND.green : "#fff",
                  }}
                  onMouseEnter={(e) => { if (!isConnected && !isConnecting) e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  {isConnecting
                    ? <><Loader2 size={12} className="animate-spin" />Connecting…</>
                    : isConnected
                    ? <><CheckCircle2 size={12} />Connected</>
                    : <><ExternalLink size={12} />Connect</>}
                </button>
              </div>
            );
          })}
        </div>

        {/* What gets synced */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-2"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.muted }}>
            {tab === "bank" ? "What gets synced" : "What gets retrieved"}
          </div>
          <div className="flex flex-col gap-1.5">
            {(tab === "bank"
              ? ["Account and balance data", "Transaction history (last 12 months)", "Regular payment patterns", "Cash flow indicators"]
              : ["VAT obligations and deadlines", "Open and overdue return status", "Filing frequency and calendar", "VAT customer information"]
            ).map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Link2 size={11} style={{ color: BRAND.accent, flexShrink: 0 }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SystemSheet>
  );
}
