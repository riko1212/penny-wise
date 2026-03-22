import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext(null);

export const CURRENCIES = ['USD', 'EUR', 'UAH'];
export const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', UAH: '₴' };

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem('currency') || 'USD'
  );
  // rates are UAH → target, e.g. { USD: 0.024, EUR: 0.022, UAH: 1 }
  const [rates, setRates] = useState(() => {
    const cached = localStorage.getItem('exchangeRates');
    return cached ? JSON.parse(cached) : { USD: 0.024, EUR: 0.022, UAH: 1 };
  });

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/uah.json')
      .then((r) => r.json())
      .then((data) => {
        const newRates = { USD: data.uah.usd, EUR: data.uah.eur, UAH: 1 };
        console.log('[CurrencyContext] rates loaded from API:', newRates);
        setRates(newRates);
        localStorage.setItem('exchangeRates', JSON.stringify(newRates));
      })
      .catch((err) => {
        console.warn('[CurrencyContext] failed to load rates, using fallback:', err);
      });
  }, []);

  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
    localStorage.setItem('currency', code);
  }, []);

  // Convert display-currency amount → UAH for storage
  const toUAH = useCallback(
    (displayAmount) => {
      if (currency === 'UAH') return displayAmount;
      return displayAmount / (rates[currency] ?? 1);
    },
    [currency, rates]
  );

  // Convert stored UAH → display currency (raw number, no formatting)
  const fromUAH = useCallback(
    (uahAmount) => {
      if (currency === 'UAH') return uahAmount;
      return uahAmount * (rates[currency] ?? 1);
    },
    [currency, rates]
  );

  const fmt = useCallback(
    (amount) => {
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

export function useCurrency() {
  return useContext(CurrencyContext);
}
