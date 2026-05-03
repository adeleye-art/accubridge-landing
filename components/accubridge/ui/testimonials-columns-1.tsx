"use client";
import React from "react";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "AccuBridge completely transformed how we handle compliance across our UK and Nigeria operations. The compliance passport alone saved us weeks of manual work.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Adaeze Okonkwo",
    role: "CEO, Meridian Retail Ltd",
  },
  {
    text: "The automated bookkeeping is phenomenal. We went from spending 3 days a month on accounts to less than an hour. Absolutely game-changing for our SME.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "James Whitfield",
    role: "Founder, CloudBridge Solutions",
  },
  {
    text: "Getting registered with Companies House through AccuBridge was seamless. The step-by-step guidance and real-time tracking made the whole process stress-free.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Fatima Al-Hassan",
    role: "Operations Director, NovaTech NG",
  },
  {
    text: "The compliance funding feature is brilliant. We qualified for a grant we never even knew existed because AccuBridge kept our compliance score high.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Emeka Duru",
    role: "MD, Duru & Associates",
  },
  {
    text: "As a sole trader operating between Lagos and London, AccuBridge is the only platform that truly understands my dual-jurisdiction needs.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Kemi Adebayo",
    role: "Consultant & Sole Trader",
  },
  {
    text: "The AI business idea generator helped us pivot our service offering at just the right time. Backed by real data, real capital ranges, and real market insight.",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    name: "David Osei",
    role: "Co-Founder, GreenPath Ventures",
  },
  {
    text: "Financial reports used to take our accountant two full days. With AccuBridge, our P&L, balance sheet and cash flow are ready in minutes.",
    image: "https://randomuser.me/api/portraits/women/7.jpg",
    name: "Blessing Nwosu",
    role: "Finance Manager, Apex Foods",
  },
  {
    text: "Investor pitch review through the platform is a hidden gem. We got actionable feedback that helped us close our seed round.",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
    name: "Tobi Adesanya",
    role: "Startup Founder, StackHive",
  },
  {
    text: "The bank-grade security and FCA compliance gave our board complete confidence. We moved our entire SME portfolio to AccuBridge within a month.",
    image: "https://randomuser.me/api/portraits/women/9.jpg",
    name: "Sarah Merchant",
    role: "CFO, Bridgepoint Capital",
  },
];

export const firstColumn = testimonials.slice(0, 3);
export const secondColumn = testimonials.slice(3, 6);
export const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="p-8 rounded-3xl border border-slate-200 shadow-md shadow-slate-200/50 max-w-xs w-full bg-white"
                key={i}
              >
                <p className="text-slate-700 text-sm leading-relaxed">{text}</p>
                <div className="flex items-center gap-3 mt-5">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <div className="font-semibold text-slate-900 tracking-tight leading-5 text-sm">
                      {name}
                    </div>
                    <div className="text-xs leading-5 text-slate-500 tracking-tight">
                      {role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
