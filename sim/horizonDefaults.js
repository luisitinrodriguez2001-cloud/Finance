export const SCENARIO_DEFAULTS = {
  growth: {
    start: 10000,
    contrib: 6000,
    trials: 1000,
    infl: 2,
    trailing_cagr_ending_2024: {
      years: 10,
      cagr: 8.58
    }
  },
  retire: {
    start: 500000,
    withdraw: 40000,
    trials: 1000,
    infl: 2,
    trailing_cagr_ending_2024: {
      years: 10,
      cagr: 8.58
    }
  }
};

export const INVESTOR_PROFILE = '60/40';

// Expected return and volatility approximations for a 60/40 portfolio
// Source: https://www.lazyportfolioetf.com/
export const HORIZON_DEFAULTS = {
  1: { expectedReturn: 8.69, volatility: 11.56 },
  5: { expectedReturn: 8.69, volatility: 11.56 },
  10: { expectedReturn: 8.58, volatility: 10.5 },
  15: { expectedReturn: 8.5, volatility: 10.3 },
  20: { expectedReturn: 8.42, volatility: 10.09 },
  30: { expectedReturn: 8.25, volatility: 9.68 }
};

export function horizonFromYears(y) {
  if (y < 5) return 1;
  if (y < 10) return 5;
  if (y < 15) return 10;
  if (y < 20) return 15;
  if (y < 30) return 20;
  return 30;
}
