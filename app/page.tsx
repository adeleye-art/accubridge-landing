import type { Metadata } from "next";
import { LandingContent } from "./landing-content";

export const metadata: Metadata = {
  title: "AccuBridge — World-Class Financial Management for UK & Nigeria SMEs",
  description:
    "AccuBridge automates bookkeeping, compliance monitoring, and financial reporting for SMEs across the UK and Nigeria. FCA Compliant. FIRS Registered. Bank-Grade Security.",
};

export default function Page() {
  return <LandingContent />;
}
