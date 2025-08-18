// Portfolio return and volatility data
// Source: https://www.lazyportfolioetf.com/
export const INVESTOR_PROFILES = {
  superAggressive: {
    allocation: 'All Tech',
    returns: { 5: 16.96, 10: 18.47, 30: 13.74 },
    stddev: { 5: 20.33, 10: 18.72, 30: 23.99 }
  },
  aggressive: {
    allocation: '100/0',
    returns: { 5: 15.11, 10: 12.97, 30: 10.3 },
    stddev: { 5: 16.38, 10: 15.89, 30: 15.65 }
  },
  modAggressive: {
    allocation: '80/20',
    returns: { 5: 11.91, 10: 10.79, 30: 9.35 },
    stddev: { 5: 13.92, 10: 13.13, 30: 12.58 }
  },
  moderate: {
    allocation: '60/40',
    returns: { 5: 8.69, 10: 8.58, 30: 8.25 },
    stddev: { 5: 11.56, 10: 10.5, 30: 9.68 }
  },
  modConservative: {
    allocation: '40/60',
    returns: { 5: 5.44, 10: 6.31, 30: 7.01 },
    stddev: { 5: 9.39, 10: 8.09, 30: 7.02 }
  },
  conservative: {
    allocation: '20/80',
    returns: { 5: 2.15, 10: 4.0, 30: 5.64 },
    stddev: { 5: 7.54, 10: 6.12, 30: 4.93 }
  },
  superConservative: {
    allocation: '0/100',
    returns: { 5: -1.16, 10: 1.63, 30: 4.14 },
    stddev: { 5: 6.32, 10: 5.14, 30: 4.24 }
  }
};

export const DEFAULT_INVESTOR_PROFILE = 'moderate';
