"use client";

import { BackgroundPaths } from "@/components/ui/background-paths";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import {
  TestimonialsColumn,
  firstColumn,
  secondColumn,
  thirdColumn,
} from "@/components/ui/testimonials-columns-1";
import { CreativePricing } from "@/components/ui/creative-pricing";
import type { PricingTier } from "@/components/ui/creative-pricing";
import { FlowButton } from "@/components/ui/flow-button";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";
import {
  BookOpen,
  ShieldCheck,
  BarChart3,
  Landmark,
  Building2,
  Lightbulb,
  Pencil,
  Star,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const featuresData = [
  {
    id: 1,
    title: "Automated Bookkeeping",
    date: "Core",
    content:
      "Log and categorise transactions automatically. Reconcile bank statements and eliminate manual data entry with intelligent automation.",
    category: "Finance",
    icon: BookOpen,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "Compliance Monitoring",
    date: "Core",
    content:
      "Stay audit-ready with a dynamic compliance score, tax filing tracking, and a downloadable Compliance Passport for UK and Nigerian regulations.",
    category: "Compliance",
    icon: ShieldCheck,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Financial Reporting",
    date: "Core",
    content:
      "Auto-generate Profit & Loss, Balance Sheets, and Cash Flow Statements. Download polished PDF reports reviewed by qualified accountants.",
    category: "Reports",
    icon: BarChart3,
    relatedIds: [1, 4],
    status: "completed" as const,
    energy: 88,
  },
  {
    id: 4,
    title: "Funding Opportunities",
    date: "Growth",
    content:
      "Access Raffle Funding, Compliance-Based Grants, and Investor Pitch reviews — all within the platform to help scale your business.",
    category: "Funding",
    icon: Landmark,
    relatedIds: [2, 5],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 5,
    title: "Business Registration",
    date: "Setup",
    content:
      "Register your business with Companies House (UK) or CAC (Nigeria) directly through the platform with guided steps and progress tracking.",
    category: "Registration",
    icon: Building2,
    relatedIds: [1, 6],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 6,
    title: "AI Business Ideas",
    date: "AI",
    content:
      "Use our AI-powered generator to discover tailored business ideas based on your skills, experience, location, and available capital.",
    category: "AI Tools",
    icon: Lightbulb,
    relatedIds: [5],
    status: "in-progress" as const,
    energy: 70,
  },
];

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    icon: <Pencil className="w-6 h-6" />,
    price: 29,
    description: "Perfect for sole traders and early-stage startups.",
    color: "amber",
    features: [
      "Up to 50 transactions/month",
      "Basic bookkeeping & categorisation",
      "Compliance score monitoring",
      "Financial report downloads",
      "Funding applications",
    ],
  },
  {
    name: "Standard",
    icon: <Star className="w-6 h-6" />,
    price: 69,
    description: "Ideal for growing SMEs needing full financial management.",
    color: "blue",
    popular: true,
    features: [
      "Unlimited transactions",
      "Full bookkeeping & bank reconciliation",
      "Auto-generated financial reports (PDF)",
      "Compliance Passport download",
      "Raffle & Compliance-Based Funding",
    ],
  },
  {
    name: "Premium",
    icon: <Sparkles className="w-6 h-6" />,
    price: 129,
    description: "For established businesses needing full-service operations.",
    color: "purple",
    features: [
      "Everything in Standard",
      "Dedicated accountant assignment",
      "Investor Pitch Funding access",
      "Priority compliance reviews",
      "Multi-country operations support",
    ],
  },
];

export function LandingContent() {
  return (
    <main className="overflow-x-hidden">
      {/* Sticky Navbar */}
      <Navbar />

      {/* 1. Hero */}
      <section id="hero">
        <BackgroundPaths title="Your World-Class Financial Team" />
      </section>

      {/* Gradient divider: Hero → Features */}
      <div className="h-24 bg-gradient-to-b from-[#0A2463] to-black" />

      {/* 2. Features */}
      <section id="features" className="bg-black">
        <div className="pt-20 pb-8 text-center px-4">
          <div className="border border-white/20 text-white/70 py-1 px-4 rounded-lg text-sm inline-block mb-6">
            What We Offer
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
            Everything Your Business Needs
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            From automated bookkeeping to compliance passports and funding
            access — AccuBridge covers every financial dimension of your
            business.
          </p>
        </div>
        <RadialOrbitalTimeline timelineData={featuresData} />
      </section>

      {/* Gradient divider: Features → Testimonials */}
      <div className="h-24 bg-gradient-to-b from-black to-slate-50" />

      {/* 3. Testimonials */}
      <section id="testimonials" className="bg-slate-50 py-20 px-4">
        <div className="text-center mb-16">
          <div className="border border-slate-300 text-slate-500 py-1 px-4 rounded-lg text-sm inline-block mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-4">
            Trusted by 500+ SMEs
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Hear from business owners across the UK and Nigeria who&apos;ve
            transformed their finances with AccuBridge.
          </p>
        </div>
        <div className="flex justify-center gap-6 max-h-[700px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            duration={19}
            className="hidden md:block"
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            duration={17}
            className="hidden lg:block"
          />
        </div>
      </section>

      {/* Gradient divider: Testimonials → Pricing */}
      <div className="h-24 bg-gradient-to-b from-slate-50 to-white" />

      {/* 4. Pricing */}
      <section id="pricing" className="bg-white py-20 px-4">
        <CreativePricing
          tag="Simple Pricing"
          title="Choose the Right Plan for Your Business"
          description="No hidden fees. Cancel anytime. All plans include access to UK and Nigeria compliance features."
          tiers={pricingTiers}
        />
      </section>

      {/* Gradient divider: Pricing → CTA */}
      <div className="h-24 bg-gradient-to-b from-white to-[#0A2463]" />

      {/* 5. CTA */}
      <section
        id="cta"
        className="bg-gradient-to-br from-[#0A2463] to-[#0D0D0D] py-32 px-4"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Join 500+ SMEs across the UK and Nigeria. Set up in minutes, grow
            with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <FlowButton text="Start Onboarding Free" variant="dark" />
            </Link>
            <a href="#footer">
              <FlowButton text="Talk to Our Team" variant="dark" />
            </a>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <section id="footer">
        <Footer />
      </section>
    </main>
  );
}
