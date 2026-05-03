"use client";

import React, { createContext, useContext } from "react";
import {
  type ClientCountry,
  type SupportedCurrency,
  type CurrencyConfig,
  type FormatOpts,
  CURRENCY_CONFIG,
  currencyFromCountry,
  formatAmount,
} from "@/lib/accubridge/currency";

interface CurrencyContextT {
  currency: SupportedCurrency;
  config: CurrencyConfig;
  fmt: (value: number, opts?: FormatOpts) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextT>({
  currency: "GBP",
  config: CURRENCY_CONFIG.GBP,
  fmt: (v) => formatAmount(v, CURRENCY_CONFIG.GBP),
  symbol: "£",
});

export function CurrencyProvider({
  country,
  children,
}: {
  country: ClientCountry;
  children: React.ReactNode;
}) {
  const currency = currencyFromCountry(country);
  const config = CURRENCY_CONFIG[currency];
  const fmt = (value: number, opts?: FormatOpts) =>
    formatAmount(value, config, opts);

  return (
    <CurrencyContext.Provider value={{ currency, config, fmt, symbol: config.symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
