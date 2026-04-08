import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/store-provider";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AccuBridge — World-Class Financial Management for UK & Nigeria SMEs",
  description:
    "AccuBridge automates bookkeeping, compliance monitoring, and financial reporting for SMEs across the UK and Nigeria. FCA Compliant. FIRS Registered. Bank-Grade Security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
