"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerifyPaymentQuery } from "@/lib/api/paymentApi";
import { useCreateFundingApplicationMutation, useSubmitFundingApplicationMutation } from "@/lib/api/fundingApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

// ─── Inner component that uses useSearchParams ────────────────────────────────
function CallbackContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const reference   = params.get("reference") ?? params.get("trxref") ?? "";
  const type        = params.get("type") ?? "";
  const tickets     = params.get("tickets") ?? "5";

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const processed = useRef(false);

  const {
    data: paymentData,
    isLoading,
    isError,
  } = useVerifyPaymentQuery(reference, { skip: !reference });

  const [createFunding] = useCreateFundingApplicationMutation();
  const [submitFunding] = useSubmitFundingApplicationMutation();

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }
  }, [reference]);

  useEffect(() => {
    if (processed.current) return;
    if (isLoading) return;
    if (isError || !paymentData) {
      setStatus("error");
      setMessage("Payment could not be verified. Please contact support.");
      return;
    }

    const run = async () => {
      processed.current = true;

      if (paymentData.status !== "success") {
        setStatus("error");
        setMessage(`Payment was not successful (status: ${paymentData.status}). No charges were applied.`);
        return;
      }

      try {
        if (type === "raffle") {
          const ticketCount = Number(tickets) || 5;
          const app = await createFunding({
            type: 3,
            requestedAmount: ticketCount * 25,
            purpose: `Raffle entry — ${ticketCount} ticket${ticketCount !== 1 ? "s" : ""}`,
          }).unwrap();
          await submitFunding(app.id).unwrap();
          setStatus("success");
          setMessage("Your raffle entry has been confirmed!");
          setTimeout(() => router.push("/client/funding/raffle"), 2500);
        } else if (type === "subscription") {
          document.cookie = "accubridge_onboarding_done=1; path=/; max-age=31536000; SameSite=Lax";
          setStatus("success");
          setMessage("Subscription activated! Taking you to your dashboard…");
          setTimeout(() => router.push("/client/dashboard"), 2500);
        } else {
          setStatus("success");
          setMessage("Payment verified successfully!");
          setTimeout(() => router.push("/client/dashboard"), 2500);
        }
      } catch {
        setStatus("error");
        setMessage("Payment was received but we could not complete your request. Please contact support.");
      }
    };

    run();
  }, [isLoading, isError, paymentData, type, tickets, createFunding, submitFunding, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-6"
      style={{ background: "linear-gradient(135deg, #07101f 0%, #0A2463 100%)" }}
    >
      {/* Verifying */}
      {status === "verifying" && (
        <>
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${BRAND.accent}15`, border: `2px solid ${BRAND.accent}30` }}>
            <Loader2 size={36} className="animate-spin" style={{ color: BRAND.accent }} />
          </div>
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold text-white mb-2">Verifying Payment</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              Please wait while we confirm your payment with the payment provider…
            </p>
          </div>
        </>
      )}

      {/* Success */}
      {status === "success" && (
        <>
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${BRAND.green}15`, border: `2px solid ${BRAND.green}30`, boxShadow: `0 0 40px ${BRAND.green}25` }}>
            <CheckCircle2 size={40} style={{ color: BRAND.green }} />
          </div>
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold text-white mb-2">Payment Confirmed</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{message}</p>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Redirecting…</span>
          </div>
        </>
      )}

      {/* Error */}
      {status === "error" && (
        <>
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)" }}>
            <XCircle size={40} style={{ color: "#ef4444" }} />
          </div>
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{message}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={() => router.push("/client/dashboard")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
            >
              Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page with Suspense boundary (required for useSearchParams) ────────────────
export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#07101f" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: BRAND.accent }} />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
