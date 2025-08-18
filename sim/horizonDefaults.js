export const SCENARIO_DEFAULTS = {
  growth: {
    start: 10000,
    contrib: 6000,
    trials: 1000,
    infl: 2,
    trailing_cagr_ending_2024: {
      years: 10,
      cagr: 12
    }
  },
  retire: {
    start: 500000,
    withdraw: 40000,
    trials: 1000,
    infl: 2,
    trailing_cagr_ending_2024: {
      years: 10,
      cagr: 12
    }
  }
};

export const HORIZON_DEFAULTS = {
  1: { expectedReturn: 5, volatility: 20 },
  5: { expectedReturn: 6, volatility: 18 },
  10: { expectedReturn: 7, volatility: 15 },
  15: { expectedReturn: 7, volatility: 14 },
  20: { expectedReturn: 7, volatility: 13 },
  30: { expectedReturn: 7, volatility: 12 }
};
