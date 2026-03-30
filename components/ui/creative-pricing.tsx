import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

function CreativePricing({
  tag = "Simple Pricing",
  title = "Choose Your Plan",
  description = "No hidden fees.",
  tiers,
}: {
  tag?: string;
  title?: string;
  description?: string;
  tiers: PricingTier[];
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center space-y-6 mb-16">
        <div className="text-xl text-blue-500 font-medium italic">{tag}</div>
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900">
            {title}
          </h2>
        </div>
        <p className="text-xl text-zinc-600">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={cn(
              "relative group transition-all duration-300",
              index === 0 && "-rotate-1",
              index === 1 && "rotate-1",
              index === 2 && "-rotate-2"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-white",
                "border-2 border-zinc-900",
                "rounded-lg shadow-[4px_4px_0px_0px] shadow-zinc-900",
                "transition-all duration-300",
                "group-hover:shadow-[8px_8px_0px_0px]",
                "group-hover:translate-x-[-4px]",
                "group-hover:translate-y-[-4px]"
              )}
            />
            <div className="relative p-6">
              {tier.popular && (
                <div className="absolute -top-2 -right-2 bg-amber-400 text-zinc-900 font-semibold px-3 py-1 rounded-full rotate-12 text-sm border-2 border-zinc-900">
                  Most Popular!
                </div>
              )}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center border-2 border-zinc-900">
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-zinc-900">{tier.name}</h3>
                <p className="text-zinc-600">{tier.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-zinc-900">
                  £{tier.price}
                </span>
                <span className="text-zinc-600">/month</span>
              </div>
              <div className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-900 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-base text-zinc-900">{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                className={cn(
                  "w-full h-12 text-lg relative border-2 border-zinc-900 transition-all duration-300",
                  "shadow-[4px_4px_0px_0px] shadow-zinc-900",
                  "hover:shadow-[6px_6px_0px_0px] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  tier.popular
                    ? "bg-amber-400 text-zinc-900 hover:bg-amber-300"
                    : "bg-zinc-50 text-zinc-900 hover:bg-white"
                )}
              >
                Get Started
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };
