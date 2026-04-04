export type SupportedCurrency = "GBP" | "NGN";
export type ClientCountry = "uk" | "nigeria" | "both";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  locale: string;
}

export const CURRENCY_CONFIG: Record<SupportedCurrency, CurrencyConfig> = {
  GBP: { code: "GBP", symbol: "£", locale: "en-GB" },
  NGN: { code: "NGN", symbol: "₦", locale: "en-NG" },
};

export function currencyFromCountry(country: ClientCountry): SupportedCurrency {
  return country === "nigeria" ? "NGN" : "GBP";
}

export interface FormatOpts {
  parens?: boolean; // render negatives as (£1,200) — accounting style
}

export function formatAmount(
  value: number,
  cfg: CurrencyConfig,
  opts?: FormatOpts
): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.code,
    minimumFractionDigits: 2,
  }).format(abs);

  if (opts?.parens && value < 0) return `(${formatted})`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatAmountRaw(
  value: number,
  currency: SupportedCurrency,
  opts?: FormatOpts
): string {
  return formatAmount(value, CURRENCY_CONFIG[currency], opts);
}

export const PLAN_PRICES: Record<
  SupportedCurrency,
  { basic: number; standard: number; premium: number }
> = {
  GBP: { basic: 29, standard: 69, premium: 129 },
  NGN: { basic: 15000, standard: 35000, premium: 65000 },
};
