"use client";
import { ArrowRight } from "lucide-react";

export function FlowButton({
  text = "Modern Button",
  variant = "dark",
}: {
  text?: string;
  variant?: "dark" | "light";
}) {
  const isDark = variant === "dark";
  return (
    <button
      className={`group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] px-8 py-3 text-sm font-semibold cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:rounded-[12px] active:scale-[0.95] ${
        isDark
          ? "border-white/40 text-white bg-transparent hover:text-[#0A2463]"
          : "border-[#333333]/40 text-[#111111] bg-transparent hover:text-white"
      }`}
    >
      <ArrowRight
        className={`absolute w-4 h-4 left-[-25%] fill-none z-[9] group-hover:left-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark ? "stroke-white group-hover:stroke-[#0A2463]" : "stroke-[#111111] group-hover:stroke-white"
        }`}
      />
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>
      <span
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${
          isDark ? "bg-white" : "bg-[#111111]"
        }`}
      ></span>
      <ArrowRight
        className={`absolute w-4 h-4 right-4 fill-none z-[9] group-hover:right-[-25%] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark ? "stroke-white group-hover:stroke-[#0A2463]" : "stroke-[#111111] group-hover:stroke-white"
        }`}
      />
    </button>
  );
}
