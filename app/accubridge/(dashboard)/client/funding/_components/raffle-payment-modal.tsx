"use client";

import React, { useState, useEffect } from "react";
import { useInitializePaymentMutation } from "@/lib/accubridge/api/paymentApi";
import { useCreatePaymentIntentMutation } from "@/lib/accubridge/api/stripePaymentApi";
import { useToast } from "@/components/accubridge/shared/toast";
import { Loader2, AlertCircle, Check, X } from "lucide-react";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

export type RafflePaymentStatus = "idle" | "selecting" | "processing" | "success" | "error";

interface RafflePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketCount: number;
  priceGBP: number;  // Price per ticket in GBP
  priceNGN: number;  // Price per ticket in NGN
  onPaymentSuccess: (reference: string, jurisdiction: "GB" | "NG") => void;
  userEmail: string;
  userId?: number;
}

export function RafflePaymentModal({
  isOpen,
  onClose,
  ticketCount,
  priceGBP,
  priceNGN,
  onPaymentSuccess,
  userEmail,
  userId,
}: RafflePaymentModalProps) {
  const [jurisdiction, setJurisdiction] = useState<"GB" | "NG" | null>(null);
  const [status, setStatus] = useState<RafflePaymentStatus>("idle");
  const [initializePayment] = useInitializePaymentMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const { toast } = useToast();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const totalGBP = Math.floor(priceGBP * ticketCount * 100) / 100;
  const totalNGN = priceNGN * ticketCount;

  const handlePaymentInitiation = async () => {
    if (!jurisdiction) {
      toast({ title: "Please select your jurisdiction", variant: "error" });
      return;
    }

    setStatus("processing");
    try {
      const reference = `RAFFLE-${userId || "guest"}-${ticketCount}-${Date.now()}`;
      const currentUrl = typeof window !== "undefined" ? window.location.origin : "";

      if (jurisdiction === "NG") {
        // Nigeria - Paystack
        const response = await initializePayment({
          amount: Math.floor(totalNGN * 100), // Paystack uses smallest currency unit
          email: userEmail,
          currency: "NGN",
          paymentType: "raffle",
          callbackUrl: `${currentUrl}/funding/payment/callback`,
          metadata: JSON.stringify({
            userId,
            type: "raffle",
            ticketCount,
            jurisdiction: "NG",
          }),
        }).unwrap();

        // Redirect to Paystack
        if (response.authorizationUrl) {
          onPaymentSuccess(reference, jurisdiction);
          setTimeout(() => {
            window.location.href = response.authorizationUrl;
          }, 500);
        }
      } else {
        // UK - Stripe
        const response = await createPaymentIntent({
          amount: Math.floor(totalGBP * 100),
          currency: "GBP",
          reference,
          paymentType: "raffle",
          email: userEmail,
          description: `Raffle Ticket Purchase - ${ticketCount} ticket${ticketCount > 1 ? "s" : ""}`,
          returnUrl: `${currentUrl}/funding/raffle`,
          metadata: {
            userId: userId?.toString() || "guest",
            type: "raffle",
            ticketCount: ticketCount.toString(),
            jurisdiction: "GB",
          },
        }).unwrap();

        // Success for Stripe
        onPaymentSuccess(reference, jurisdiction);
        setStatus("success");
        toast({
          title: "Payment intent created successfully",
          description: "You'll be redirected to Stripe to complete payment",
          variant: "success",
        });
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error) {
      setStatus("error");
      toast({
        title: "Payment initialization failed",
        description: "Please try again or contact support",
        variant: "error",
      });
      console.error("Payment error:", error);
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setJurisdiction(null);
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = status === "processing";
  const width = 480;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: `min(${width}px, 100vw)`,
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg, #0e1e40 0%, #0d0d0d 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.25, 1.1, 0.4, 1)",
          boxShadow: "-16px 0 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            padding: "24px 24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "17px", margin: 0 }}>
              {status === "success" ? "Payment Initiated" : "Complete Your Purchase"}
            </h2>
            <p style={{ color: "#6B7280", fontSize: "13px", marginTop: "4px" }}>
              {status === "success" ? "You'll be redirected shortly" : `${ticketCount} ticket${ticketCount > 1 ? "s" : ""} · Select your jurisdiction`}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              padding: "6px",
              flexShrink: 0,
              lineHeight: 1,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {status === "success" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: `${BRAND.green}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: BRAND.green,
                }}
              >
                <Check size={28} />
              </div>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.7)" }}>Payment successful! Confirming your raffle entry...</p>
            </div>
          ) : (
            <>
              {/* Jurisdiction selector */}
              <div style={{ display: "flex", gap: "12px" }}>
                {[
                  { code: "GB", name: "United Kingdom", price: totalGBP, currency: "£", gateway: "Stripe" },
                  { code: "NG", name: "Nigeria", price: totalNGN, currency: "₦", gateway: "Paystack" },
                ].map((option) => (
                  <button
                    key={option.code}
                    onClick={() => !isLoading && setJurisdiction(option.code as "GB" | "NG")}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "16px",
                      borderRadius: "12px",
                      border: `2px solid ${jurisdiction === option.code ? BRAND.gold : "rgba(255,255,255,0.1)"}`,
                      backgroundColor: jurisdiction === option.code ? `${BRAND.gold}15` : "transparent",
                      color: "white",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      opacity: isLoading && jurisdiction !== option.code ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading && jurisdiction !== option.code) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = jurisdiction === option.code ? `${BRAND.gold}15` : "transparent";
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>{option.name}</div>
                    <div style={{ color: BRAND.gold, fontSize: "18px", fontWeight: "700" }}>
                      {option.currency}{option.price.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>for {ticketCount} ticket{ticketCount > 1 ? "s" : ""}</div>
                  </button>
                ))}
              </div>

              {/* Info box */}
              <div
                style={{
                  backgroundColor: `${BRAND.accent}10`,
                  borderRadius: "10px",
                  border: `1px solid ${BRAND.accent}25`,
                  padding: "12px",
                  display: "flex",
                  gap: "10px",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                <AlertCircle size={16} style={{ color: BRAND.accent, flexShrink: 0, marginTop: "2px" }} />
                <span>Entry is non-refundable. Next quarterly draw is 30 June 2026 with a £5,000 prize pool.</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {status !== "success" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "20px 24px 24px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handlePaymentInitiation}
              disabled={!jurisdiction || isLoading}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
                backgroundColor: BRAND.gold,
                color: BRAND.primary,
                border: "none",
                cursor: !jurisdiction || isLoading ? "not-allowed" : "pointer",
                opacity: !jurisdiction || isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (jurisdiction && !isLoading) {
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                  Processing...
                </>
              ) : (
                <>
                  <Check size={15} />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
