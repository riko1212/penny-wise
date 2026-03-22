import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'UAH';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  fmt: (amount: number | null | undefined) => string;
  toUAH: (displayAmount: number) => number;
  fromUAH: (uahAmount: number) => number;
  rates: Record<CurrencyCode, number>;
  CURRENCIES: CurrencyCode[];
  CURRENCY_SYMBOLS: Record<CurrencyCode, string>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'UAH'];
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { USD: '$', EUR: '€', UAH: '₴' };

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    () => (localStorage.getItem('currency') as CurrencyCode) || 'USD'
  );
  // rates are UAH → target, e.g. { USD: 0.024, EUR: 0.022, UAH: 1 }
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(() => {
    const cached = localStorage.getItem('exchangeRates');
    return cached ? (JSON.parse(cached) as Record<CurrencyCode, number>) : { USD: 0.024, EUR: 0.022, UAH: 1 };
  });

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/uah.json')
      .then((r) => r.json())
      .then((data: { uah: { usd: number; eur: number } }) => {
        const newRates: Record<CurrencyCode, number> = { USD: data.uah.usd, EUR: data.uah.eur, UAH: 1 };
        setRates(newRates);
        localStorage.setItem('exchangeRates', JSON.stringify(newRates));
      })
      .catch(() => {}); // keep cached/fallback rates
  }, []);

  const setCurrency = useCallback((code: CurrencyCode): void => {
    setCurrencyState(code);
    localStorage.setItem('currency', code);
  }, []);

  // Convert display-currency amount → UAH for storage
  const toUAH = useCallback(
    (displayAmount: number): number => {
      if (currency === 'UAH') return displayAmount;
      return displayAmount / (rates[currency] ?? 1);
    },
    [currency, rates]
  );

  // Convert stored UAH → display currency (raw number, no formatting)
  const fromUAH = useCallback(
    (uahAmount: number): number => {
      if (currency === 'UAH') return uahAmount;
      return uahAmount * (rates[currency] ?? 1);
    },
    [currency, rates]
  );

  const fmt = useCallback(
    (amount: number | null | undefined): string => {
      if (amount == null) return '';
      const converted = currency === 'UAH' ? amount : amount * (rates[currency] ?? 1);
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(converted)
        .replace(/,/g, '\u00a0');
      return currency === 'UAH'
        ? `${formatted}\u00a0₴`
        : `${CURRENCY_SYMBOLS[currency]}${formatted}`;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt, toUAH, fromUAH, rates, CURRENCIES, CURRENCY_SYMBOLS }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
