"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useConnectTaxMutation } from "@/lib/accubridge/api/complianceCentreApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC" };

// ─── Inner component that uses useSearchParams ────────────────────────────────
function HmrcCallbackContent() {
  const router    = useRouter();
  const params    = useSearchParams();
  const rawState  = params.get("state") ?? "";

  const [status, setStatus]   = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("");
  const processed = useRef(false);

  const [connectTax] = useConnectTaxMutation();

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const run = async () => {
      // Decode state to recover vatNumber carried through the OAuth round-trip
      let vatNumber: string | null = null;
      try {
        if (rawState) {
          const decoded = JSON.parse(atob(rawState));
          vatNumber = decoded.vatNumber ?? null;
        }
      } catch {
        // Malformed state — proceed without vatNumber
      }

      try {
        // Register the HMRC connection in the compliance system
        await connectTax({
          provider: "HMRC",
          jurisdiction: "GB",
          ...(vatNumber ? { vatNumber } : {}),
        }).unwrap();

        setStatus("success");
        setMessage("HMRC connected. Your VAT obligations will sync shortly.");
        setTimeout(() => router.replace("/accubridge/client/compliance?hmrc=connected"), 2500);
      } catch {
        setStatus("error");
        setMessage("HMRC authorisation received, but we could not complete the connection. Please try again.");
        setTimeout(() => router.replace("/accubridge/client/compliance?hmrc=error"), 3000);
      }
    };

    run();
  }, [rawState, connectTax, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-6"
      style={{ background: "linear-gradient(135deg, #07101f 0%, #0A2463 100%)" }}
    >
      {/* Processing */}
      {status === "processing" && (
        <>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${BRAND.accent}15`, border: `2px solid ${BRAND.accent}30` }}
          >
            <Loader2 size={36} className="animate-spin" style={{ color: BRAND.accent }} />
          </div>
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold text-white mb-2">Completing HMRC Connection</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Finalising your HMRC authorisation. Please wait…
            </p>
          </div>
        </>
      )}

      {/* Success */}
      {status === "success" && (
        <>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${BRAND.green}15`, border: `2px solid ${BRAND.green}30`, boxShadow: `0 0 40px ${BRAND.green}25` }}
          >
            <CheckCircle2 size={40} style={{ color: BRAND.green }} />
          </div>
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold text-white mb-2">HMRC Connected</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{message}</p>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Returning to compliance centre…</span>
          </div>
        </>
      )}

      {/* Error */}
      {status === "error" && (
        <>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)" }}
          >
            <XCircle size={40} style={{ color: "#ef4444" }} />
          </div>
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold text-white mb-2">Connection Failed</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{message}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/accubridge/client/compliance")}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              Back to Compliance
            </button>
            <button
              type="button"
              onClick={() => router.push("/accubridge/client/compliance")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
            >
              Try Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page with Suspense boundary (required for useSearchParams) ────────────────
export default function HmrcCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#07101f" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: BRAND.accent }} />
        </div>
      }
    >
      <HmrcCallbackContent />
    </Suspense>
  );
}
