import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type FooterProps = React.ComponentProps<"footer">;

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t bg-[#0D0D0D] text-white",
        className
      )}
      {...props}
    >
      <div className="relative mx-auto max-w-5xl px-4">
        <div className="relative grid grid-cols-1 border-x border-white/10 md:grid-cols-4 md:divide-x md:divide-white/10">
          <div>
            <SocialCard title="Facebook" href="#" />
            <LinksGroup
              title="Company"
              links={[
                { title: "About Us", href: "#" },
                { title: "Pricing", href: "#pricing" },
                { title: "Testimonials", href: "#testimonials" },
                { title: "Blog", href: "#" },
                { title: "Careers", href: "#" },
              ]}
            />
          </div>
          <div>
            <SocialCard title="LinkedIn" href="#" />
            <LinksGroup
              title="Legal"
              links={[
                { title: "Terms of Use", href: "#" },
                { title: "Privacy Policy", href: "#" },
                { title: "Cookie Policy", href: "#" },
                { title: "Security", href: "#" },
                { title: "Compliance", href: "#" },
              ]}
            />
          </div>
          <div>
            <SocialCard title="Twitter / X" href="#" />
            <LinksGroup
              title="Support"
              links={[
                { title: "Help Center", href: "#" },
                { title: "Contact Us", href: "#" },
                { title: "FAQs", href: "#" },
                { title: "Status", href: "#" },
                { title: "Partners", href: "#" },
              ]}
            />
          </div>
          <div>
            <SocialCard title="Instagram" href="#" />
            <LinksGroup
              title="Contact"
              links={[
                { title: "🇬🇧 United Kingdom", href: "#" },
                { title: "🇳🇬 Nigeria", href: "#" },
                { title: "hello@accubridge.com", href: "mailto:hello@accubridge.com" },
                { title: "Login", href: "/login" },
                { title: "Sign Up", href: "/signup" },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 border-t border-white/10 p-6">
        <div className="text-2xl font-bold text-white mb-1">AccuBridge</div>
        <p className="text-white/50 text-xs">
          © {new Date().getFullYear()} AccuBridge Ltd. All rights reserved.
          Registered in England & Wales.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-white/40 mt-1">
          <span>🛡 FCA Compliant</span>
          <span>✓ FIRS Registered</span>
          <span>🔒 Bank-Grade Security</span>
        </div>
      </div>
    </footer>
  );
}

function LinksGroup({
  title,
  links,
}: {
  title: string;
  links: { title: string; href: string }[];
}) {
  return (
    <div className="p-4">
      <h3 className="text-white/50 mt-2 mb-4 text-xs font-medium tracking-wider uppercase">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.title}>
            <a
              href={link.href}
              className="text-white/60 hover:text-white text-xs transition-colors"
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialCard({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="hover:bg-white/5 flex items-center justify-between border-t border-b border-white/10 p-3 text-sm transition-colors"
    >
      <span className="font-medium text-white/80">{title}</span>
      <ArrowRight className="h-4 w-4 text-white/40 transition-colors" />
    </a>
  );
}
