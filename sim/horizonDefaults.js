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

export const HORIZON_DEFAULTS = {
  1: { expectedReturn: 8.69, volatility: 11.56 },
  5: { expectedReturn: 8.69, volatility: 11.56 },
  10: { expectedReturn: 8.58, volatility: 10.5 },
  15: { expectedReturn: 8.58, volatility: 10.5 },
  20: { expectedReturn: 8.25, volatility: 9.68 },
  30: { expectedReturn: 8.25, volatility: 9.68 }
};

export const INVESTOR_PROFILE_STATS = {
  superAggressiveTech: {
    '5y': { return: 16.96, stddev: 20.33 },
    '10y': { return: 18.47, stddev: 18.72 },
    '30y': { return: 13.74, stddev: 23.99 }
  },
  aggressive: {
    '5y': { return: 15.11, stddev: 16.38 },
    '10y': { return: 12.97, stddev: 15.89 },
    '30y': { return: 10.3, stddev: 15.65 }
  },
  modAggressive: {
    '5y': { return: 11.91, stddev: 13.92 },
    '10y': { return: 10.79, stddev: 13.13 },
    '30y': { return: 9.35, stddev: 12.58 }
  },
  moderate: {
    '5y': { return: 8.69, stddev: 11.56 },
    '10y': { return: 8.58, stddev: 10.5 },
    '30y': { return: 8.25, stddev: 9.68 }
  },
  modConservative: {
    '5y': { return: 5.44, stddev: 9.39 },
    '10y': { return: 6.31, stddev: 8.09 },
    '30y': { return: 7.01, stddev: 7.02 }
  },
  conservative: {
    '5y': { return: 2.15, stddev: 7.54 },
    '10y': { return: 4.0, stddev: 6.12 },
    '30y': { return: 5.64, stddev: 4.93 }
  },
  superConservative: {
    '5y': { return: -1.16, stddev: 6.32 },
    '10y': { return: 1.63, stddev: 5.14 },
    '30y': { return: 4.14, stddev: 4.24 }
  }
};

export function horizonFromYears(y) {
  if (y < 5) return 1;
  if (y < 10) return 5;
  if (y < 15) return 10;
  if (y < 20) return 15;
  if (y < 30) return 20;
  return 30;
}
