"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Ticket } from "lucide-react";
import { useVerifyPaymentQuery } from "@/lib/api/paymentApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

export default function RafflePaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";

  const [countdown, setCountdown] = useState(5);

  const { data, isLoading, isError } = useVerifyPaymentQuery(reference, {
    skip: !reference,
  });

  const success = data?.status === "success";

  useEffect(() => {
    if (isLoading) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.replace("/client/funding/raffle");
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
        {isLoading || !reference ? (
          <>
            <Loader2 size={40} className="animate-spin" style={{ color: BRAND.gold }} />
            <div>
              <h2 className="font-bold text-lg">Confirming Your Entry</h2>
              <p className="text-sm mt-1" style={{ color: BRAND.muted }}>Verifying your raffle payment…</p>
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
              <h2 className="font-bold text-lg">Payment Not Confirmed</h2>
              <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
                We could not verify your payment. Please contact support if you were charged.
              </p>
            </div>
            <p className="text-xs" style={{ color: BRAND.muted }}>Redirecting in {countdown}s…</p>
          </>
        ) : (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${BRAND.gold}18` }}
            >
              <Ticket size={32} style={{ color: BRAND.gold }} />
            </div>
            <div>
              <h2 className="font-bold text-lg">You're In the Draw!</h2>
              <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
                Your raffle entry has been confirmed. Good luck in the next quarterly draw!
              </p>
              {data?.reference && (
                <p className="text-xs mt-1 font-mono" style={{ color: BRAND.muted }}>Ref: {data.reference}</p>
              )}
            </div>
            <p className="text-xs" style={{ color: BRAND.muted }}>Redirecting in {countdown}s…</p>
          </>
        )}
      </div>
    </div>
  );
}
