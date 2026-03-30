"use client";

import React, { useState } from "react";
import { Lightbulb, Sparkles, RotateCcw, BookmarkCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { IdeaInputForm } from "./_components/idea-input-form";
import { IdeaCard } from "./_components/idea-card";
import { AIIdeaInput, AIBusinessIdea } from "@/types/tools";

const BRAND = {
  primary: "#0A2463",
  accent: "#3E92CC",
  gold: "#D4AF37",
  green: "#06D6A0",
  muted: "#6B7280",
};

// ── Mock generator (replace with real Anthropic API call in production) ────────
async function generateIdeas(input: AIIdeaInput): Promise<AIBusinessIdea[]> {
  await new Promise((res) => setTimeout(res, 2500));

  return [
    {
      id: `idea-${Date.now()}-1`,
      title: "Digital Marketing Agency for SMEs",
      tagline: "Full-service digital growth for small businesses in your region",
      description: `Leveraging your ${input.skills} background, you can offer social media management, SEO, and paid advertising specifically to the underserved SME market in ${input.location}. Low overhead, high demand.`,
      business_model: "B2B",
      startup_cost_estimate: input.capital.includes("£")
        ? "£1,500 – £4,000"
        : "₦150,000 – ₦400,000",
      revenue_potential: "High",
      time_to_first_revenue: "2–4 weeks",
      skills_match: 90,
      market_demand: "Very High",
      key_steps: [
        "Register your business and set up a professional website",
        "Identify 5–10 local SMEs as target clients",
        "Offer free audits to secure first clients",
        "Build case studies from early clients to attract more",
      ],
      risks: [
        "Competitive market",
        "Client retention challenges",
        "Requires constant upskilling",
      ],
      saved: false,
      generated_at: new Date().toISOString(),
    },
    {
      id: `idea-${Date.now()}-2`,
      title: "Online Tutoring Platform",
      tagline: "Connect students with qualified tutors in your area",
      description: `With your experience in ${input.experience || "your field"}, you can build or join a tutoring platform serving students in ${input.location}. High demand for quality education support, especially post-COVID.`,
      business_model: "Marketplace",
      startup_cost_estimate: input.capital.includes("£")
        ? "£500 – £3,000"
        : "₦50,000 – ₦300,000",
      revenue_potential: "Medium",
      time_to_first_revenue: "1–2 months",
      skills_match: 75,
      market_demand: "High",
      key_steps: [
        "Choose your subject specialism",
        "Sign up to existing platforms (Tutorful, etc.) for fast income",
        "Build a personal website for direct bookings",
        "Scale by hiring other tutors and taking a commission",
      ],
      risks: [
        "Seasonal demand",
        "Platform dependency",
        "Time-intensive to scale alone",
      ],
      saved: false,
      generated_at: new Date().toISOString(),
    },
    {
      id: `idea-${Date.now()}-3`,
      title: "Bookkeeping & Tax Support Service",
      tagline: "Affordable financial compliance for local businesses",
      description: `A bookkeeping and tax support service targeted at small businesses and freelancers in ${input.location}. With AccuBridge as your operational backbone, overhead is minimal and recurring revenue is predictable.`,
      business_model: "Service",
      startup_cost_estimate: input.capital.includes("£")
        ? "£800 – £2,500"
        : "₦80,000 – ₦250,000",
      revenue_potential: "Medium",
      time_to_first_revenue: "2–6 weeks",
      skills_match: 82,
      market_demand: "High",
      key_steps: [
        "Register as an accountant or bookkeeper with relevant body",
        "Define your service packages (basic, standard, premium)",
        "Reach out to local businesses and freelancers",
        "Use AccuBridge to manage client accounts efficiently",
      ],
      risks: [
        "Requires professional certification",
        "Liability exposure",
        "Manual work until clients build up",
      ],
      saved: false,
      generated_at: new Date().toISOString(),
    },
  ];
}

export default function AIIdeasPage() {
  const [ideas, setIdeas] = useState<AIBusinessIdea[]>([]);
  const [isGenerating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const handleGenerate = async (input: AIIdeaInput) => {
    setGenerating(true);
    setIdeas([]);
    try {
      const results = await generateIdeas(input);
      setIdeas(results);
      setHasGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = (id: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === id) {
          if (!idea.saved) setSavedCount((c) => c + 1);
          else setSavedCount((c) => Math.max(0, c - 1));
          return { ...idea, saved: !idea.saved };
        }
        return idea;
      })
    );
  };

  const handleReset = () => {
    setIdeas([]);
    setHasGenerated(false);
    setSavedCount(0);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          badge="Tools"
          title="AI Business Ideas"
          description="Enter your skills, experience, and capital — our AI generates tailored business ideas with actionable steps"
        />

        <IdeaInputForm onGenerate={handleGenerate} isGenerating={isGenerating} />

        {/* Loading state */}
        {isGenerating && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${BRAND.accent}15` }}
            >
              <Sparkles
                size={28}
                className="animate-pulse"
                style={{ color: BRAND.accent }}
              />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">
                Generating your personalised ideas...
              </p>
              <p className="text-xs mt-1" style={{ color: BRAND.muted }}>
                Analysing your profile against market opportunities
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: BRAND.accent,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!isGenerating && hasGenerated && ideas.length > 0 && (
          <div className="mt-6 flex flex-col gap-5">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-base">
                  {ideas.length} Ideas Generated
                </h3>
                <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                  Click any card to expand steps & risks
                  {savedCount > 0 && ` · ${savedCount} saved`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {savedCount > 0 && (
                  <div
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs border"
                    style={{
                      backgroundColor: `${BRAND.gold}12`,
                      color: BRAND.gold,
                      borderColor: `${BRAND.gold}25`,
                    }}
                  >
                    <BookmarkCheck size={13} />
                    {savedCount} saved
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs border transition-all duration-200"
                  style={{
                    borderColor: "rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <RotateCcw size={13} />
                  Start over
                </button>
              </div>
            </div>

            {/* Idea cards */}
            <div className="flex flex-col gap-4">
              {ideas.map((idea, i) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  index={i}
                  onSave={handleSave}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div
              className="rounded-2xl border p-5 flex items-start gap-4"
              style={{
                backgroundColor: `${BRAND.accent}08`,
                borderColor: `${BRAND.accent}20`,
              }}
            >
              <Lightbulb
                size={20}
                style={{ color: BRAND.accent, flexShrink: 0 }}
              />
              <div>
                <p className="text-sm font-semibold text-white mb-1">
                  Ready to turn an idea into a registered business?
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Head to Business Registration to incorporate your company with
                  AccuBridge's guided step-by-step process.
                </p>
                <a
                  href="/client/registration"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2 transition-colors duration-200"
                  style={{ color: BRAND.accent }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = BRAND.accent;
                  }}
                >
                  Go to Business Registration →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
