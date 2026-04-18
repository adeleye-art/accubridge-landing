"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useGetPaymentIntentQuery } from "@/lib/api/stripePaymentApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

export default function ComplianceStripeReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentId = searchParams.get("payment_intent") ?? "";

  const [countdown, setCountdown] = useState(5);

  const { data, isLoading, isError } = useGetPaymentIntentQuery(intentId, {
    skip: !intentId,
  });

  const success = data?.status === "succeeded";

  useEffect(() => {
    if (isLoading) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.replace("/client/compliance");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div
        className="w-full max-w-sm rounded-2xl border p-8 flex flex-col items-center gap-5 text-center"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
      >
        {isLoading || !intentId ? (
          <>
            <Loader2 size={40} className="animate-spin" style={{ color: BRAND.gold }} />
            <div>
              <h2 className="font-bold text-lg">Verifying Payment</h2>
              <p className="text-sm mt-1" style={{ color: BRAND.muted }}>Confirming your Stripe payment…</p>
            </div>
          </>
        ) : isError || !success ? (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
            >
              <XCircle size={32} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Payment Incomplete</h2>
              <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
                {data?.status
                  ? `Payment status: ${data.status}. Please try again or contact support.`
                  : "We could not confirm your payment. Please contact support if you were charged."}
              </p>
            </div>
            <p className="text-xs" style={{ color: BRAND.muted }}>Redirecting in {countdown}s…</p>
          </>
        ) : (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${BRAND.green}18` }}
            >
              <CheckCircle2 size={32} style={{ color: BRAND.green }} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Payment Successful</h2>
              <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
                Your compliance passport is being generated.
              </p>
            </div>
            <p className="text-xs" style={{ color: BRAND.muted }}>Redirecting in {countdown}s…</p>
          </>
        )}
      </div>
    </div>
  );
}
