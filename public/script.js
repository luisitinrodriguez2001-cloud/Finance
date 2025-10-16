/* Finance Calculators — React 18 + Babel + Math.js + Day.js + Chart.js
   Tweaks in this version:
   - Debt Payoff: extra placeholder = $0; "+ Add debt" moved under list.
*/
// Simulation defaults used across calculators. Previously these values were
// imported from "sim/horizonDefaults.js" using an ES module import, but the
// additional module loader caused the app to render a blank page when the
// script tag was treated as a module. Inlining the data removes that extra
// dependency and allows the app to execute as a regular script.
const SCENARIO_DEFAULTS = {
  growth: {
    start: 10000,
    contrib: 6000,
    goal: 1000000,
    trials: 1000,
    infl: 2
  },
  retire: {
    start: 500000,
    withdraw: 40000,
    trials: 1000,
    infl: 2
  }
};

const HORIZON_DEFAULTS = {
  1: { expectedReturn: 5, volatility: 20 },
  5: { expectedReturn: 6, volatility: 18 },
  10: { expectedReturn: 7, volatility: 15 },
  15: { expectedReturn: 7, volatility: 14 },
  20: { expectedReturn: 7, volatility: 13 },
  30: { expectedReturn: 7, volatility: 12 }
};

const INVESTOR_PROFILES = {
  superAggressive: {
    label: 'Super Aggressive (All Tech)',
    returns: { 5: 16.96, 10: 18.47, 30: 13.74 },
    stddev: { 5: 20.33, 10: 18.72, 30: 23.99 }
  },
  aggressive: {
    label: 'Aggressive (100/0)',
    returns: { 5: 15.11, 10: 12.97, 30: 10.3 },
    stddev: { 5: 16.38, 10: 15.89, 30: 15.65 }
  },
  modAggressive: {
    label: 'Mod. Aggressive (80/20)',
    returns: { 5: 11.91, 10: 10.79, 30: 9.35 },
    stddev: { 5: 13.92, 10: 13.13, 30: 12.58 }
  },
  moderate: {
    label: 'Moderate (60/40)',
    returns: { 5: 8.69, 10: 8.58, 30: 8.25 },
    stddev: { 5: 11.56, 10: 10.5, 30: 9.68 }
  },
  modConservative: {
    label: 'Mod. Conservative (40/60)',
    returns: { 5: 5.44, 10: 6.31, 30: 7.01 },
    stddev: { 5: 9.39, 10: 8.09, 30: 7.02 }
  },
  conservative: {
    label: 'Conservative (20/80)',
    returns: { 5: 2.15, 10: 4.0, 30: 5.64 },
    stddev: { 5: 7.54, 10: 6.12, 30: 4.93 }
  },
  superConservative: {
    label: 'Super Conservative (0/100)',
    returns: { 5: -1.16, 10: 1.63, 30: 4.14 },
    stddev: { 5: 6.32, 10: 5.14, 30: 4.24 }
  }
};

const DEFAULT_INVESTOR_PROFILE = 'moderate';

const horizonFromYears = y => {
  if (y < 5) return 1;
  if (y < 10) return 5;
  if (y < 15) return 10;
  if (y < 20) return 15;
  if (y < 30) return 20;
  return 30;
};

const { useState, useMemo, useEffect, useRef } = React;

/* ----------------------- Error Boundary ----------------------- */
class ErrorBoundary extends React.Component {
  constructor(p) {super(p);this.state = { hasError: false, err: null };}
  static getDerivedStateFromError(err) {return { hasError: true, err };}
  componentDidCatch(err, info) {console.error('Calculator error:', err, info);}
  render() {
    if (this.state.hasError) {
      return /*#__PURE__*/(
        React.createElement("section", { className: "card p-4 mb-4" }, /*#__PURE__*/
        React.createElement("h2", { className: "text-lg font-semibold" }, "Something went wrong"), /*#__PURE__*/
        React.createElement("p", { className: "text-sm text-slate-600 mt-1" }, "A widget crashed. Try different inputs or reload.")));


    }
    return this.props.children;
  }}


/* ----------------------- Socials ----------------------- */
const SOCIALS = {
  instagram: 'https://instagram.com/luisitin2001',
  tiktok: 'https://www.tiktok.com/@luisitin2001'
};

const IconLink = ({ href, label, children }) => /*#__PURE__*/
React.createElement("a", { href: href, target: "_blank", rel: "noreferrer",
  className: "icon-btn hover:bg-slate-100 transition-colors duration-150", "aria-label": label, title: label },
children);


const InstagramSVG = () => /*#__PURE__*/React.createElement("img", { src: "public/instagram.svg", width: "16", height: "16", alt: "", "aria-hidden": "true", className: "social-icon" });
const TikTokSVG = () => /*#__PURE__*/React.createElement("img", { src: "public/tiktok.svg", width: "16", height: "16", alt: "", "aria-hidden": "true", className: "social-icon" });
const SocialBar = () => /*#__PURE__*/
React.createElement("div", { className: "flex items-center gap-2" }, /*#__PURE__*/
React.createElement(IconLink, { href: SOCIALS.instagram, label: "Instagram" }, /*#__PURE__*/React.createElement(InstagramSVG, null)), /*#__PURE__*/
React.createElement(IconLink, { href: SOCIALS.tiktok, label: "TikTok" }, /*#__PURE__*/React.createElement(TikTokSVG, null)));




/* ----------------------- Settings ----------------------- */
function SettingsPanel({ config, onChange }) {
  return /*#__PURE__*/(
    React.createElement("div", { className: "absolute top-full right-0 mt-2 w-56 p-4 border rounded-xl bg-white shadow-card space-y-3", style: { zIndex: 1000 } }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-medium mb-1" }, "Theme"), /*#__PURE__*/
    React.createElement("select", { className: "field", value: config.theme, onChange: e => onChange('theme', e.target.value) }, /*#__PURE__*/
    React.createElement("option", { value: "light" }, "Light"), /*#__PURE__*/React.createElement("option", { value: "dark" }, "Dark"))), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-medium mb-1" }, "Accent"), /*#__PURE__*/
    React.createElement("select", { className: "field", value: config.accent, onChange: e => onChange('accent', e.target.value) }, /*#__PURE__*/
    React.createElement("option", { value: "slate" }, "Slate"), /*#__PURE__*/React.createElement("option", { value: "emerald" }, "Emerald"), /*#__PURE__*/React.createElement("option", { value: "amber" }, "Amber"))), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("label", { className: "block text-xs font-medium mb-1" }, "Font size"), /*#__PURE__*/
    React.createElement("select", { className: "field", value: config.font, onChange: e => onChange('font', e.target.value) }, /*#__PURE__*/
    React.createElement("option", { value: "base" }, "Base"), /*#__PURE__*/React.createElement("option", { value: "small" }, "Small"), /*#__PURE__*/React.createElement("option", { value: "large" }, "Large")))));
}

/* ----------------------- Formatters & math ----------------------- */
const money0 = n => {var _window$accounting$fo, _window$accounting, _window$accounting$fo2;return (_window$accounting$fo = (_window$accounting = window.accounting) === null || _window$accounting === void 0 ? void 0 : (_window$accounting$fo2 = _window$accounting.formatMoney) === null || _window$accounting$fo2 === void 0 ? void 0 : _window$accounting$fo2.call(_window$accounting, n !== null && n !== void 0 ? n : 0, { precision: 0 })) !== null && _window$accounting$fo !== void 0 ? _window$accounting$fo :
  (n !== null && n !== void 0 ? n : 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });};
const money2 = n => {var _window$accounting$fo3, _window$accounting2, _window$accounting2$f;return (_window$accounting$fo3 = (_window$accounting2 = window.accounting) === null || _window$accounting2 === void 0 ? void 0 : (_window$accounting2$f = _window$accounting2.formatMoney) === null || _window$accounting2$f === void 0 ? void 0 : _window$accounting2$f.call(_window$accounting2, n !== null && n !== void 0 ? n : 0, { precision: 2 })) !== null && _window$accounting$fo3 !== void 0 ? _window$accounting$fo3 :
  (n !== null && n !== void 0 ? n : 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });};
const monthlyRate = apr => (apr !== null && apr !== void 0 ? apr : 0) / 100 / 12;
const months = (y, allowZero = false) => Math.max(allowZero ? 0 : 1, Math.round((y !== null && y !== void 0 ? y : 0) * 12));
function pmt({ principal, apr, years }) {
  const i = monthlyRate(apr),N = months(years);
  if (i === 0) return principal / N;
  return principal * (i / (1 - Math.pow(1 + i, -N)));
}
function loanPayment({ principal = 0, apr = 0, years = 0 }) {
  const N = months(years);
  const payment = pmt({ principal, apr, years });
  const totalPaid = payment * N;
  return { payment, totalPaid, totalInterest: totalPaid - principal, N };
}
function futureValue({ principal = 0, monthly = 0, apr = 0, years = 0 }) {
  const i = monthlyRate(apr),N = months(years);
  if (i === 0) return principal + monthly * N;
  return principal * Math.pow(1 + i, N) + monthly * (Math.pow(1 + i, N) - 1) / i;
}
function requiredMonthly({ goal = 0, principal = 0, apr = 0, years = 0 }) {
  const i = monthlyRate(apr),N = months(years),g = Math.pow(1 + i, N);
  if (i === 0) return (goal - principal) / N;
  return (goal - principal * g) * i / (g - 1);
}
function buildSchedule({ principal, apr, years, extraMonthly = 0, lumpMonth = null, lumpAmount = 0 }) {
  const i = monthlyRate(apr),N = months(years),base = pmt({ principal, apr, years });
  let bal = principal,month = 0,totalInterest = 0,rows = [];
  if ((lumpMonth !== null && lumpMonth !== void 0 ? lumpMonth : null) === 0) {
    bal = Math.max(0, bal - lumpAmount);
  }
  while (bal > 0.01 && month < 3600) {
    month++;
    let interest = bal * i;
    let principalPaid = base - interest + (extraMonthly || 0);
    if (lumpMonth !== null && lumpMonth !== void 0 && month === lumpMonth) principalPaid += lumpAmount;
    if (principalPaid > bal + interest) principalPaid = bal + interest;
    const payment = principalPaid + interest;
    bal = Math.max(0, bal - principalPaid);
    totalInterest += interest;
    rows.push({ month, payment, interest, principal: principalPaid, bal });
  }
  return { rows, totalInterest, months: rows.length, basePayment: base };
}
function remainingBalance({ principal, apr, years, monthsElapsed }) {
  const i = monthlyRate(apr),N = months(years),k = Math.min(N, Math.max(0, monthsElapsed || 0));
  if (i === 0) return principal * (1 - k / N);
  const A = pmt({ principal, apr, years });
  return principal * Math.pow(1 + i, k) - A * ((Math.pow(1 + i, k) - 1) / i);
}

/* ----------------------- Down vs Points helpers ----------------------- */
function calcMonthlyPayment(principal, aprPct, termMonths) {
  if (!(principal > 0) || !(termMonths > 0)) return 0;
  const r = (aprPct || 0) / 100 / 12;
  if (r <= 0) return principal / termMonths;
  const g = Math.pow(1 + r, termMonths);
  return principal * (r * g) / (g - 1);
}

function buildDownVsPointsSchedule({ principal, aprPct, termMonths, pmiAnnualPct, homePrice }) {
  const rows = [];
  if (!(principal > 0) || !(termMonths > 0)) {
    return { rows, payment: 0, pmiOffMonth: 0 };
  }
  const payment = calcMonthlyPayment(principal, aprPct, termMonths);
  const rate = (aprPct || 0) / 100 / 12;
  const pmiMonthly = (pmiAnnualPct || 0) / 100 / 12 * principal;
  let balance = principal;
  let pmiOffMonth = termMonths;
  let pmiActive = pmiAnnualPct > 0;
  for (let month = 1; month <= termMonths && balance > 0.01; month++) {
    const interest = balance * rate;
    let principalPaid = payment - interest;
    if (principalPaid > balance) principalPaid = balance;
    const newBalance = Math.max(0, balance - principalPaid);
    if (pmiActive && homePrice > 0 && newBalance / homePrice <= 0.8) {
      pmiActive = false;
      pmiOffMonth = month;
    }
    const pmi = pmiActive ? pmiMonthly : 0;
    rows.push({
      month,
      interest,
      principal: principalPaid,
      balance: newBalance,
      payment,
      pmi,
      total: payment + pmi
    });
    balance = newBalance;
  }
  if (!pmiActive) {
    // ensure subsequent months show 0 PMI even if schedule shorter than termMonths
    for (let month = rows.length + 1; month <= termMonths; month++) {
      rows.push({ month, interest: 0, principal: 0, balance: 0, payment: 0, pmi: 0, total: 0 });
    }
  }
  return { rows, payment, pmiOffMonth: pmiAnnualPct > 0 ? pmiOffMonth : 0 };
}

function npvToHorizon({ upfront, schedule, horizonMonths, monthlyDisc, taxes }) {
  const { marginalRate = 0, pointsCost = 0, termMonths = schedule.length, treatment = 'amortize', includeTaxes = false } = taxes || {};
  const disc = Math.max(0, monthlyDisc || 0);
  let npv = upfront;
  let totalCash = upfront;
  let totalCashTax = upfront;
  let totalInterest = 0;
  let totalInterestAfterTax = 0;
  const monthlyFlows = [];
  const monthlyFlowsTax = [];
  const horizon = Math.min(schedule.length, Math.max(0, horizonMonths || 0));
  const rate = Math.max(0, marginalRate || 0) / 100;
  const amortBenefit = includeTaxes && termMonths > 0 ? (pointsCost * rate) / termMonths : 0;
  let deductBenefit = includeTaxes && treatment === 'deduct' ? pointsCost * rate : 0;
  for (let i = 0; i < horizon; i++) {
    const row = schedule[i] || { interest: 0, payment: 0, pmi: 0, total: 0 };
    const month = i + 1;
    const baseCost = row.total;
    totalCash += baseCost;
    monthlyFlows.push(baseCost);
    totalInterest += row.interest;
    let adjCost = baseCost;
    if (includeTaxes) {
      const interestAfter = row.interest * (1 - rate);
      const principal = row.payment - row.interest;
      const taxBenefit = treatment === 'deduct' && month === 1 ? deductBenefit : amortBenefit;
      adjCost = principal + interestAfter + row.pmi - taxBenefit;
      if (treatment === 'deduct' && month === 1) deductBenefit = 0;
      totalInterestAfterTax += interestAfter;
    }
    totalCashTax += adjCost;
    monthlyFlowsTax.push(adjCost);
  }
  let npvFlows = 0;
  let npvFlowsTax = 0;
  monthlyFlows.forEach((c, idx) => { npvFlows += c / Math.pow(1 + disc, idx + 1); });
  monthlyFlowsTax.forEach((c, idx) => { npvFlowsTax += c / Math.pow(1 + disc, idx + 1); });
  npv += includeTaxes ? npvFlowsTax : npvFlows;
  return {
    npv,
    totalCash: includeTaxes ? totalCashTax : totalCash,
    totalInterest,
    totalInterestAfterTax: includeTaxes ? totalInterestAfterTax : totalInterest,
    monthlyFlows,
    monthlyFlowsTax
  };
}

function breakevenMonth({ withPoints, noPoints, horizonMonths }) {
  if (!withPoints || !noPoints) return null;
  const horizon = Math.min(horizonMonths || withPoints.length, withPoints.length, noPoints.length);
  for (let i = 0; i < horizon; i++) {
    if (withPoints[i] < noPoints[i] - 1e-2) return i;
  }
  return null;
}

function optimizeAllocation({ computeScenario, steps = 200 }) {
  let best = null;
  for (let i = 0; i <= steps; i++) {
    const share = i / steps;
    const scenario = computeScenario(share);
    if (!scenario) continue;
    if (!best || scenario.npv < best.npv) {
      best = { ...scenario, share };
    }
  }
  return best;
}

function solveEffectiveApr({ loanAmount, pointsCost, schedule, horizonMonths }) {
  if (!(loanAmount > 0)) return 0;
  const horizon = Math.min(schedule.length, Math.max(1, horizonMonths || schedule.length));
  const flows = [];
  flows.push(loanAmount - (pointsCost || 0));
  for (let i = 0; i < horizon; i++) {
    const row = schedule[i] || { total: 0 };
    flows.push(-row.total);
  }
  let low = -0.99;
  let high = 1;
  const npvAt = r => flows.reduce((acc, v, idx) => acc + v / Math.pow(1 + r, idx), 0);
  let npvLow = npvAt(low);
  let npvHigh = npvAt(high);
  if (npvLow * npvHigh > 0) {
    high = 5;
    npvHigh = npvAt(high);
    if (npvLow * npvHigh > 0) return 0;
  }
  for (let iter = 0; iter < 60; iter++) {
    const mid = (low + high) / 2;
    const npvMid = npvAt(mid);
    if (Math.abs(npvMid) < 1e-6) return Math.pow(1 + mid, 12) - 1;
    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }
  const rate = (low + high) / 2;
  return Math.pow(1 + rate, 12) - 1;
}

/* unit-like sanity checks */
if (typeof window !== 'undefined') {
  try {
    const pay = calcMonthlyPayment(300000, 6, 360);
    console.assert(Math.abs(pay - 1798.65) < 0.5, 'calcMonthlyPayment check');
    const sched = buildDownVsPointsSchedule({ principal: 200000, aprPct: 6, termMonths: 360, pmiAnnualPct: 0.5, homePrice: 250000 });
    console.assert(sched.rows.length >= 360, 'schedule length');
    const npv = npvToHorizon({ upfront: 50000, schedule: sched.rows, horizonMonths: 12, monthlyDisc: 0.0025, taxes: { includeTaxes: false } });
    console.assert(npv.npv > 0, 'npv positive');
    const eff = solveEffectiveApr({ loanAmount: 200000, pointsCost: 0, schedule: sched.rows, horizonMonths: 60 });
    console.assert(eff > 0 && eff < 0.2, 'effective apr range');
  } catch (err) { console.warn('Down vs Points helpers test failed', err); }
}

/* ----------------------- Live data helpers (ZIP/Census) ----------------------- */
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {const v = localStorage.getItem(key);return v ? JSON.parse(v) : initial;} catch {return initial;}
  });
  useEffect(() => {try {localStorage.setItem(key, JSON.stringify(val));} catch {}}, [key, val]);
  return [val, setVal];
}
async function fetchZip(zip) {var _j$places;
  const r = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`);
  if (!r.ok) throw new Error('ZIP not found');
  const j = await r.json();
  const place = (_j$places = j.places) === null || _j$places === void 0 ? void 0 : _j$places[0];
  return place ? { city: place['place name'], state: place['state abbreviation'] } : null;
}
async function fetchMedianHomeValueByZip(zip) {
  const url = `https://api.census.gov/data/2022/acs/acs5?get=B25077_001E,NAME&for=zip%20code%20tabulation%20area:${encodeURIComponent(zip)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Census error');
  const rows = await r.json();
  if (!Array.isArray(rows) || rows.length < 2) return null;
  const [val, name] = rows[1];
  const n = parseFloat(val);
  return Number.isFinite(n) ? { name, value: n } : null;
}
async function fetchMedianIncomeByZip(zip) {
  const url = `https://api.census.gov/data/2022/acs/acs5?get=B19013_001E,NAME&for=zip%20code%20tabulation%20area:${encodeURIComponent(zip)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Census error');
  const rows = await r.json();
  if (!Array.isArray(rows) || rows.length < 2) return null;
  const [val, name] = rows[1];
  const n = parseFloat(val);
  return Number.isFinite(n) ? { name, value: n } : null;
}

/* ----------------------- Micro UI ----------------------- */
const Section = ({ title, right, children }) => /*#__PURE__*/
React.createElement("section", { className: "card p-4 mb-4" }, /*#__PURE__*/
React.createElement("header", { className: "flex items-center justify-between mb-3" }, /*#__PURE__*/
React.createElement("h2", { className: "text-lg font-semibold" }, title),
right),

children);


const Field = ({ label, children, hint }) => /*#__PURE__*/
React.createElement("label", { className: "block space-y-1 relative" }, /*#__PURE__*/
React.createElement("span", { className: "text-sm font-medium flex items-center" }, /*#__PURE__*/
React.createElement("span", null, label),
hint && /*#__PURE__*/React.createElement(InfoHint, { text: hint })),

children);


function NumberInput({ value, onChange, step = "1", placeholder }) {
  return /*#__PURE__*/React.createElement("input", { type: "number", className: "field", value: Number.isFinite(value) ? value : '',
    step: step, placeholder: placeholder, onChange: e => onChange(parseFloat(e.target.value)) });
}
function CurrencyInput({ value, onChange, placeholder }) {
  const [t, setT] = useState(Number.isFinite(value) ? String(Math.round(value)) : '');
  useEffect(() => {if (Number.isFinite(value)) setT(String(Math.round(value)));}, [value]);
  const clean = s => s.replace(/[^\d.-]/g, '');
  return /*#__PURE__*/React.createElement("input", { className: "field", value: t ? money0(Number(clean(t))) : '', placeholder: placeholder,
    onChange: e => {const v = clean(e.target.value);setT(v);const n = Number(v);onChange(Number.isFinite(n) ? n : NaN);} });
}
function PercentInput({ value, onChange, placeholder, readOnly }) {
  return /*#__PURE__*/(
    React.createElement("div", { className: "relative" }, /*#__PURE__*/
    React.createElement("input", { type: "number", step: "0.1", className: "field pr-10",
      value: Number.isFinite(value) ? value : '', placeholder: placeholder,
      onChange: e => onChange(parseFloat(e.target.value)), readOnly: readOnly }), /*#__PURE__*/
    React.createElement("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" }, "%")));
}

/* Info (i) badge) */
function InfoHint({ text }) {
  const [open, setOpen] = useState(false);
  return /*#__PURE__*/(
    React.createElement("span", { className: "relative inline-block" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "info-btn", "aria-label": "Info", onClick: () => setOpen(o => !o) }, "i"),
    open && /*#__PURE__*/
    React.createElement("div", { className: "info-pop tooltip-panel p-3 text-xs text-slate-600", role: "tooltip" },
    text)));




}

/* ----------------------- Mortgage / Loan (+ 15y/ARM comparisons) ----------------------- */
function MortgageCalc({ placeholders }) {var _placeholders$loanAmo, _placeholders$mortgag;
  const [P, setP] = useState();
  const [APR, setAPR] = useState();
  const [Y, setY] = useState();

  const principalPH = (_placeholders$loanAmo = placeholders === null || placeholders === void 0 ? void 0 : placeholders.loanAmountPH) !== null && _placeholders$loanAmo !== void 0 ? _placeholders$loanAmo : 350000;
  const aprPH = (_placeholders$mortgag = placeholders === null || placeholders === void 0 ? void 0 : placeholders.mortgageAPRPH) !== null && _placeholders$mortgag !== void 0 ? _placeholders$mortgag : 6.25;
  const yearsPH = 30;

  const principalX = P !== null && P !== void 0 ? P : principalPH;
  const aprX = APR !== null && APR !== void 0 ? APR : aprPH;
  const yearsX = Y !== null && Y !== void 0 ? Y : yearsPH;

  const res = useMemo(() => loanPayment({ principal: principalX, apr: aprX, years: yearsX }), [principalX, aprX, yearsX]);

  // analysis controls
  const [mode, setMode] = useState('extra'); // 'extra' | 'refi' | 'lump'
  const [extra, setExtra] = useState(); // placeholder $0
  const extraPH = 0;

  const [elapsedY, setElapsedY] = useState();
  const [newAPR, setNewAPR] = useState();
  const [newYears, setNewYears] = useState();
  const [closingCosts, setClosingCosts] = useState();

  const [lumpAmt, setLumpAmt] = useState();
  const [lumpMonth, setLumpMonth] = useState();

  const baseSched = useMemo(() => buildSchedule({ principal: principalX, apr: aprX, years: yearsX }), [principalX, aprX, yearsX]);
  const extraSched = useMemo(() => mode !== 'extra' ? null :
  buildSchedule({ principal: principalX, apr: aprX, years: yearsX, extraMonthly: extra !== null && extra !== void 0 ? extra : extraPH }), [mode, principalX, aprX, yearsX, extra]);
  const lumpSched = useMemo(() => mode !== 'lump' ? null :
  buildSchedule({ principal: principalX, apr: aprX, years: yearsX, lumpMonth: lumpMonth || 0, lumpAmount: lumpAmt || 0 }), [mode, principalX, aprX, yearsX, lumpMonth, lumpAmt]);
  const refi = useMemo(() => {
    if (mode !== 'refi') return null;
    const kYears = elapsedY !== null && elapsedY !== void 0 ? elapsedY : 3;
    const nAPR = newAPR !== null && newAPR !== void 0 ? newAPR : Math.max(0, aprX - 0.5);
    const nYears = newYears !== null && newYears !== void 0 ? newYears : yearsX;
    const cc = closingCosts !== null && closingCosts !== void 0 ? closingCosts : 3000;

    const k = months(kYears || 0, true);
    const remain = remainingBalance({ principal: principalX, apr: aprX, years: yearsX, monthsElapsed: k });
    const newBalance = Math.max(0, remain + cc);
    const newLoan = loanPayment({ principal: newBalance, apr: nAPR, years: nYears });
    const currPayment = res.payment;
    const paymentDelta = currPayment - newLoan.payment;
    const breakEvenMonths = paymentDelta > 0 ? Math.ceil(cc / paymentDelta) : Infinity;

    // scenario curve
    const labels = [],baseData = [],altData = [];
    let b = principalX;const i = monthlyRate(aprX),A = res.payment,N = res.N;
    for (let m = 1; m <= N; m++) {
      const interest = b * i,principal = A - interest;b = Math.max(0, b - principal);
      if (m % 12 === 0 || m === 1 || m === N) {labels.push(m);baseData.push(Math.round(b));}
    }
    const map = {};
    let bb = principalX;
    for (let m = 1; m <= Math.min(k, N); m++) {
      const interest = bb * i,principal = A - interest;bb = Math.max(0, bb - principal);
      if (labels.includes(m)) map[m] = Math.round(bb);
    }
    let br = newBalance;const i2 = monthlyRate(nAPR),A2 = newLoan.payment;
    for (let m = 1; br > 0.01 && m <= 3600; m++) {
      const mo = k + m;
      const interest = br * i2,principal = A2 - interest;br = Math.max(0, br - principal);
      if (labels.includes(mo)) map[mo] = Math.round(br);
      if (mo >= labels[labels.length - 1]) break;
    }
    for (const m of labels) {var _map$m;altData.push((_map$m = map[m]) !== null && _map$m !== void 0 ? _map$m : null);}

    return { remain, newBalance, newLoan, currPayment, paymentDelta, breakEvenMonths, chart: { labels, baseData, altData } };
  }, [mode, principalX, aprX, yearsX, res.payment, res.N, elapsedY, newAPR, newYears, closingCosts]);

  const savings = useMemo(() => {
    if (mode === 'extra' && extraSched && (extra || 0) > 0) {
      return {
        months: baseSched.months - extraSched.months,
        interest: baseSched.totalInterest - extraSched.totalInterest
      };
    }
    if (mode === 'lump' && lumpSched && (lumpAmt || 0) > 0) {
      return {
        months: baseSched.months - lumpSched.months,
        interest: baseSched.totalInterest - lumpSched.totalInterest
      };
    }
    if (mode === 'refi' && refi) {
    const k = months(elapsedY || 0, true);
      let paid = 0;
      for (let i = 0; i < Math.min(k, baseSched.rows.length); i++) {
        paid += baseSched.rows[i].interest;
      }
      const totalInterest = paid + refi.newLoan.totalInterest;
      const totalMonths = k + refi.newLoan.N;
      return {
        months: baseSched.months - totalMonths,
        interest: baseSched.totalInterest - totalInterest
      };
    }
    return null;
  }, [mode, extraSched, lumpSched, refi, extra, lumpAmt, elapsedY, baseSched]);

  // chart
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const rates = (placeholders === null || placeholders === void 0 ? void 0 : placeholders.rates) || {}; // { m30, m15, arm5 }
  useEffect(() => {
    if (chartRef.current) {try {chartRef.current.destroy();} catch (_) {}chartRef.current = null;}
    if (!window.Chart || !canvasRef.current) return;

    try {
      const ctx = canvasRef.current.getContext('2d');

      const i = monthlyRate(aprX),N = res.N,payment = res.payment;
      let b = principalX,labels = [],baseData = [];
      for (let m = 1; m <= N; m++) {
        const interest = b * i,principal = payment - interest;
        b = Math.max(0, b - principal);
        if (m % 12 === 0 || m === 1 || m === N) {labels.push(m);baseData.push(Math.round(b));}
      }

      const balancesAt = (aprAlt, yearsAlt) => {
        const i2 = monthlyRate(aprAlt),A2 = pmt({ principal: principalX, apr: aprAlt, years: yearsAlt });
        let bb = principalX;const set = new Set(labels),map = {};
        const maxM = labels[labels.length - 1] || 0;
        for (let m = 1; m <= maxM; m++) {
          const interest = bb * i2,principal = A2 - interest;
          bb = Math.max(0, bb - principal);
          if (set.has(m)) map[m] = Math.round(bb);
          if (bb <= 0 && m > maxM) break;
        }
        return labels.map(m => {var _map$m2;return (_map$m2 = map[m]) !== null && _map$m2 !== void 0 ? _map$m2 : null;});
      };

      let scenarioData = labels.map(() => null);
      if (mode === 'extra' && extraSched) {
        const i2 = monthlyRate(aprX),pay2 = res.payment + (extra !== null && extra !== void 0 ? extra : 0);
        let bb = principalX;const map = {};const set = new Set(labels);
        for (let m = 1; m <= res.N; m++) {
          const interest = bb * i2,principal = pay2 - interest;bb = Math.max(0, bb - principal);
          if (set.has(m)) map[m] = Math.round(bb);
          if (bb <= 0) break;
        }
        scenarioData = labels.map(m => {var _map$m3;return (_map$m3 = map[m]) !== null && _map$m3 !== void 0 ? _map$m3 : null;});
      } else if (mode === 'lump' && lumpSched) {
        const i2 = monthlyRate(aprX),pay2 = res.payment;
        let bb = principalX;const map = {};const set = new Set(labels);
        if ((lumpMonth !== null && lumpMonth !== void 0 ? lumpMonth : null) === 0) {
          bb = Math.max(0, bb - (lumpAmt || 0));
        }
        for (let m = 1; m <= res.N; m++) {
          const interest = bb * i2;let principal = pay2 - interest;
          if (lumpMonth !== null && lumpMonth !== void 0 && m === lumpMonth) principal += lumpAmt || 0;
          bb = Math.max(0, bb - principal);
          if (set.has(m)) map[m] = Math.round(bb);
          if (bb <= 0) break;
        }
        scenarioData = labels.map(m => {var _map$m4;return (_map$m4 = map[m]) !== null && _map$m4 !== void 0 ? _map$m4 : null;});
      } else if (mode === 'refi' && refi !== null && refi !== void 0 && refi.chart) {
        labels = refi.chart.labels;
        baseData = refi.chart.baseData;
        scenarioData = refi.chart.altData;
      }

      const ds = [
      { label: 'Baseline balance', data: baseData, borderColor: '#0ea5e9', backgroundColor: 'transparent', tension: .15, pointRadius: 0 },
      { label: 'Analysis scenario', data: scenarioData, borderColor: '#10b981', backgroundColor: 'transparent', borderDash: [6, 4], tension: .15, pointRadius: 0 }];

      if (rates.m15) {
        ds.push({ label: '15-yr fixed (rate)', data: balancesAt(rates.m15, 15), borderColor: '#7c3aed', backgroundColor: 'transparent', tension: .15, pointRadius: 0, borderDash: [2, 2] });
      }
      if (rates.arm5) {
        ds.push({ label: '5/1 ARM (rate)', data: balancesAt(rates.arm5, yearsX), borderColor: '#475569', backgroundColor: 'transparent', tension: .15, pointRadius: 0, borderDash: [1, 3] });
      }

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: ds },
        options: { responsive: true, plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, pointStyle: 'line' } } }, scales: { y: { ticks: { callback: v => money0(v) } } } } });

    } catch (err) {console.warn('Chart skipped:', err);}
  }, [principalX, aprX, res.N, res.payment, mode, extra, lumpAmt, lumpMonth, refi, yearsX, rates.m15, rates.arm5]);

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Mortgage / Loan" }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-3 gap-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Principal" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: P, onChange: setP, placeholder: money0(principalPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "APR" }, /*#__PURE__*/React.createElement(PercentInput, { value: APR, onChange: setAPR, placeholder: String(aprPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Years" }, /*#__PURE__*/React.createElement(NumberInput, { value: Y, onChange: setY, step: "1", placeholder: String(yearsPH) }))), /*#__PURE__*/


    React.createElement("div", { className: "grid sm:grid-cols-3 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Monthly payment"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(res.payment))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Total paid"), /*#__PURE__*/React.createElement("div", null, money0(res.totalPaid))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Total interest"), /*#__PURE__*/React.createElement("div", null, money0(res.totalInterest)))), /*#__PURE__*/


    React.createElement("div", { className: "mt-4" }, /*#__PURE__*/React.createElement("canvas", { ref: canvasRef, height: "130" })), /*#__PURE__*/

    React.createElement("div", { className: "mt-6" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-medium mb-2" }, "Analysis"), /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-4 gap-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Type" }, /*#__PURE__*/
    React.createElement("select", { className: "field", value: mode, onChange: e => setMode(e.target.value) }, /*#__PURE__*/
    React.createElement("option", { value: "extra" }, "Extra monthly principal"), /*#__PURE__*/
    React.createElement("option", { value: "refi" }, "Refinance"), /*#__PURE__*/
    React.createElement("option", { value: "lump" }, "Lump-sum principal"))),



    mode === 'extra' && /*#__PURE__*/
    React.createElement(Field, { label: "Extra monthly" }, /*#__PURE__*/
    React.createElement(CurrencyInput, { value: extra, onChange: setExtra, placeholder: money0(0) })),



    mode === 'refi' && /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Field, { label: "Years elapsed on current" }, /*#__PURE__*/React.createElement(NumberInput, { value: elapsedY, onChange: setElapsedY, step: "0.5", placeholder: "3" })), /*#__PURE__*/
    React.createElement(Field, { label: "New APR" }, /*#__PURE__*/React.createElement(PercentInput, { value: newAPR, onChange: setNewAPR, placeholder: Math.max(0, aprX - 0.5).toFixed(2) })), /*#__PURE__*/
    React.createElement(Field, { label: "New term (years)" }, /*#__PURE__*/React.createElement(NumberInput, { value: newYears, onChange: setNewYears, step: "1", placeholder: String(yearsX) })), /*#__PURE__*/
    React.createElement(Field, { label: "Closing costs" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: closingCosts, onChange: setClosingCosts, placeholder: money0(3000) }))),



    mode === 'lump' && /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Field, { label: "Lump amount" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: lumpAmt, onChange: setLumpAmt, placeholder: money0(5000) })), /*#__PURE__*/
    React.createElement(Field, { label: "Apply at month" }, /*#__PURE__*/React.createElement(NumberInput, { value: lumpMonth, onChange: setLumpMonth, step: "1", placeholder: "24" }))),

    savings && /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-2 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Months saved"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, savings.months)), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Interest saved"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(savings.interest)))))
    )));






}

/* ----------------------- Down Payment vs Points ----------------------- */
function DownVsPoints() {
  const [homePrice, setHomePrice] = useState();
  const [baseApr, setBaseApr] = useState();
  const [termYears, setTermYears] = useState();
  const [cashAvailable, setCashAvailable] = useState();
  const [minDownPct, setMinDownPct] = useState();
  const [pmiAnnualPct, setPmiAnnualPct] = useState();
  const [rateReduction, setRateReduction] = useState();
  const [maxPoints, setMaxPoints] = useState();
  const [horizonYears, setHorizonYears] = useState();
  const [opportunityRate, setOpportunityRate] = useState();
  const [useOppForNPV, setUseOppForNPV] = useState(true);
  const [useOppAsAlt, setUseOppAsAlt] = useState(true);
  const [taxesOn, setTaxesOn] = useState(false);
  const [marginalTax, setMarginalTax] = useState();
  const [pointsTreatment, setPointsTreatment] = useState('amortize');
  const [allocation, setAllocation] = useState(50);
  const [showCurve, setShowCurve] = useState(false);

  const homePricePH = 350000;
  const baseAprPH = 6.25;
  const termYearsPH = 30;
  const cashAvailablePH = 50000;
  const minDownPctPH = 5;
  const pmiAnnualPH = 0.5;
  const rateReductionPH = 0.25;
  const maxPointsPH = 4;
  const horizonYearsPH = 7;
  const opportunityRatePH = 5;
  const marginalTaxPH = 24;

  const homePriceX = homePrice ?? homePricePH;
  const baseAprX = baseApr ?? baseAprPH;
  const termYearsX = termYears ?? termYearsPH;
  const cashAvailableX = cashAvailable ?? cashAvailablePH;
  const minDownPctX = minDownPct ?? minDownPctPH;
  const pmiAnnualPctX = pmiAnnualPct ?? pmiAnnualPH;
  const rateReductionX = rateReduction ?? rateReductionPH;
  const maxPointsX = maxPoints ?? maxPointsPH;
  const horizonYearsX = horizonYears ?? horizonYearsPH;
  const opportunityRateX = opportunityRate ?? opportunityRatePH;
  const marginalTaxX = marginalTax ?? marginalTaxPH;

  const termMonths = Math.max(1, Math.round(termYearsX * 12));
  const horizonMonths = Math.min(termMonths, Math.max(1, Math.round(horizonYearsX * 12)));
  const requiredMinDown = Math.max(0, homePriceX * (minDownPctX / 100));
  const minDownCap = Math.min(homePriceX, requiredMinDown);
  const extraCashRaw = cashAvailableX - minDownCap;
  const extraCash = Math.max(0, extraCashRaw);
  const maxExtraDown = Math.max(0, homePriceX - minDownCap);
  const insufficientCash = cashAvailableX + 1e-6 < minDownCap;
  const monthlyOpp = Math.max(0, opportunityRateX || 0) / 100 / 12;
  const monthlyDisc = useOppForNPV ? monthlyOpp : 0;
  const taxesEnabled = taxesOn && marginalTaxX > 0;

  useEffect(() => {
    if (extraCash <= 0 && allocation !== 0) setAllocation(0);
  }, [extraCash, allocation]);

  const analysis = useMemo(() => {
    if (insufficientCash) return null;

    const scenarioCache = new Map();

    const buildScenario = pctInput => {
      const pctClamped = Math.max(0, Math.min(pctInput, maxPointsX));
      const cacheKey = pctClamped.toFixed(3);
      if (scenarioCache.has(cacheKey)) return scenarioCache.get(cacheKey);

      let pct = pctClamped;
      if (!(extraCash > 0) || !(homePriceX > minDownCap)) pct = 0;

      let loan = Math.max(0, homePriceX - minDownCap);
      let extraDownUsed = 0;
      let pointsCost = 0;
      let downPayment = minDownCap;
      for (let iter = 0; iter < 40; iter++) {
        pointsCost = loan * pct / 100;
        if (pointsCost > extraCash + 1e-6) {
          pct = Math.max(0, pct - 0.01);
          continue;
        }
        extraDownUsed = Math.max(0, Math.min(extraCash - pointsCost, maxExtraDown));
        downPayment = Math.min(homePriceX, minDownCap + extraDownUsed);
        const newLoan = Math.max(0, homePriceX - downPayment);
        if (Math.abs(newLoan - loan) < 0.5) {
          loan = newLoan;
          break;
        }
        loan = newLoan;
      }
      pointsCost = loan * pct / 100;
      if (pointsCost > extraCash + 1e-6) {
        pct = extraCash > 0 && loan > 0 ? Math.floor((extraCash / loan) * 10000) / 100 : 0;
        pointsCost = loan * pct / 100;
      }
      extraDownUsed = Math.max(0, Math.min(extraCash - pointsCost, maxExtraDown));
      downPayment = Math.min(homePriceX, minDownCap + extraDownUsed);
      loan = Math.max(0, homePriceX - downPayment);
      const apr = Math.max(0.1, baseAprX - pct * rateReductionX);
      const schedInfo = buildDownVsPointsSchedule({ principal: loan, aprPct: apr, termMonths, pmiAnnualPct: pmiAnnualPctX, homePrice: homePriceX });
      const schedule = schedInfo.rows;
      const upfront = downPayment + pointsCost;
      const taxesConfig = { includeTaxes: taxesEnabled, marginalRate: marginalTaxX, pointsCost, termMonths, treatment: pointsTreatment };
      const npvRes = npvToHorizon({ upfront, schedule, horizonMonths, monthlyDisc, taxes: taxesConfig });
      let npvVal = npvRes.npv;
      if (useOppAsAlt && extraDownUsed > 0) {
        npvVal += monthlyOpp > 0 ? extraDownUsed * (1 - Math.pow(1 + monthlyOpp, -horizonMonths)) : 0;
      }
      const cumulative = [];
      const cumulativeTax = [];
      let cum = upfront;
      let cumTax = upfront;
      cumulative.push(cum);
      cumulativeTax.push(cumTax);
      for (let i = 0; i < horizonMonths; i++) {
        const row = schedule[i] || { total: 0 };
        cum += row.total;
        cumulative.push(cum);
        const taxCost = taxesEnabled ? (npvRes.monthlyFlowsTax[i] || 0) : row.total;
        cumTax += taxCost;
        cumulativeTax.push(cumTax);
      }
      const effApr = solveEffectiveApr({ loanAmount: loan, pointsCost, schedule, horizonMonths });
      const scenario = {
        pointsPct: pct,
        pointsCost,
        extraDown: extraDownUsed,
        unusedCash: Math.max(0, extraCash - pointsCost - extraDownUsed),
        downPayment,
        loanAmount: loan,
        apr,
        schedule,
        monthlyPayment: schedule[0] ? schedule[0].total : calcMonthlyPayment(loan, apr, termMonths),
        pmiOffMonth: schedInfo.pmiOffMonth,
        upfront,
        totalInterest: npvRes.totalInterest,
        totalInterestAfterTax: npvRes.totalInterestAfterTax,
        totalCash: npvRes.totalCash,
        npv: npvVal,
        cumulative,
        cumulativeTax,
        cashSharePoints: extraCash > 0 ? Math.min(1, pointsCost / extraCash) : 0,
        cashShareDown: extraCash > 0 ? Math.min(1, extraDownUsed / extraCash) : 0,
        effApr,
        taxesIncluded: taxesEnabled
      };
      scenarioCache.set(cacheKey, scenario);
      return scenario;
    };

    const scenarioFromShare = share => {
      const target = Math.max(0, Math.min(share, 1));
      const baseScenario = buildScenario(0);
      const maxScenario = buildScenario(maxPointsX);
      const maxPointsFeasible = maxScenario.pointsPct;
      if (!(extraCash > 0) || maxPointsFeasible <= 0) return baseScenario;
      if (target >= 0.999) return maxScenario;
      if (target <= 0.001) return baseScenario;
      let low = 0;
      let high = maxPointsFeasible;
      let best = baseScenario;
      let bestDiff = Math.abs(best.cashSharePoints - target);
      for (let iter = 0; iter < 40; iter++) {
        const mid = (low + high) / 2;
        const midScenario = buildScenario(mid);
        const diff = Math.abs(midScenario.cashSharePoints - target);
        if (diff < bestDiff - 1e-4) {
          best = midScenario;
          bestDiff = diff;
        }
        if (diff < 0.001) {
          best = midScenario;
          break;
        }
        if (midScenario.cashSharePoints > target) {
          high = mid;
        } else {
          low = mid;
        }
      }
      return best;
    };

    const scenarioA = buildScenario(0);
    const scenarioB = buildScenario(maxPointsX);
    const sliderScenario = scenarioFromShare(extraCash > 0 ? allocation / 100 : 0);
    const optimized = optimizeAllocation({ computeScenario: scenarioFromShare, steps: 200 }) || sliderScenario;

    const baseCum = (sliderScenario.taxesIncluded ? scenarioA.cumulativeTax : scenarioA.cumulative).slice(1);
    const customCum = (sliderScenario.taxesIncluded ? sliderScenario.cumulativeTax : sliderScenario.cumulative).slice(1);
    const breakevenIdx = sliderScenario.pointsPct > 0 ? breakevenMonth({ withPoints: customCum, noPoints: baseCum, horizonMonths }) : null;
    const breakeven = breakevenIdx !== null ? breakevenIdx + 1 : null;

    const ranked = [
      { id: 'All Extra → Down', npv: scenarioA.npv, scenario: scenarioA },
      { id: 'All Extra → Points', npv: scenarioB.npv, scenario: scenarioB },
      { id: 'Custom allocation', npv: sliderScenario.npv, scenario: sliderScenario },
      { id: 'Optimized', npv: optimized.npv, scenario: optimized }
    ].filter(x => Number.isFinite(x.npv));
    ranked.sort((a, b) => a.npv - b.npv);
    const best = ranked[0];
    const nextBest = ranked[1];

    return {
      scenarioA,
      scenarioB,
      sliderScenario,
      optimized,
      breakeven,
      summary: best && nextBest ? {
        label: best.id,
        delta: Math.max(0, nextBest.npv - best.npv)
      } : null
    };
  }, [allocation, extraCash, homePriceX, minDownCap, maxExtraDown, maxPointsX, baseAprX, rateReductionX, termMonths, pmiAnnualPctX, horizonMonths, taxesEnabled, marginalTaxX, pointsTreatment, monthlyDisc, useOppAsAlt, monthlyOpp, insufficientCash]);

  const scenarioA = analysis?.scenarioA;
  const scenarioB = analysis?.scenarioB;
  const scenarioC = analysis?.sliderScenario;
  const scenarioD = analysis?.optimized;
  const breakeven = analysis?.breakeven;

  const lineCanvasRef = useRef(null);
  const lineChartRef = useRef(null);
  const barCanvasRef = useRef(null);
  const barChartRef = useRef(null);

  const formatPct = pct => `${(pct * 100).toFixed(0)}%`;

  useEffect(() => {
    if (!scenarioC || insufficientCash) return;
    if (lineChartRef.current) { try { lineChartRef.current.destroy(); } catch (_) {} lineChartRef.current = null; }
    if (!window.Chart || !lineCanvasRef.current) return;
    try {
      const ctx = lineCanvasRef.current.getContext('2d');
      const useTax = scenarioC.taxesIncluded;
      const labels = Array.from({ length: (useTax ? scenarioC.cumulativeTax : scenarioC.cumulative).length }, (_, i) => i);
      const ds = [
        { label: 'All Extra → Down', data: useTax ? scenarioA.cumulativeTax : scenarioA.cumulative, borderColor: '#0ea5e9', backgroundColor: 'transparent', tension: 0.2, pointRadius: 0 },
        { label: 'All Extra → Points', data: useTax ? scenarioB.cumulativeTax : scenarioB.cumulative, borderColor: '#f97316', backgroundColor: 'transparent', tension: 0.2, pointRadius: 0 },
        { label: 'Custom allocation', data: useTax ? scenarioC.cumulativeTax : scenarioC.cumulative, borderColor: '#10b981', backgroundColor: 'transparent', tension: 0.2, pointRadius: 0, borderDash: [6, 3] }
      ];
      lineChartRef.current = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: ds },
        options: {
          responsive: true,
          plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, pointStyle: 'line' } } },
          scales: { y: { ticks: { callback: v => money0(v) } }, x: { title: { display: true, text: 'Months' } } }
        }
      });
    } catch (err) { console.warn('Chart skipped:', err); }
  }, [scenarioA, scenarioB, scenarioC, insufficientCash]);

  useEffect(() => {
    if (!scenarioC || insufficientCash) return;
    if (barChartRef.current) { try { barChartRef.current.destroy(); } catch (_) {} barChartRef.current = null; }
    if (!window.Chart || !barCanvasRef.current) return;
    try {
      const ctx = barCanvasRef.current.getContext('2d');
      const items = [
        { label: 'All Extra → Down', value: scenarioA.npv },
        { label: 'All Extra → Points', value: scenarioB.npv },
        { label: 'Custom allocation', value: scenarioC.npv },
        { label: 'Optimized', value: scenarioD.npv }
      ];
      barChartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: items.map(i => i.label),
          datasets: [{
            label: 'NPV to horizon',
            data: items.map(i => i.value),
            backgroundColor: items.map(i => i.label === 'Optimized' ? '#0f172a' : '#94a3b8')
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { ticks: { callback: v => money0(v) } } }
        }
      });
    } catch (err) { console.warn('Chart skipped:', err); }
  }, [scenarioA, scenarioB, scenarioC, scenarioD, insufficientCash]);

  const presetButtons = [
    { label: 'All Extra → Down', value: 0 },
    { label: 'All Extra → Points', value: 100 },
    { label: '50 / 50', value: 50 },
    { label: 'Optimizer', value: Math.round((analysis?.optimized ? analysis.optimized.cashSharePoints * 100 : allocation)) }
  ];

  const pointsShare = scenarioC ? scenarioC.cashSharePoints : 0;
  const downShare = scenarioC ? scenarioC.cashShareDown : 0;

  const summary = analysis?.summary;
  const horizonLabel = (horizonMonths / 12).toFixed(1).replace(/\.0$/, '');

  const tiles = scenarioC ? [
    { label: 'Monthly payment', value: money0(scenarioC.monthlyPayment) },
    { label: 'Total interest to horizon', value: money0(scenarioC.taxesIncluded ? scenarioC.totalInterestAfterTax : scenarioC.totalInterest) },
    { label: 'Total cash out to horizon', value: money0(scenarioC.totalCash) },
    { label: 'Breakeven for points', value: scenarioC.pointsPct > 0 ? (breakeven ? `${breakeven} mo` : '—') : '—' },
    { label: 'NPV to horizon', value: money0(scenarioC.npv) },
    { label: 'Effective APR to horizon', value: `${(scenarioC.effApr * 100).toFixed(2)}%` }
  ] : [];

  const pmiNote = scenarioC && pmiAnnualPctX > 0 ? (scenarioC.pmiOffMonth ? `PMI projected to drop in month ${scenarioC.pmiOffMonth}.` : 'PMI applies for the full horizon.') : null;

  return (
    <Section title="Down Payment vs Points — Cash Allocation Optimizer">
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold">Inputs</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Home price">
              <CurrencyInput value={homePrice} onChange={setHomePrice} placeholder={money0(homePricePH)} />
            </Field>
            <Field label="Base APR (before points)">
              <PercentInput value={baseApr} onChange={setBaseApr} placeholder={String(baseAprPH)} />
            </Field>
            <Field label="Loan term">
              <select
                className="field"
                value={termYears ?? termYearsPH}
                onChange={e => setTermYears(parseInt(e.target.value, 10))}
              >
                <option value="30">30</option>
                <option value="20">20</option>
                <option value="15">15</option>
              </select>
            </Field>
            <Field label="Cash available at closing">
              <CurrencyInput value={cashAvailable} onChange={setCashAvailable} placeholder={money0(cashAvailablePH)} />
            </Field>
            <Field label="Minimum down %">
              <PercentInput value={minDownPct} onChange={setMinDownPct} placeholder={String(minDownPctPH)} />
            </Field>
            <Field label="PMI annual rate" hint="applies until LTV ≤ 80%">
              <PercentInput value={pmiAnnualPct} onChange={setPmiAnnualPct} placeholder={String(pmiAnnualPH)} />
            </Field>
            <Field label="Rate reduction per point">
              <div className="space-y-1">
                <PercentInput value={rateReduction} onChange={setRateReduction} placeholder={String(rateReductionPH)} />
                <button type="button" className="text-xs underline" onClick={() => setShowCurve(s => !s)}>
                  edit curve
                </button>
              </div>
            </Field>
            <Field label="Max points purchasable">
              <NumberInput value={maxPoints} onChange={setMaxPoints} step="0.25" placeholder={String(maxPointsPH)} />
            </Field>
            <Field label="Horizon (years)">
              <NumberInput value={horizonYears} onChange={setHorizonYears} step="0.5" placeholder={String(horizonYearsPH)} />
            </Field>
            <Field label="Opportunity return / Discount rate">
              <PercentInput value={opportunityRate} onChange={setOpportunityRate} placeholder={String(opportunityRatePH)} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${useOppForNPV ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'} border px-3 py-1 rounded-full text-xs`}
              onClick={() => setUseOppForNPV(v => !v)}
            >
              {useOppForNPV ? 'Use as NPV discount ✓' : 'Use as NPV discount'}
            </button>
            <button
              type="button"
              className={`${useOppAsAlt ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'} border px-3 py-1 rounded-full text-xs`}
              onClick={() => setUseOppAsAlt(v => !v)}
            >
              {useOppAsAlt ? 'Use as alternative return ✓' : 'Use as alternative return'}
            </button>
          </div>
          {showCurve && (
            <p className="text-xs text-slate-600">
              Assumes a constant reduction per point. Adjust inputs to model your own pricing curve.
            </p>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taxes</span>
              <button
                type="button"
                className={`${taxesOn ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'} border px-3 py-1 rounded-full text-xs`}
                onClick={() => setTaxesOn(t => !t)}
              >
                {taxesOn ? 'On' : 'Off'}
              </button>
            </div>
            {taxesOn && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Marginal tax rate">
                  <PercentInput value={marginalTax} onChange={setMarginalTax} placeholder={String(marginalTaxPH)} />
                </Field>
                <Field label="Points tax treatment">
                  <select
                    className="field"
                    value={pointsTreatment}
                    onChange={e => setPointsTreatment(e.target.value)}
                  >
                    <option value="amortize">Amortize over loan</option>
                    <option value="deduct">Deduct in year 1</option>
                  </select>
                </Field>
              </div>
            )}
          </div>
        </div>
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold">Allocation</h3>
          <p className="text-sm text-slate-600">
            Cash after the required minimum down payment: {money0(extraCash)}
          </p>
          <input
            type="range"
            min="0"
            max="100"
            value={allocation}
            onChange={e => setAllocation(parseFloat(e.target.value))}
            disabled={extraCash <= 0}
            className="w-full accent-slate-900"
          />
          <div className="text-sm">
            <div>
              Points: {formatPct(pointsShare)} ({money0(scenarioC?.pointsCost ?? 0)})
            </div>
            <div>
              Extra down: {formatPct(downShare)} ({money0(scenarioC?.extraDown ?? 0)})
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {presetButtons.map(btn => (
              <button
                key={btn.label}
                type="button"
                className={`${allocation === btn.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'} border px-3 py-1 rounded-full text-xs`}
                onClick={() => setAllocation(btn.value)}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <h4 className="text-sm font-semibold">Scenarios (auto-calculated)</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-1">Scenario</th>
                  <th className="text-right p-1">Points</th>
                  <th className="text-right p-1">Extra down</th>
                  <th className="text-right p-1">Rate</th>
                  <th className="text-right p-1">Monthly</th>
                  <th className="text-right p-1">NPV</th>
                </tr>
              </thead>
              <tbody>
                {scenarioA && (
                  <tr className="border-t">
                    <td className="p-1">A. Down</td>
                    <td className="text-right p-1">{scenarioA.pointsPct.toFixed(2)}</td>
                    <td className="text-right p-1">{money0(scenarioA.extraDown)}</td>
                    <td className="text-right p-1">{`${scenarioA.apr.toFixed(3)}%`}</td>
                    <td className="text-right p-1">{money0(scenarioA.monthlyPayment)}</td>
                    <td className="text-right p-1">{money0(scenarioA.npv)}</td>
                  </tr>
                )}
                {scenarioB && (
                  <tr className="border-t">
                    <td className="p-1">B. Points</td>
                    <td className="text-right p-1">{scenarioB.pointsPct.toFixed(2)}</td>
                    <td className="text-right p-1">{money0(scenarioB.extraDown)}</td>
                    <td className="text-right p-1">{`${scenarioB.apr.toFixed(3)}%`}</td>
                    <td className="text-right p-1">{money0(scenarioB.monthlyPayment)}</td>
                    <td className="text-right p-1">{money0(scenarioB.npv)}</td>
                  </tr>
                )}
                {scenarioC && (
                  <tr className="border-t">
                    <td className="p-1">C. Custom</td>
                    <td className="text-right p-1">{scenarioC.pointsPct.toFixed(2)}</td>
                    <td className="text-right p-1">{money0(scenarioC.extraDown)}</td>
                    <td className="text-right p-1">{`${scenarioC.apr.toFixed(3)}%`}</td>
                    <td className="text-right p-1">{money0(scenarioC.monthlyPayment)}</td>
                    <td className="text-right p-1">{money0(scenarioC.npv)}</td>
                  </tr>
                )}
                {scenarioD && (
                  <tr className="border-t">
                    <td className="p-1">D. Optimized</td>
                    <td className="text-right p-1">{scenarioD.pointsPct.toFixed(2)}</td>
                    <td className="text-right p-1">{money0(scenarioD.extraDown)}</td>
                    <td className="text-right p-1">{`${scenarioD.apr.toFixed(3)}%`}</td>
                    <td className="text-right p-1">{money0(scenarioD.monthlyPayment)}</td>
                    <td className="text-right p-1">{money0(scenarioD.npv)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {insufficientCash ? (
            <div className="mt-4 p-4 border rounded-xl bg-amber-50 text-amber-800 text-sm">
              Insufficient cash for the minimum down payment.
            </div>
          ) : (
            <div className="card p-4 space-y-4 mt-4">
              <div className="grid sm:grid-cols-3 gap-3">
                {tiles.map(tile => (
                  <div key={tile.label} className="result">
                    <div className="text-xs text-slate-500">{tile.label}</div>
                    <div className="text-lg font-semibold">{tile.value}</div>
                  </div>
                ))}
              </div>
              {summary && (
                <p className="text-sm text-slate-600">
                  {`At a ${horizonLabel}-year horizon, ${summary.label} has the lowest NPV, beating the next option by ${money0(summary.delta)}.`}
                </p>
              )}
              {scenarioC && (
                <p className="text-xs text-slate-500">
                  Effective APR includes the impact of points versus cash kept for down payment.
                </p>
              )}
              {pmiNote && <p className="text-xs text-slate-500">{pmiNote}</p>}
              <div className="grid lg:grid-cols-2 gap-4">
                <canvas ref={lineCanvasRef} height="180" />
                <canvas ref={barCanvasRef} height="180" />
              </div>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>Assumes constant rate reduction per point unless edited.</li>
                <li>PMI drops when LTV ≤ 80% on scheduled amortization.</li>
                <li>Taxes toggles are modeling simplifications, not advice.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  );

}

/* ----------------------- Compound Interest ----------------------- */
function CompoundCalc() {
  const [principal, setPrincipal] = useState();
  const [monthly, setMonthly] = useState();
  const [ret, setRet] = useState();
  const [years, setYears] = useState();

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Compound Interest" }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-4 gap-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Starting amount" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: principal, onChange: setPrincipal, placeholder: money0(10000) })), /*#__PURE__*/
    React.createElement(Field, { label: "Monthly contribution" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: monthly, onChange: setMonthly, placeholder: money0(500) })), /*#__PURE__*/
    React.createElement(Field, { label: "Return (annual)" }, /*#__PURE__*/React.createElement(PercentInput, { value: ret, onChange: setRet, placeholder: "7" }), /*#__PURE__*/React.createElement(SourceNote, { url: "https://www.lazyportfolioetf.com/" })), /*#__PURE__*/
    React.createElement(Field, { label: "Years" }, /*#__PURE__*/React.createElement(NumberInput, { value: years, onChange: setYears, step: "1", placeholder: "30" }))), /*#__PURE__*/

    React.createElement(CompoundResults, { principal: principal, monthly: monthly, ret: ret, years: years })));


}
function CompoundResults({ principal, monthly, ret, years }) {
  const fv = useMemo(() => futureValue({
    principal: principal !== null && principal !== void 0 ? principal : 10000,
    monthly: monthly !== null && monthly !== void 0 ? monthly : 500,
    apr: ret !== null && ret !== void 0 ? ret : 7,
    years: years !== null && years !== void 0 ? years : 30 }),
  [principal, monthly, ret, years]);
  const contrib = (principal !== null && principal !== void 0 ? principal : 10000) + (monthly !== null && monthly !== void 0 ? monthly : 500) * months(years !== null && years !== void 0 ? years : 30);
  return /*#__PURE__*/(
    React.createElement("div", { className: "grid sm:grid-cols-3 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Projected value"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(fv))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Contributions total"), /*#__PURE__*/React.createElement("div", null, money0(contrib))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Growth"), /*#__PURE__*/React.createElement("div", null, money0(fv - contrib)))));


}

/* ----------------------- Retirement Goal ----------------------- */
function RetirementGoal() {
  const [goal, setGoal] = useState();
  const [current, setCurrent] = useState();
  const [years, setYears] = useState();
  const [ret, setRet] = useState();

  const req = useMemo(() => requiredMonthly({
    goal: goal !== null && goal !== void 0 ? goal : 1000000,
    principal: current !== null && current !== void 0 ? current : 50000,
    apr: ret !== null && ret !== void 0 ? ret : 7, years: years !== null && years !== void 0 ? years : 30 }),
  [goal, current, ret, years]);

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Retirement Savings Target" }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-4 gap-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Goal (future value)" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: goal, onChange: setGoal, placeholder: money0(1000000) })), /*#__PURE__*/
    React.createElement(Field, { label: "Current saved" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: current, onChange: setCurrent, placeholder: money0(50000) })), /*#__PURE__*/
    React.createElement(Field, { label: "Years" }, /*#__PURE__*/React.createElement(NumberInput, { value: years, onChange: setYears, step: "1", placeholder: "30" })), /*#__PURE__*/
    React.createElement(Field, { label: "Return (annual)" }, /*#__PURE__*/React.createElement(PercentInput, { value: ret, onChange: setRet, placeholder: "7" }), /*#__PURE__*/React.createElement(SourceNote, { url: "https://www.lazyportfolioetf.com/" }))), /*#__PURE__*/

    React.createElement("div", { className: "result mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "text-xs text-slate-500" }, "Required monthly contribution"), /*#__PURE__*/
    React.createElement("div", { className: "text-lg font-semibold" }, money0(req)))));



}

/* ----------------------- Debt Payoff (moved +Add button; placeholder = $0) ----------------------- */
function DebtPayoff() {
  const [debts, setDebts] = useState([{ name: 'Debt 1', balance: undefined, apr: undefined, min: undefined }]);
  const [extra, setExtra] = useState();

  const add = () => setDebts(d => [...d, { name: `Debt ${d.length + 1}`, balance: undefined, apr: undefined, min: undefined }]);
  const update = (i, k, v) => setDebts(d => d.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  const autoMinFor = balance => {
    const b = Number(balance) || 0;
    if (b <= 0) return 0;
    return Math.max(0.02 * b, 25); // 2% or $25
  };

  const simulate = (method, extraAmt = 0) => {
    let rows = debts.map(d => ({
      ...d,
      balance: +(d.balance || 0),
      apr: +(d.apr || 0),
      min: Number.isFinite(+d.min) ? +d.min : autoMinFor(d.balance) })).
    filter(d => d.balance > 0 && d.min >= 0);
    if (!rows.length) return { months: 0, totalInterest: 0, timeline: [] };

    let month = 0,totalInterest = 0,timeline = [];
    while (rows.length && month < 3600) {
      month++;
      rows.sort((a, b) => method === 'Avalanche' ? b.apr - a.apr || a.balance - b.balance : a.balance - b.balance || b.apr - a.apr);
      let budget = rows.reduce((s, d) => s + d.min, 0) + Math.max(0, extraAmt);
      for (const d of rows) {const i = monthlyRate(d.apr),interest = d.balance * i;d.balance += interest;totalInterest += interest;}
      for (const d of rows) {const pay = Math.min(budget > 0 ? d.min : 0, d.balance);d.balance -= pay;budget -= pay;}
      for (const d of rows) {if (budget <= 0) break;const pay = Math.min(budget, d.balance);d.balance -= pay;budget -= pay;}
      rows = rows.filter(d => d.balance > 0.01);
      timeline.push({ month, remaining: rows.reduce((s, d) => s + d.balance, 0) });
    }
    return { months: month, totalInterest, timeline };
  };

  const simAvalancheBase = useMemo(() => simulate('Avalanche', 0), [debts]);
  const simSnowballBase = useMemo(() => simulate('Snowball', 0), [debts]);
  const simAvalancheExtra = useMemo(() => simulate('Avalanche', extra || 0), [debts, extra]);
  const simSnowballExtra = useMemo(() => simulate('Snowball', extra || 0), [debts, extra]);

  const savingsAvalanche = useMemo(() => ({
    months: simAvalancheBase.months - simAvalancheExtra.months,
    interest: simAvalancheBase.totalInterest - simAvalancheExtra.totalInterest
  }), [simAvalancheBase, simAvalancheExtra]);

  const savingsSnowball = useMemo(() => ({
    months: simSnowballBase.months - simSnowballExtra.months,
    interest: simSnowballBase.totalInterest - simSnowballExtra.totalInterest
  }), [simSnowballBase, simSnowballExtra]);

  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (chartRef.current) {try {chartRef.current.destroy();} catch (_) {}chartRef.current = null;}
    if (!window.Chart || !canvasRef.current) return;
    try {
      const ctx = canvasRef.current.getContext('2d');
      const labels = simAvalancheBase.timeline.map(t => t.month);
      const data = simAvalancheBase.timeline.map(t => Math.round(t.remaining));
      chartRef.current = new Chart(ctx, { type: 'line',
        data: { labels, datasets: [{ data, borderColor: '#ef4444', fill: false, tension: .15, pointRadius: 0 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => money0(v) } } } } });

    } catch (err) {console.warn('Debt chart skipped:', err);}
  }, [simAvalancheBase.timeline]);

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Debt Payoff" }, /*#__PURE__*/

    React.createElement("div", { className: "grid sm:grid-cols-4 gap-2 text-xs font-medium text-slate-500 mt-3" }, /*#__PURE__*/
    React.createElement("div", null, "Debt"), /*#__PURE__*/React.createElement("div", null, "Balance"), /*#__PURE__*/React.createElement("div", null, "APR"), /*#__PURE__*/React.createElement("div", null, "Min. Payment")), /*#__PURE__*/



    React.createElement("div", { className: "grid gap-3" },
    debts.map((d, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "pt-3 border-t border-slate-200" }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-4 gap-2" }, /*#__PURE__*/
    React.createElement("input", { className: "field", value: d.name, onChange: e => update(i, 'name', e.target.value), placeholder: "e.g., Card A" }), /*#__PURE__*/
    React.createElement(CurrencyInput, { value: d.balance, onChange: v => update(i, 'balance', v), placeholder: money0(3500) }), /*#__PURE__*/
    React.createElement(PercentInput, { value: d.apr, onChange: v => update(i, 'apr', v), placeholder: "21.9" }), /*#__PURE__*/
    React.createElement(CurrencyInput, { value: d.min, onChange: v => update(i, 'min', v), placeholder: money0(autoMinFor(d.balance)) }))))), /*#__PURE__*/






    React.createElement("div", { className: "mt-3" }, /*#__PURE__*/
    React.createElement("button", { className: "kbd", type: "button", onClick: add }, "+ Add debt")), /*#__PURE__*/



    React.createElement("div", { className: "mt-4 result" }, /*#__PURE__*/
    React.createElement("canvas", { ref: canvasRef, height: "180" })), /*#__PURE__*/

    React.createElement("div", { className: "grid sm:grid-cols-2 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Avalanche"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, simAvalancheBase.months.toLocaleString(), " mo"), /*#__PURE__*/React.createElement("div", null, money0(simAvalancheBase.totalInterest), " interest"), /*#__PURE__*/React.createElement("p", { className: "text-xs text-slate-600 mt-1" }, "Focus highest APR first — mathematically most efficient.")), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Snowball"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, simSnowballBase.months.toLocaleString(), " mo"), /*#__PURE__*/React.createElement("div", null, money0(simSnowballBase.totalInterest), " interest"), /*#__PURE__*/React.createElement("p", { className: "text-xs text-slate-600 mt-1" }, "Focus smallest balance first — faster psychological wins."))), /*#__PURE__*/
    React.createElement("div", { className: "mt-4" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2" }, /*#__PURE__*/
    React.createElement("span", { className: "ml-auto" }, /*#__PURE__*/
    React.createElement("label", { className: "mr-2 text-slate-600" }, "Extra monthly"), /*#__PURE__*/React.createElement(CurrencyInput, { value: extra, onChange: setExtra, placeholder: money0(0) }))),
    extra > 0 && /*#__PURE__*/React.createElement("div", { className: "grid sm:grid-cols-2 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Avalanche + extra"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, simAvalancheExtra.months.toLocaleString(), " mo"), /*#__PURE__*/React.createElement("div", null, money0(simAvalancheExtra.totalInterest), " interest"), /*#__PURE__*/React.createElement("div", { className: "text-xs font-bold mt-1" }, `Saved ${savingsAvalanche.months} mo & ${money0(savingsAvalanche.interest)} interest`)), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Snowball + extra"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, simSnowballExtra.months.toLocaleString(), " mo"), /*#__PURE__*/React.createElement("div", null, money0(simSnowballExtra.totalInterest), " interest"), /*#__PURE__*/React.createElement("div", { className: "text-xs font-bold mt-1" }, `Saved ${savingsSnowball.months} mo & ${money0(savingsSnowball.interest)} interest`)))),
    !simAvalancheBase.timeline.length && React.createElement("p", { className: "text-xs text-slate-600 mt-2" }, "Add at least one debt with a balance to simulate.")));


}

/* ----------------------- Auto: Affordability + Lease vs Buy ----------------------- */
function AutoTools() {
  const [budget, setBudget] = useState();
  const [apr, setApr] = useState();
  const [years, setYears] = useState();

  const bPH = 450,aprPH = 6.5,yPH = 5;
  const budgetX = budget !== null && budget !== void 0 ? budget : bPH,aprX = apr !== null && apr !== void 0 ? apr : aprPH,yearsX = years !== null && years !== void 0 ? years : yPH;

  const principal = useMemo(() => {
    const i = monthlyRate(aprX),N = months(yearsX);
    if (i === 0) return budgetX * N;
    return budgetX * (1 - Math.pow(1 + i, -N)) / i;
  }, [budgetX, aprX, yearsX]);

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Auto \u2014 Affordability & Lease vs Buy" }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-3 gap-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Monthly budget" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: budget, onChange: setBudget, placeholder: money0(bPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Loan APR" }, /*#__PURE__*/React.createElement(PercentInput, { value: apr, onChange: setApr, placeholder: String(aprPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Loan years" }, /*#__PURE__*/React.createElement(NumberInput, { value: years, onChange: setYears, step: "1", placeholder: String(yPH) }))), /*#__PURE__*/

    React.createElement("div", { className: "result mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "text-xs text-slate-500" }, "Approx. max loan principal"), /*#__PURE__*/
    React.createElement("div", { className: "text-lg font-semibold" }, money0(principal))), /*#__PURE__*/


    React.createElement(LeaseVsBuy, null)));


}
function LeaseVsBuy() {
  const [price, setPrice] = useState();
  const [down, setDown] = useState();
  const [term, setTerm] = useState();
  const [residPct, setResidPct] = useState();
  const [mf, setMf] = useState();
  const [loanApr, setLoanApr] = useState();
  const [loanYears, setLoanYears] = useState();
  const [taxRate, setTaxRate] = useState();

  const pricePH = 40000;
  const downPH = Math.round((price !== null && price !== void 0 ? price : pricePH) * 0.1);
  const termPH = 36;
  const residPH = 60;
  const mfPH = 0.00125; // ≈3% APR (APR ≈ MF×2400)
  const loanAprPH = 6.0;
  const loanYearsPH = 5;
  const taxPH = 6.0;

  const priceX = price !== null && price !== void 0 ? price : pricePH;
  const downX = down !== null && down !== void 0 ? down : downPH;
  const termX = term !== null && term !== void 0 ? term : termPH;
  const residX = residPct !== null && residPct !== void 0 ? residPct : residPH;
  const mfX = mf !== null && mf !== void 0 ? mf : mfPH;
  const loanAprX = loanApr !== null && loanApr !== void 0 ? loanApr : loanAprPH;
  const loanYearsX = loanYears !== null && loanYears !== void 0 ? loanYears : loanYearsPH;
  const taxX = taxRate !== null && taxRate !== void 0 ? taxRate : taxPH;

  const lease = useMemo(() => {
    const residual = priceX * (residX / 100);
    const adjCap = priceX - downX;
    const base = (adjCap - residual) / termX + (adjCap + residual) * mfX;
    const monthly = base * (1 + taxX / 100);
    const totalOut = monthly * termX + downX;
    return { monthly, totalOut };
  }, [priceX, downX, residX, mfX, termX, taxX]);

  const buy = useMemo(() => {
    const loanAmt = Math.max(0, priceX - downX);
    const loan = loanPayment({ principal: loanAmt, apr: loanAprX, years: loanYearsX });
    const rem = remainingBalance({ principal: loanAmt, apr: loanAprX, years: loanYearsX, monthsElapsed: termX });
    const valueAtH = priceX * (residX / 100);
    const equity = valueAtH - rem;
    const outflows = downX + loan.payment * termX;
    const netCost = outflows - equity;
    return { monthly: loan.payment, netCost };
  }, [priceX, downX, loanAprX, loanYearsX, termX, residX]);

  const cheaper = buy.netCost < lease.totalOut ? 'Buying' : 'Leasing';

  return /*#__PURE__*/(
    React.createElement("div", { className: "mt-6" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-medium mb-2" }, "Lease vs Buy (simple)"), /*#__PURE__*/
    React.createElement("div", { className: "grid md:grid-cols-2 gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "card p-4" }, /*#__PURE__*/
    React.createElement("h4", { className: "font-semibold mb-2" }, "Inputs"), /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-2 gap-2" }, /*#__PURE__*/
    React.createElement(Field, { label: "Price (MSRP/negotiated)" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: price, onChange: setPrice, placeholder: money0(pricePH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Down / cap reduction", hint: "Upfront cash. For leases, reduces the amount you\u2019re financing (cap cost). Placeholder \u224810% of price." }, /*#__PURE__*/
    React.createElement(CurrencyInput, { value: down, onChange: setDown, placeholder: money0(downPH) })), /*#__PURE__*/

    React.createElement(Field, { label: "Term (months)" }, /*#__PURE__*/React.createElement(NumberInput, { value: term, onChange: setTerm, step: "1", placeholder: String(termPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Residual % (lease)", hint: "Expected value at lease-end as % of MSRP. Placeholder 60% is common for 36-month mainstream leases." }, /*#__PURE__*/
    React.createElement(PercentInput, { value: residPct, onChange: setResidPct, placeholder: String(residPH) })), /*#__PURE__*/

    React.createElement(Field, { label: "Money factor (lease)", hint: "Lease finance rate (monthly). Convert to APR \u2248 MF\xD72400. Placeholder 0.00125 \u2248 3% APR." }, /*#__PURE__*/
    React.createElement("input", { className: "field", type: "number", step: "0.00001", value: Number.isFinite(mf) ? mf : '', placeholder: String(mfPH), onChange: e => setMf(parseFloat(e.target.value)) })), /*#__PURE__*/

    React.createElement(Field, { label: "Loan APR (buy)" }, /*#__PURE__*/React.createElement(PercentInput, { value: loanApr, onChange: setLoanApr, placeholder: String(loanAprPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Loan years (buy)" }, /*#__PURE__*/React.createElement(NumberInput, { value: loanYears, onChange: setLoanYears, step: "1", placeholder: String(loanYearsPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Sales tax" }, /*#__PURE__*/React.createElement(PercentInput, { value: taxRate, onChange: setTaxRate, placeholder: String(taxPH) })))), /*#__PURE__*/



    React.createElement("div", { className: "card p-4" }, /*#__PURE__*/
    React.createElement("h4", { className: "font-semibold mb-2" }, "Results"), /*#__PURE__*/
    React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Lease \u2014 monthly"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(lease.monthly))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Buy \u2014 monthly"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(buy.monthly))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Lease total (term)"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(lease.totalOut))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Buy net cost (term)"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(buy.netCost)))), /*#__PURE__*/

    React.createElement("div", { className: "result mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "text-sm" }, "At this horizon, ", /*#__PURE__*/React.createElement("span", { className: "font-semibold" }, cheaper), " looks cheaper.")), /*#__PURE__*/

    React.createElement("p", { className: "text-xs text-slate-600 mt-3" }, "Leasing is like ", /*#__PURE__*/
    React.createElement("em", null, "renting"), " a car: lower monthly, but you return it and keep no equity. Buying can cost more per month, but if you can afford it, you build equity and can keep or sell later.")))));






}

/* ----------------------- Net Worth ----------------------- */
const ASSET_TYPES = [
'Cash', 'Taxable Brokerage', 'Retirement — Pretax', 'Retirement — Roth',
'Pension (PV)', 'HSA', 'Life Insurance (Cash Value)',
'Real Estate — Primary', 'Real Estate — Investment', 'Business Equity', 'Other'];

const DEBT_TYPES = [
'Mortgage — Primary', 'Mortgage — Investment', 'HELOC', 'Auto Loan',
'Student Loan', 'Credit Card', 'Personal Loan', 'Taxes Due', 'Other'];

const COLORS = {
  'Cash': '#10b981', 'Taxable Brokerage': '#0ea5e9', 'Retirement — Pretax': '#059669', 'Retirement — Roth': '#22c55e',
  'Pension (PV)': '#14b8a6', 'HSA': '#06b6d4', 'Life Insurance (Cash Value)': '#4ade80',
  'Real Estate — Primary': '#7c3aed', 'Real Estate — Investment': '#8b5cf6', 'Business Equity': '#0ea5e9', 'Other': '#64748b',
  'Mortgage — Primary': '#ef4444', 'Mortgage — Investment': '#f97316', 'HELOC': '#fb7185', 'Auto Loan': '#f59e0b',
  'Student Loan': '#f43f5e', 'Credit Card': '#dc2626', 'Personal Loan': '#ea580c', 'Taxes Due': '#e11d48' };

function NetWorth() {
  const [assets, setAssets] = useState([{ type: 'Cash', name: 'Checking', amt: undefined }]);
  const [liabs, setLiabs] = useState([{ type: 'Mortgage — Primary', name: 'Mortgage', amt: undefined }]);
  const addA = () => setAssets(a => [...a, { type: 'Other', name: `Asset ${a.length + 1}`, amt: undefined }]);
  const addL = () => setLiabs(l => [...l, { type: 'Other', name: `Liability ${l.length + 1}`, amt: undefined }]);
  const updA = (i, k, v) => setAssets(a => a.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const updL = (i, k, v) => setLiabs(a => a.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  const sumBy = rows => rows.reduce((m, r) => (m[r.type] = (m[r.type] || 0) + (Number(r.amt) || 0), m), {});
  const sumA = assets.reduce((s, x) => s + (Number(x.amt) || 0), 0);
  const sumL = liabs.reduce((s, x) => s + (Number(x.amt) || 0), 0);
  const nw = sumA - sumL;
  const aBy = sumBy(assets),lBy = sumBy(liabs);

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Net Worth" }, /*#__PURE__*/
    React.createElement("div", { className: "result mb-3" }, /*#__PURE__*/
    React.createElement("div", { className: "text-xs text-slate-500" }, "Net Worth"), /*#__PURE__*/
    React.createElement("div", { className: "text-lg font-semibold" }, money0(nw))), /*#__PURE__*/


    React.createElement("div", { className: "grid md:grid-cols-2 gap-4" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center justify-between mb-1" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-medium" }, "Assets"), /*#__PURE__*/
    React.createElement("button", { className: "kbd", onClick: addA }, "+ Add")), /*#__PURE__*/

    React.createElement("div", { className: "grid gap-2" },
    assets.map((a, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "grid md:grid-cols-4 gap-2" }, /*#__PURE__*/
    React.createElement("select", { className: "field md:col-span-1", value: a.type, onChange: e => updA(i, 'type', e.target.value) },
    ASSET_TYPES.map(t => /*#__PURE__*/React.createElement("option", { key: t }, t))), /*#__PURE__*/

    React.createElement("input", { className: "field md:col-span-2", value: a.name, onChange: e => updA(i, 'name', e.target.value), placeholder: "Name (e.g., 401k)" }), /*#__PURE__*/
    React.createElement(CurrencyInput, { value: a.amt, onChange: v => updA(i, 'amt', v), placeholder: money0(10000) }))))), /*#__PURE__*/




    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center justify-between mb-1" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-medium" }, "Liabilities"), /*#__PURE__*/
    React.createElement("button", { className: "kbd", onClick: addL }, "+ Add")), /*#__PURE__*/

    React.createElement("div", { className: "grid gap-2" },
    liabs.map((a, i) => /*#__PURE__*/
    React.createElement("div", { key: i, className: "grid md:grid-cols-4 gap-2" }, /*#__PURE__*/
    React.createElement("select", { className: "field md:col-span-1", value: a.type, onChange: e => updL(i, 'type', e.target.value) },
    DEBT_TYPES.map(t => /*#__PURE__*/React.createElement("option", { key: t }, t))), /*#__PURE__*/

    React.createElement("input", { className: "field md:col-span-2", value: a.name, onChange: e => updL(i, 'name', e.target.value), placeholder: "Name (e.g., Visa)" }), /*#__PURE__*/
    React.createElement(CurrencyInput, { value: a.amt, onChange: v => updL(i, 'amt', v), placeholder: money0(5000) })))))), /*#__PURE__*/






    React.createElement("div", { className: "grid md:grid-cols-2 gap-4 mt-4" }, /*#__PURE__*/
    React.createElement("div", { className: "card p-4" }, /*#__PURE__*/
    React.createElement("h4", { className: "font-semibold mb-2" }, "Assets \u2014 Breakdown"), /*#__PURE__*/
    React.createElement("table", { className: "bs-table" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Category"), /*#__PURE__*/React.createElement("th", null, "Amount"))), /*#__PURE__*/
    React.createElement("tbody", null,
    Object.entries(aBy).map(([k, v]) => /*#__PURE__*/
    React.createElement("tr", { key: k, className: "bs-row" }, /*#__PURE__*/
    React.createElement("td", { className: "bs-cell" }, /*#__PURE__*/React.createElement("span", { className: "bs-dot", style: { backgroundColor: COLORS[k] || '#64748b' } }), k), /*#__PURE__*/
    React.createElement("td", { className: "bs-cell text-right" }, money0(v)))), /*#__PURE__*/


    React.createElement("tr", { className: "bs-row" }, /*#__PURE__*/React.createElement("td", { className: "bs-cell font-semibold" }, "Total Assets"), /*#__PURE__*/React.createElement("td", { className: "bs-cell text-right font-semibold" }, money0(sumA)))))), /*#__PURE__*/



    React.createElement("div", { className: "card p-4" }, /*#__PURE__*/
    React.createElement("h4", { className: "font-semibold mb-2" }, "Liabilities \u2014 Breakdown"), /*#__PURE__*/
    React.createElement("table", { className: "bs-table" }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Category"), /*#__PURE__*/React.createElement("th", null, "Amount"))), /*#__PURE__*/
    React.createElement("tbody", null,
    Object.entries(lBy).map(([k, v]) => /*#__PURE__*/
    React.createElement("tr", { key: k, className: "bs-row" }, /*#__PURE__*/
    React.createElement("td", { className: "bs-cell" }, /*#__PURE__*/React.createElement("span", { className: "bs-dot", style: { backgroundColor: COLORS[k] || '#64748b' } }), k), /*#__PURE__*/
    React.createElement("td", { className: "bs-cell text-right" }, money0(v)))), /*#__PURE__*/


    React.createElement("tr", { className: "bs-row" }, /*#__PURE__*/React.createElement("td", { className: "bs-cell font-semibold" }, "Total Liabilities"), /*#__PURE__*/React.createElement("td", { className: "bs-cell text-right font-semibold" }, money0(sumL)))))))));






}

/* ----------------------- Tax tab (2025) ----------------------- */
const FILING = ['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household'];
const STD_2025 = { 'Single': 15000, 'Married Filing Jointly': 30000, 'Married Filing Separately': 15000, 'Head of Household': 22500 };
const BRACKETS_2025 = {
  'Single': [[0, 0.10], [11925, 0.12], [48475, 0.22], [103350, 0.24], [197300, 0.32], [250525, 0.35], [626350, 0.37]],
  'Married Filing Jointly': [[0, 0.10], [23850, 0.12], [96950, 0.22], [206700, 0.24], [394600, 0.32], [501050, 0.35], [751600, 0.37]],
  'Married Filing Separately': [[0, 0.10], [11925, 0.12], [48475, 0.22], [103350, 0.24], [197300, 0.32], [250525, 0.35], [375800, 0.37]],
  'Head of Household': [[0, 0.10], [17000, 0.12], [64850, 0.22], [103350, 0.24], [197300, 0.32], [250500, 0.35], [626350, 0.37]] };

const LTCG_2025 = {
  'Single': { z0: 48350, z15: 533400 },
  'Married Filing Jointly': { z0: 96700, z15: 600050 },
  'Married Filing Separately': { z0: 48350, z15: 300000 },
  'Head of Household': { z0: 64750, z15: 566700 } };

// Payroll tax assumptions (employee share)
const SS_RATE = 0.062;
const SS_WAGE_BASE = 168600; // Social Security wage base (2024)
const MED_RATE = 0.0145;
const ADDL_MED_THRESHOLD = {
  'Single': 200000,
  'Married Filing Jointly': 250000,
  'Married Filing Separately': 125000,
  'Head of Household': 200000
};

const NO_TAX_STATES = new Set(['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY', 'NH']);
const FLAT_HINTS = { 'AZ': 2.5, 'CO': 4.4, 'ID': 5.8, 'IL': 4.95, 'IN': 3.05, 'KY': 4.0, 'MA': 5.0, 'MI': 4.25, 'MS': 5.0, 'NC': 4.5, 'ND': 2.5, 'PA': 3.07, 'UT': 4.65 };

function marginalTax(brackets, taxable) {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const [low, rate] = brackets[i];
    const high = i < brackets.length - 1 ? brackets[i + 1][0] - 1e-9 : Infinity;
    if (taxable > low) {
      const amt = Math.min(taxable, high) - low;
      tax += amt * rate;
    } else break;
  }
  return Math.max(0, tax);
}
function capitalGainsTax(status, taxableIncome, ltcg) {
  if (ltcg <= 0) return 0;
  const t = LTCG_2025[status] || LTCG_2025['Single'];
  const r0 = Math.max(0, Math.min(ltcg, Math.max(0, t.z0 - taxableIncome)));
  const r15 = Math.max(0, Math.min(ltcg - r0, Math.max(0, t.z15 - (taxableIncome + r0))));
  const r20 = Math.max(0, ltcg - r0 - r15);
  return r0 * 0 + r15 * 0.15 + r20 * 0.20;
}

// Load state income tax brackets from CSV files and calculate taxes on the
// client. This mirrors the server-side `calcStateTax` logic so the calculator
// works even when the API endpoint is unavailable (e.g. on static hosting).
const STATE_TAX_CACHE = { single: null, married: null };

async function loadStateTable(status) {
  const key = status === 'Married Filing Jointly' ? 'married' : 'single';
  if (STATE_TAX_CACHE[key]) return STATE_TAX_CACHE[key];
  const file =
    key === 'married'
      ? 'state%20taxes/state_taxes_married_joint_long.csv'
      : 'state%20taxes/state_taxes_single_long.csv';
  const res = await fetch(file);
  if (!res.ok) {
    throw new Error(`Failed to load state tax table: ${res.status}`);
  }
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/);
  lines.shift(); // header
  const data = {};
  for (const line of lines) {
    if (!line) continue;
    const [st, bracketIndex, threshold, rate] = line.split(',');
    if (!data[st]) data[st] = [];
    data[st].push({ threshold: Number(threshold), rate: Number(rate) });
  }
  for (const st of Object.keys(data)) {
    data[st].sort((a, b) => a.threshold - b.threshold);
  }
  STATE_TAX_CACHE[key] = data;
  return data;
}

async function calcStateTaxClient(state, status, income, overrideRate) {
  if (Number.isFinite(overrideRate)) {
    const tax = income > 0 ? income * overrideRate : 0;
    return { tax, effectiveRate: overrideRate };
  }
  if (status !== 'Single' && status !== 'Married Filing Jointly') {
    return { tax: 0, effectiveRate: 0, manual: true };
  }
  const table = await loadStateTable(status);
  const brackets = table[state];
  if (!brackets || income <= 0) return { tax: 0, effectiveRate: 0 };
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const { threshold, rate } = brackets[i];
    const upper = i < brackets.length - 1 ? brackets[i + 1].threshold - 1e-9 : Infinity;
    if (income > threshold) {
      const amt = Math.min(income, upper) - threshold;
      tax += amt * rate;
    } else {
      break;
    }
  }
  return { tax, effectiveRate: tax / income };
}
function getStateSuggestion(state) {
  if (NO_TAX_STATES.has(state)) return { rate: 0, msg: 'No wage income tax' };
  if (FLAT_HINTS[state]) return { rate: FLAT_HINTS[state], msg: 'Flat-rate state (typical)' };
  return { rate: 5.0, msg: 'Progressive state — tax rate increases with income.' };
}
function TaxCalc() {
  const [status, setStatus] = useState('Single');
  const [state, setState] = useState('TX');
  const [wages, setWages] = useState();
  const [otherInc, setOtherInc] = useState();
  const [ltcg, setLtcg] = useState();
  const [itemize, setItemize] = useState(false);
  const [itemDed, setItemDed] = useState();
  const [customRate, setCustomRate] = useState();
  const [useCustomRate, setUseCustomRate] = useState(false);
  const suggestion = useMemo(() => getStateSuggestion(state), [state]);
  const [stateResult, setStateResult] = useState({ rate: suggestion.rate, tax: 0 });
  const customRateForced = status === 'Married Filing Separately' || status === 'Head of Household';
  useEffect(() => {
    if (customRateForced) setUseCustomRate(true);
  }, [customRateForced]);
  const std = STD_2025[status];
  const wagesX = wages !== null && wages !== void 0 ? wages : 85000;
  const gross = wagesX + (otherInc !== null && otherInc !== void 0 ? otherInc : 0) + (ltcg !== null && ltcg !== void 0 ? ltcg : 0);
  const usingStdDed = itemize && Number.isFinite(itemDed) && itemDed < std;
  const deductions = itemize ? Math.max(Number.isFinite(itemDed) ? itemDed : 0, std) : std;
  const taxable = Math.max(0, gross - deductions);

  const ordTaxable = Math.max(0, taxable - (ltcg || 0));
  const fedOrd = marginalTax(BRACKETS_2025[status], ordTaxable);
  const fedCG = capitalGainsTax(status, ordTaxable, ltcg || 0);
  const fedTotal = fedOrd + fedCG;

  useEffect(() => {
    let canceled = false;
    async function calc() {
      if (!Number.isFinite(taxable)) {
        if (!canceled) setStateResult({ rate: suggestion.rate, tax: 0 });
        return;
      }
      try {
        const data = await calcStateTaxClient(
          state,
          status,
          taxable,
          useCustomRate && Number.isFinite(customRate) ? customRate / 100 : NaN
        );
        if (!canceled) setStateResult({ rate: data.effectiveRate * 100, tax: data.tax });
      } catch (e) {
        const rate = useCustomRate && Number.isFinite(customRate) ? customRate : suggestion.rate;
        if (!canceled) setStateResult({ rate, tax: Math.max(0, taxable) * (rate / 100) });
      }
    }
    calc();
    return () => { canceled = true; };
  }, [state, status, taxable, customRate, useCustomRate, suggestion]);

  const effStateRate = stateResult.rate;
  const stateTax = stateResult.tax;

  const ssTax = Math.min(wagesX, SS_WAGE_BASE) * SS_RATE;
  const medTax = wagesX * MED_RATE;
  const addlMedTax = Math.max(0, wagesX - ADDL_MED_THRESHOLD[status]) * 0.009;
  const ficaTax = ssTax + medTax + addlMedTax;
  const totalTax = fedTotal + stateTax + ficaTax;

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Taxes (2025)" }, /*#__PURE__*/
    React.createElement("div", { className: "grid md:grid-cols-2 gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "card p-4" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-semibold mb-3" }, "Inputs"), /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Filing status" }, /*#__PURE__*/
    React.createElement("select", { className: "field", value: status, onChange: e => setStatus(e.target.value) },
    FILING.map(f => /*#__PURE__*/React.createElement("option", { key: f }, f)))), /*#__PURE__*/


    React.createElement(Field, { label: "State (for estimate)" }, /*#__PURE__*/
    React.createElement("select", { className: "field", value: state, onChange: e => setState(e.target.value) },
    ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"].map(s => /*#__PURE__*/React.createElement("option", { key: s }, s)))), /*#__PURE__*/


    React.createElement(Field, { label: "Wages / ordinary income" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: wages, onChange: setWages, placeholder: money0(85000) })), /*#__PURE__*/
    React.createElement(Field, { label: "Other income" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: otherInc, onChange: setOtherInc, placeholder: money0(0) })), /*#__PURE__*/
    React.createElement(Field, { label: "Long-term cap gains / QD" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: ltcg, onChange: setLtcg, placeholder: money0(0) })), /*#__PURE__*/
    React.createElement(Field, { label: "Use itemized deduction?" }, /*#__PURE__*/
    React.createElement("select", { className: "field", value: itemize ? 'yes' : 'no', onChange: e => setItemize(e.target.value === 'yes') }, /*#__PURE__*/
    React.createElement("option", { value: "no" }, "No (use standard)"), /*#__PURE__*/
    React.createElement("option", { value: "yes" }, "Yes (enter amount)"))),


    itemize && /*#__PURE__*/
    React.createElement(Field, { label: "Itemized deduction" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: itemDed, onChange: setItemDed, placeholder: money0(20000) })),
    usingStdDed && /*#__PURE__*/React.createElement("p", { className: "text-xs text-slate-500 sm:col-span-2" }, "Standard deduction of ", money0(std), " is used since it exceeds your itemized amount."),

    !itemize && /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/
    React.createElement("div", { className: "text-xs text-slate-500" }, "Standard deduction"), /*#__PURE__*/
    React.createElement("div", { className: "text-lg font-semibold" }, money0(STD_2025[status]))))), /*#__PURE__*/




    React.createElement("div", { className: "card p-4" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-semibold mb-3" }, "State estimate"), /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/
    React.createElement("div", { className: "text-xs text-slate-500" }, "Effective state rate"), /*#__PURE__*/
    React.createElement("div", { className: "text-lg font-semibold" }, `${effStateRate.toFixed(2)}%`), /*#__PURE__*/
    React.createElement("div", { className: "text-xs text-slate-500" }, useCustomRate && Number.isFinite(customRate) ? 'Using override' : suggestion.msg)), /*#__PURE__*/
    React.createElement(Field, { label: "Manually enter rate" }, /*#__PURE__*/React.createElement("input", { type: "checkbox", className: "h-4 w-4", checked: useCustomRate, onChange: e => setUseCustomRate(e.target.checked), disabled: customRateForced })),
    customRateForced && /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500 sm:col-span-2" }, "State tax rate must be entered manually for this filing status; calculator currently supports only Single or Married Filing Jointly."),
    useCustomRate && /*#__PURE__*/React.createElement(Field, { label: "Override rate (%)" }, /*#__PURE__*/React.createElement(PercentInput, { value: customRate, onChange: setCustomRate, placeholder: suggestion.rate.toFixed(2) }))), /*#__PURE__*/

    React.createElement("p", { className: "text-xs text-slate-600 mt-2" }, "This is a simple effective-rate estimate (credits/AMT/NIIT not included)."), /*#__PURE__*/
    React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Source: ", /*#__PURE__*/React.createElement("a", { href: "https://taxfoundation.org/data/all/state/state-income-tax-rates/", target: "_blank", rel: "noreferrer", className: "underline" }, "Tax Foundation")))), /*#__PURE__*/





    React.createElement("div", { className: "grid md:grid-cols-2 gap-3 mt-4" }, /*#__PURE__*/
    React.createElement("div", { className: "result result-primary" }, /*#__PURE__*/React.createElement("div", { className: "text-xs opacity-75" }, "Taxable income"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(taxable))), /*#__PURE__*/
    React.createElement("div", { className: "result result-primary" }, /*#__PURE__*/React.createElement("div", { className: "text-xs opacity-75" }, "Total taxes"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(totalTax))), /*#__PURE__*/
    React.createElement("div", { className: "grid md:grid-cols-3 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result result-secondary" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Federal tax (est.)"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(fedTotal)), /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Ordinary: ", money0(fedOrd), " \xB7 LTCG/QD: ", money0(fedCG))), /*#__PURE__*/
    React.createElement("div", { className: "result result-secondary" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "State income tax (est.)"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(stateTax))), /*#__PURE__*/
    React.createElement("div", { className: "result result-secondary" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Other W-2 taxes (est.)"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(ficaTax)), /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "SS: ", money0(ssTax), " \xB7 Medicare: ", money0(medTax + addlMedTax)))))));



}

/* ----------------------- Home Affordability ----------------------- */
function HomeAffordability({ placeholders }) {var _placeholders$mortgag2;
  const [rent, setRent] = useState();
  const [apr, setApr] = useState();
  const [years, setYears] = useState();
  const [taxPct, setTaxPct] = useState();
  const [insPct, setInsPct] = useState();
  const [maintPct, setMaintPct] = useState();
  const [hoa, setHoa] = useState();
  const [downPct, setDownPct] = useState();
  const [income, setIncome] = useState();

  const rentPH = 2200;
  const aprPH = (_placeholders$mortgag2 = placeholders === null || placeholders === void 0 ? void 0 : placeholders.mortgageAPRPH) !== null && _placeholders$mortgag2 !== void 0 ? _placeholders$mortgag2 : 6.25;
  const yearsPH = 30;
  const taxPH = 1.2;
  const insPH = 0.35;
  const maintPH = 1.0;
  const hoaPH = 0;
  const downPH = 20;
  const incomePH = (rent !== null && rent !== void 0 ? rent : rentPH) * 12 / 0.30;

  const rentX = rent !== null && rent !== void 0 ? rent : rentPH;
  const aprX = apr !== null && apr !== void 0 ? apr : aprPH;
  const yearsX = years !== null && years !== void 0 ? years : yearsPH;
  const taxX = (taxPct !== null && taxPct !== void 0 ? taxPct : taxPH) / 100;
  const insX = (insPct !== null && insPct !== void 0 ? insPct : insPH) / 100;
  const maintX = (maintPct !== null && maintPct !== void 0 ? maintPct : maintPH) / 100;
  const hoaX = hoa !== null && hoa !== void 0 ? hoa : hoaPH;
  const downX = (downPct !== null && downPct !== void 0 ? downPct : downPH) / 100;
  const incomeX = income !== null && income !== void 0 ? income : incomePH;

  const i = monthlyRate(aprX),N = months(yearsX);
  const c = i === 0 ? 1 / N : i / (1 - Math.pow(1 + i, -N));
  const m = (taxX + insX + maintX) / 12;
  const denom = c * (1 - downX) + m;
  const homeValue = denom > 0 ? (rentX - hoaX) / denom : 0;
  const principal = homeValue * (1 - downX);
  const downPayment = homeValue * downX;
  const mortgagePayment = c * principal;
  const taxesMonthly = homeValue * taxX / 12;
  const insMonthly = homeValue * insX / 12;
  const maintMonthly = homeValue * maintX / 12;
  const totalMonthlyHousing = mortgagePayment + taxesMonthly + insMonthly + maintMonthly + hoaX;

  const dti = incomeX > 0 ? totalMonthlyHousing / (incomeX / 12) : 0;
  const userEnteredIncome = Number.isFinite(income);
  const userEnteredRent = Number.isFinite(rent);

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Home Affordability \u2014 Estimate Purchase Price From Rent" }, /*#__PURE__*/
    React.createElement("div", { className: "grid md:grid-cols-2 gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "card p-4" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-semibold mb-3" }, "Inputs"), /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Base rent (monthly)" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: rent, onChange: setRent, placeholder: money0(rentPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "APR (mortgage)" }, /*#__PURE__*/React.createElement(PercentInput, { value: apr, onChange: setApr, placeholder: String(aprPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Term (years)" }, /*#__PURE__*/React.createElement(NumberInput, { value: years, onChange: setYears, step: "1", placeholder: String(yearsPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Property tax (% of value/yr)" }, /*#__PURE__*/React.createElement(PercentInput, { value: taxPct, onChange: setTaxPct, placeholder: String(taxPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Insurance (% of value/yr)" }, /*#__PURE__*/React.createElement(PercentInput, { value: insPct, onChange: setInsPct, placeholder: String(insPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Maintenance (% of value/yr)" }, /*#__PURE__*/React.createElement(PercentInput, { value: maintPct, onChange: setMaintPct, placeholder: String(maintPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "HOA (monthly)" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: hoa, onChange: setHoa, placeholder: money0(hoaPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Down payment (%)" }, /*#__PURE__*/React.createElement(PercentInput, { value: downPct, onChange: setDownPct, placeholder: String(downPH) })), /*#__PURE__*/
    React.createElement(Field, { label: "Pretax income (annual)" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: income, onChange: setIncome, placeholder: money0(incomePH) }))), /*#__PURE__*/

    React.createElement("p", { className: "text-xs text-slate-600 mt-2" }, "Note: Property taxes and insurance vary widely by location. Use local values for best results.")), /*#__PURE__*/




    React.createElement("div", { className: "card p-4" }, /*#__PURE__*/
    React.createElement("h3", { className: "font-semibold mb-3" }, "Results"), /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Estimated home value"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(homeValue))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Down payment needed"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(downPayment))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Mortgage payment"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(mortgagePayment))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Taxes + Ins + Maint + HOA"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(taxesMonthly + insMonthly + maintMonthly + hoaX)))), /*#__PURE__*/

    React.createElement("div", { className: "grid sm:grid-cols-2 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Total monthly housing"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(totalMonthlyHousing))), /*#__PURE__*/
    React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Front-end DTI (housing / income)"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, (dti * 100).toFixed(1), "%"))),

    userEnteredIncome && userEnteredRent && /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-slate-600 mt-3" }, "Your housing DTI is ", /*#__PURE__*/
    React.createElement("strong", null, (dti * 100).toFixed(1), "%"), ", which means about ", money0(totalMonthlyHousing), " of your monthly income goes to housing. Lenders often target ", /*#__PURE__*/
    React.createElement("strong", null, "\u2264 28\u201331%"), " for housing DTI, and ", /*#__PURE__*/React.createElement("strong", null, "\u2264 36\u201343%"), " for total DTI.")))));






}

/* ----------------------- Social Security benefit comparison ----------------------- */
function SocialSecurity() {
  const [pia, setPia] = useState();
  const [piaPct, setPiaPct] = useState(75);
  const [showEst, setShowEst] = useState(false);
  const [estIncome, setEstIncome] = useState();

  const piaPH = 2000;
  const piaX = pia ?? piaPH;
  const piaPctX = piaPct ?? 75;

  const base = piaX * (piaPctX / 100);
  const factors = {62:0.70,63:0.75,64:0.80,65:0.867,66:0.933,67:1.00,68:1.08,69:1.16,70:1.24};
  const ages = Object.keys(factors).map(a => parseInt(a,10));
  const full = base * factors[67];
  const estPIA = useMemo(() => {
    const inc = estIncome || 0;
    if (!inc) return 0;
    const aime = inc / 12;
    const bend1 = 1174;
    const bend2 = 7078;
    let amt = Math.min(aime, bend1) * 0.9;
    if (aime > bend1) amt += Math.min(aime - bend1, bend2 - bend1) * 0.32;
    if (aime > bend2) amt += (aime - bend2) * 0.15;
    return amt;
  }, [estIncome]);

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Social Security Benefits" }, /*#__PURE__*/
      React.createElement("div", { className: "grid sm:grid-cols-2 gap-3" }, /*#__PURE__*/
        React.createElement(Field, { label: "PIA (monthly, FRA)", hint: "Primary Insurance Amount \u2014 your benefit at full retirement age." }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CurrencyInput, { value: pia, onChange: setPia, placeholder: money0(piaPH) }), /*#__PURE__*/React.createElement("button", { type: "button", className: "text-xs underline mt-1", onClick: () => setShowEst(o => !o) }, "Don't know my PIA?"))), /*#__PURE__*/
        React.createElement(Field, { label: "PIA %", hint: "Portion of your PIA you expect to collect; 75% is a conservative planning assumption." }, /*#__PURE__*/React.createElement(PercentInput, { value: piaPct, onChange: setPiaPct, placeholder: "75" }))),
      showEst && /*#__PURE__*/React.createElement("div", { className: "mt-3 p-3 border rounded-xl space-y-2", style: { background: 'var(--input-bg)' } }, /*#__PURE__*/
        React.createElement(Field, { label: "Average annual income" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: estIncome, onChange: setEstIncome, placeholder: money0(60000) })), /*#__PURE__*/
        React.createElement("div", { className: "flex items-center justify-between" }, /*#__PURE__*/React.createElement("div", { className: "text-sm" }, "Estimated PIA: ", money0(estPIA)), /*#__PURE__*/React.createElement("button", { type: "button", className: "kbd", onClick: () => { setPia(Math.round(estPIA)); setShowEst(false); } }, "Use value")), /*#__PURE__*/
        React.createElement("p", { className: "text-xs text-slate-500" }, "Simplified estimate using 2024 bend points.")), /*#__PURE__*/
      React.createElement("div", { className: "mt-4 overflow-x-auto" }, /*#__PURE__*/
        React.createElement("table", { className: "min-w-full text-sm" }, /*#__PURE__*/
          React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", { className: "text-left p-1" }, "Age"), /*#__PURE__*/React.createElement("th", { className: "text-right p-1" }, "Monthly"), /*#__PURE__*/React.createElement("th", { className: "text-right p-1" }, "vs 67"))), /*#__PURE__*/
          React.createElement("tbody", null, ages.map(age => { const amt = base * factors[age]; const diff = amt - full; return /*#__PURE__*/React.createElement("tr", { key: age, className: "border-t" }, /*#__PURE__*/React.createElement("td", { className: "p-1" }, age), /*#__PURE__*/React.createElement("td", { className: "text-right p-1" }, money0(amt)), /*#__PURE__*/React.createElement("td", { className: "text-right p-1" }, diff === 0 ? '\u2013' : (diff > 0 ? '+' : '') + money0(diff))); })))) , /*#__PURE__*/
      React.createElement("p", { className: "text-xs text-slate-500 mt-2" }, "Source: ", /*#__PURE__*/React.createElement("a", { className: "underline", href: "https://www.ssa.gov/oact/quickcalc/early_late.html", target: "_blank", rel: "noreferrer" }, "Social Security Administration"))));
}

/* ----------------------- Monte Carlo simulations ----------------------- */
function Simulations({ scenarioDefaults }) {
  const [scenario, setScenario] = useState('growth');
  const scenarioDef = scenarioDefaults[scenario];
  const [mode, setMode] = useState('simple');
  const [start, setStart] = useState();
  const [contrib, setContrib] = useState();
  const [goal, setGoal] = useState();
  const [withdraw, setWithdraw] = useState();
  const [years, setYears] = useState();
  const horizon = useMemo(() => horizonFromYears(Number(years) || 30), [years]);
  const horizonDef = HORIZON_DEFAULTS[horizon];
  const [profile, setProfile] = useState(DEFAULT_INVESTOR_PROFILE);
  const [lockMean, setLockMean] = useState(true);
  const [lockVol, setLockVol] = useState(true);
  const profileDefaults = useMemo(() => {
    const p = INVESTOR_PROFILES[profile];
    const h = horizon <= 5 ? 5 : horizon <= 10 ? 10 : 30;
    return { expectedReturn: p.returns[h], volatility: p.stddev[h] };
  }, [profile, horizon]);
  const [mean, setMean] = useState();
  const [vol, setVol] = useState();
  const [trials, setTrials] = useState(scenarioDef.trials);
  const [infl, setInfl] = useState(scenarioDef.infl);
  const [results, setResults] = useState(null);
  const [bestProfile, setBestProfile] = useState(null);
  const [chartMode, setChartMode] = useState('Histogram');
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const randomNormal = (mu = 0, sigma = 1) => {
    let u1 = Math.random();
    let u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mu + sigma * z0;
  };

  const run = () => {
    const yrs = Number(years ?? 30);
    const defaults = mode === 'advanced' ? profileDefaults : horizonDef;
    const m = ((mean ?? '') === '' ? defaults.expectedReturn : Number(mean)) / 100;
    const s = ((vol ?? '') === '' ? defaults.volatility : Number(vol)) / 100;
    const n = (trials ?? '') === '' ? scenarioDef.trials : Number(trials);
    const inf = ((infl ?? '') === '' ? scenarioDef.infl : Number(infl)) / 100;
    const startVal = Number(start ?? scenarioDef.start);
    const contribVal = Number(contrib ?? scenarioDef.contrib);
    const goalVal = scenario === 'growth' ? (Number.isFinite(goal) ? goal : scenarioDef.goal) : 0;
    const withdrawVal = Number(withdraw ?? scenarioDef.withdraw);
    const finals = [];
    let success = 0;
    let costBasis = startVal;
    for (let t = 0; t < n; t++) {
      let bal = startVal;
      let ok = true;
      for (let y = 0; y < yrs; y++) {
        const r = randomNormal(m, s);
        if (scenario === 'growth') {
          const c = mode === 'advanced' ? contribVal * Math.pow(1 + inf, y) : contribVal;
          if (t === 0) costBasis += c;
          bal = Math.max(0, (bal + c) * (1 + r));
        } else {
          const w = mode === 'advanced' ? withdrawVal * Math.pow(1 + inf, y) : withdrawVal;
          bal = bal * (1 + r) - w;
          if (bal <= 0) { ok = false; bal = 0; break; }
        }
      }
      if (scenario === 'growth') ok = bal >= goalVal;
      finals.push({ bal, ok });
      if (ok) success++;
    }
    finals.sort((a, b) => a.bal - b.bal);
    const pct = p => finals[Math.floor(p * finals.length)].bal;
    setResults({
      p10: pct(0.1),
      median: pct(0.5),
      p90: pct(0.9),
      success: success / n,
      data: finals,
      goal: goalVal,
      costBasis
    });

    // analyze best allocation across profiles
    const horizonVal = horizonFromYears(yrs);
    const h = horizonVal <= 5 ? 5 : horizonVal <= 10 ? 10 : 30;
    let best = null;
    Object.entries(INVESTOR_PROFILES).forEach(([k, p]) => {
      const m2 = p.returns[h] / 100;
      const s2 = p.stddev[h] / 100;
      let succ = 0;
      for (let t = 0; t < n; t++) {
        let bal = startVal;
        let ok = true;
        for (let y = 0; y < yrs; y++) {
          const r = randomNormal(m2, s2);
          if (scenario === 'growth') {
            const c = mode === 'advanced' ? contribVal * Math.pow(1 + inf, y) : contribVal;
            bal = Math.max(0, (bal + c) * (1 + r));
          } else {
            const w = mode === 'advanced' ? withdrawVal * Math.pow(1 + inf, y) : withdrawVal;
            bal = bal * (1 + r) - w;
            if (bal <= 0) { ok = false; bal = 0; break; }
          }
        }
        if (scenario === 'growth') ok = bal >= goalVal;
        if (ok) succ++;
      }
      const ratio = succ / n;
      if (!best || ratio > best.success) {
        best = { label: p.label, success: ratio };
      }
    });
    setBestProfile(best);
  };

  const renderHistogram = (ctx, data) => {
    const bins = 20;
    const max = Math.max(...data.map(d => d.bal));
    const min = Math.min(...data.map(d => d.bal));
    const step = (max - min) / bins || 1;
    const successCounts = Array(bins).fill(0);
    const failCounts = Array(bins).fill(0);
    data.forEach(({ bal, ok }) => {
      const idx = Math.min(bins - 1, Math.floor((bal - min) / step));
      if (ok) successCounts[idx]++; else failCounts[idx]++;
    });
    const labels = successCounts.map((_, i) => money0(min + step * i));
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Success', data: successCounts, backgroundColor: '#16a34a' },
          { label: 'Failure', data: failCounts, backgroundColor: '#dc2626' }
        ]
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        scales: { x: { stacked: true, display: false }, y: { stacked: true, ticks: { beginAtZero: true } } }
      }
    });
  };

  const renderGoal = (ctx, data, goal) => {
    let g = 0, y = 0, r = 0;
    data.forEach(({ bal, ok }) => {
      if (goal === 0) {
        if (ok) g++; else r++;
      } else if (bal >= goal) {
        g++;
      } else if (bal >= 0.9 * goal) {
        y++;
      } else {
        r++;
      }
    });
    const total = g + y + r;
    const segs = [];
    if (g) segs.push(g);
    if (y) segs.push(y);
    if (r) segs.push(r);
    const breakpoints = [];
    let acc = 0;
    for (let i = 0; i < segs.length - 1; i++) {
      acc += segs[i];
      breakpoints.push({ value: acc, label: `${(acc / total * 100).toFixed(0)}%` });
    }
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [''],
        datasets: [
          { label: 'Met goal', data: [g], backgroundColor: '#16a34a' },
          { label: goal > 0 ? '90% of goal' : 'Below goal', data: [y], backgroundColor: '#fbbf24' },
          { label: goal > 0 ? 'Below 90%' : 'Ran out', data: [r], backgroundColor: '#dc2626' }
        ]
      },
      options: {
        indexAxis: 'y',
        layout: { padding: { top: 20 } },
        scales: { x: { stacked: true, display: false }, y: { stacked: true, display: false } },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw} (${total ? (ctx.raw / total * 100).toFixed(1) : '0.0'}%)`
            }
          }
        }
      },
      plugins: [{
        id: 'goalBreakpoints',
        afterDatasetsDraw(chart) {
          const { ctx, chartArea, scales: { x } } = chart;
          ctx.save();
          ctx.strokeStyle = '#000';
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          breakpoints.forEach(bp => {
            const xPos = x.getPixelForValue(bp.value);
            ctx.beginPath();
            ctx.moveTo(xPos, chartArea.top);
            ctx.lineTo(xPos, chartArea.bottom);
            ctx.stroke();
            ctx.fillText(bp.label, xPos, chartArea.top - 4);
          });
          ctx.restore();
        }
      }]
    });
  };

  useEffect(() => {
    setStart();
    setContrib();
    setWithdraw();
    setTrials(scenarioDef.trials);
    setInfl(scenarioDef.infl);
  }, [scenario]);

  useEffect(() => {
    setMean(undefined);
    setVol(undefined);
    if (mode === 'advanced') {
      setProfile(DEFAULT_INVESTOR_PROFILE);
      setLockMean(true);
      setLockVol(true);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'advanced') {
      if (lockMean) setMean(profileDefaults.expectedReturn);
      if (lockVol) setVol(profileDefaults.volatility);
    }
  }, [mode, profileDefaults, lockMean, lockVol]);

  useEffect(() => {
    if (!results || !window.Chart || !canvasRef.current) return;
    if (chartRef.current) { try { chartRef.current.destroy(); } catch (_) {} }
    const ctx = canvasRef.current.getContext('2d');
    if (chartMode === 'Histogram') {
      chartRef.current = renderHistogram(ctx, results.data);
    } else {
      chartRef.current = renderGoal(ctx, results.data, results.goal);
    }
  }, [results, chartMode]);

  return /*#__PURE__*/React.createElement(React.Fragment, null,
    React.createElement(Section, { title: "Monte Carlo Simulations", right: /*#__PURE__*/React.createElement("select", { className: "field text-sm", value: chartMode, onChange: e => setChartMode(e.target.value) }, /*#__PURE__*/React.createElement("option", { value: "Histogram" }, "Histogram (ending balances)"), /*#__PURE__*/React.createElement("option", { value: "Goal" }, "Goal Attainment")) }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-3 gap-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Simulation" }, /*#__PURE__*/React.createElement("select", { className: "field", value: scenario, onChange: e => setScenario(e.target.value) }, /*#__PURE__*/React.createElement("option", { value: "growth" }, "Investment Growth"), /*#__PURE__*/React.createElement("option", { value: "retire" }, "Retirement Outcome"))), /*#__PURE__*/
    React.createElement(Field, { label: "Mode" }, /*#__PURE__*/React.createElement("div", { className: "inline-flex border rounded-lg overflow-hidden" }, /*#__PURE__*/React.createElement("button", { type: "button", className: (mode === 'simple' ? 'bg-slate-900 text-white ' : 'bg-white hover:bg-slate-50 ') + 'px-3 py-1 text-sm', onClick: () => setMode('simple') }, "Simple"), /*#__PURE__*/React.createElement("button", { type: "button", className: (mode === 'advanced' ? 'bg-slate-900 text-white ' : 'bg-white hover:bg-slate-50 ') + 'px-3 py-1 text-sm border-l', onClick: () => setMode('advanced') }, "Advanced"))), /*#__PURE__*/
    React.createElement(Field, { label: "Years" }, /*#__PURE__*/React.createElement(NumberInput, { value: years, onChange: setYears, step: "1", placeholder: "30" }))),

    scenario === 'growth' && /*#__PURE__*/React.createElement("div", { className: "grid sm:grid-cols-3 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Starting balance" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: start, onChange: setStart, placeholder: money0(scenarioDef.start) })), /*#__PURE__*/
    React.createElement(Field, { label: "Annual contribution" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: contrib, onChange: setContrib, placeholder: money0(scenarioDef.contrib) })), /*#__PURE__*/
    React.createElement(Field, { label: "Goal" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: goal, onChange: setGoal, placeholder: money0(scenarioDef.goal) })), /*#__PURE__*/
    mode === 'advanced' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Field, { label: 'Investor profile' }, /*#__PURE__*/React.createElement('select', { className: 'field', value: profile, onChange: e => setProfile(e.target.value) }, Object.entries(INVESTOR_PROFILES).map(([k, p]) => /*#__PURE__*/React.createElement('option', { key: k, value: k }, p.label)))), /*#__PURE__*/
    React.createElement(Field, { label: 'Expected return' }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement('div', { className: 'flex items-center gap-2' }, /*#__PURE__*/React.createElement(PercentInput, { value: mean, onChange: setMean, placeholder: String(profileDefaults.expectedReturn), readOnly: lockMean }), /*#__PURE__*/React.createElement('button', { type: 'button', className: 'text-xs', onClick: () => { if (lockMean) alert('Changing assumptions can yield unrealistic results.'); setLockMean(l => !l); } }, lockMean ? '🔒' : '🔓')), /*#__PURE__*/React.createElement(SourceNote, { url: 'https://www.lazyportfolioetf.com/' }))), /*#__PURE__*/
    React.createElement(Field, { label: 'Volatility' }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement('div', { className: 'flex items-center gap-2' }, /*#__PURE__*/React.createElement(PercentInput, { value: vol, onChange: setVol, placeholder: String(profileDefaults.volatility), readOnly: lockVol }), /*#__PURE__*/React.createElement('button', { type: 'button', className: 'text-xs', onClick: () => { if (lockVol) alert('Changing assumptions can yield unrealistic results.'); setLockVol(l => !l); } }, lockVol ? '🔒' : '🔓')), /*#__PURE__*/React.createElement(SourceNote, { url: 'https://www.lazyportfolioetf.com/' }))), /*#__PURE__*/
    React.createElement(Field, { label: '# Trials' }, /*#__PURE__*/React.createElement(NumberInput, { value: trials, onChange: setTrials, step: '1', placeholder: String(scenarioDef.trials) })), /*#__PURE__*/
    React.createElement(Field, { label: 'Inflation' }, /*#__PURE__*/React.createElement(PercentInput, { value: infl, onChange: setInfl, placeholder: String(scenarioDef.infl) })))),

    scenario === 'retire' && /*#__PURE__*/React.createElement("div", { className: "grid sm:grid-cols-3 gap-3 mt-3" }, /*#__PURE__*/
    React.createElement(Field, { label: "Starting balance" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: start, onChange: setStart, placeholder: money0(scenarioDef.start) })), /*#__PURE__*/
    React.createElement(Field, { label: "Annual withdrawal" }, /*#__PURE__*/React.createElement(CurrencyInput, { value: withdraw, onChange: setWithdraw, placeholder: money0(scenarioDef.withdraw) })), /*#__PURE__*/
    mode === 'advanced' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Field, { label: 'Investor profile' }, /*#__PURE__*/React.createElement('select', { className: 'field', value: profile, onChange: e => setProfile(e.target.value) }, Object.entries(INVESTOR_PROFILES).map(([k, p]) => /*#__PURE__*/React.createElement('option', { key: k, value: k }, p.label)))), /*#__PURE__*/
    React.createElement(Field, { label: 'Expected return' }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement('div', { className: 'flex items-center gap-2' }, /*#__PURE__*/React.createElement(PercentInput, { value: mean, onChange: setMean, placeholder: String(profileDefaults.expectedReturn), readOnly: lockMean }), /*#__PURE__*/React.createElement('button', { type: 'button', className: 'text-xs', onClick: () => { if (lockMean) alert('Changing assumptions can yield unrealistic results.'); setLockMean(l => !l); } }, lockMean ? '🔒' : '🔓')), /*#__PURE__*/React.createElement(SourceNote, { url: 'https://www.lazyportfolioetf.com/' }))), /*#__PURE__*/
    React.createElement(Field, { label: 'Volatility' }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement('div', { className: 'flex items-center gap-2' }, /*#__PURE__*/React.createElement(PercentInput, { value: vol, onChange: setVol, placeholder: String(profileDefaults.volatility), readOnly: lockVol }), /*#__PURE__*/React.createElement('button', { type: 'button', className: 'text-xs', onClick: () => { if (lockVol) alert('Changing assumptions can yield unrealistic results.'); setLockVol(l => !l); } }, lockVol ? '🔒' : '🔓')), /*#__PURE__*/React.createElement(SourceNote, { url: 'https://www.lazyportfolioetf.com/' }))), /*#__PURE__*/
    React.createElement(Field, { label: '# Trials' }, /*#__PURE__*/React.createElement(NumberInput, { value: trials, onChange: setTrials, step: '1', placeholder: String(scenarioDef.trials) })), /*#__PURE__*/
    React.createElement(Field, { label: 'Inflation' }, /*#__PURE__*/React.createElement(PercentInput, { value: infl, onChange: setInfl, placeholder: String(scenarioDef.infl) })))),

    React.createElement("div", { className: "mt-3" }, /*#__PURE__*/
    React.createElement("button", { className: "kbd", onClick: run }, "Run")),

    results && /*#__PURE__*/React.createElement("div", { className: "mt-4" }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-3 gap-3" }, /*#__PURE__*/
      scenario === 'growth' && /*#__PURE__*/React.createElement("div", { className: "result col-span-3" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Total cost basis (contributions)"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(results.costBasis))), /*#__PURE__*/
      React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "10th percentile"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(results.p10))), /*#__PURE__*/
      React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Median"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(results.median))), /*#__PURE__*/
      React.createElement("div", { className: "result" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "90th percentile"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, money0(results.p90))), /*#__PURE__*/
      /*#__PURE__*/React.createElement("div", { className: "result col-span-3" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Success chance"), /*#__PURE__*/React.createElement("div", { className: "text-lg font-semibold" }, (results.success * 100).toFixed(1), "%"))),
    bestProfile && /*#__PURE__*/React.createElement("div", { className: "mt-3" }, /*#__PURE__*/React.createElement("div", { className: "text-xs text-slate-500" }, "Best historical allocation"), /*#__PURE__*/React.createElement("div", { className: "text-sm" }, bestProfile.label, " (", (bestProfile.success * 100).toFixed(1), "% success)"), /*#__PURE__*/React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "This represents the historically optimal model based on the calculator's assumptions; however, past performance does not guarantee future results.")), /*#__PURE__*/
    React.createElement("canvas", { ref: canvasRef, height: "200", className: "mt-4" }), /*#__PURE__*/
    React.createElement("p", { className: "text-xs text-slate-600 mt-2" }, chartMode === 'Histogram' ? (scenario === 'growth' ? 'Histogram of final balances across simulations. Percentiles show optimistic and conservative scenarios.' : 'Histogram of ending balances. Success chance is the percentage of trials with money left.') : (scenario === 'growth' ? 'Goal attainment across simulations: green met the goal, yellow reached at least 90% of it, red fell short.' : 'Goal attainment across simulations: green ended with funds, red ran out.') ))),
    React.createElement("p", { className: "text-xs text-slate-500 mt-2" }, "Sources: ", /*#__PURE__*/React.createElement("a", { href: "#sim-src-1", className: "underline" }, "[1]")),
    React.createElement("ol", { className: "text-xs text-slate-500 list-decimal list-inside mt-1" }, /*#__PURE__*/
      React.createElement("li", { id: "sim-src-1" }, /*#__PURE__*/React.createElement("a", { className: "underline", href: "https://www.investopedia.com/terms/m/montecarlosimulation.asp", target: "_blank", rel: "noreferrer" }, "Investopedia \u2013 Monte Carlo Simulation"), " (free to read; \u00a9 Dotdash Meredith)."))
  );
}

/* ----------------------- Data panel (uses open ZIP + Census APIs) ----------------------- */
function DataPanel({ onPlaceholders }) {
  const [zip, setZip] = useLocalStorage('zip', '90210');
  const [area, setArea] = useState(null);
  const [home, setHome] = useState(null);
  const [income, setIncome] = useState(null);
  const [status, setStatus] = useState('');

  const refresh = async () => {
    setStatus('Fetching…');
    try {
      const [loc, hv, inc] = await Promise.all([
        fetchZip(zip).catch(_ => null),
        fetchMedianHomeValueByZip(zip).catch(_ => null),
        fetchMedianIncomeByZip(zip).catch(_ => null)
      ]);

      setArea(loc);
      setHome(hv);
      setIncome(inc);

      const mortgageAPRPH = 6.5;
      const loanAmountPH = hv && Number.isFinite(hv.value) ? hv.value * 0.8 : 350000;
      onPlaceholders?.({ mortgageAPRPH, loanAmountPH, zip, area: loc, home: hv, income: inc, rates: {} });
      setStatus('Updated ✅');
    } catch (e) {
      console.warn('Data load failed', e);
      setStatus('Fetch failed. Check inputs or try again.');
    }
  };

  useEffect(() => { refresh(); }, []);

  return /*#__PURE__*/(
    React.createElement(Section, { title: "Data (live placeholders)" }, /*#__PURE__*/
      React.createElement("div", { className: "grid md:grid-cols-2 gap-3" }, /*#__PURE__*/
        React.createElement(Field, { label: "ZIP (for home value)" }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
          React.createElement("input", { className: "field", value: zip, onChange: e => setZip(e.target.value), placeholder: "90210" }), /*#__PURE__*/
          React.createElement("a", { className: "text-xs underline block mt-1", href: "https://tools.usps.com/zip-code-lookup.htm", target: "_blank", rel: "noreferrer" }, "Find ZIP by city"))), /*#__PURE__*/
        React.createElement("div", { className: "flex items-end gap-2" }, /*#__PURE__*/
          React.createElement("button", { className: "kbd", onClick: refresh }, "Refresh"))), /*#__PURE__*/

      React.createElement("div", { className: "grid md:grid-cols-3 gap-3 mt-3" }, /*#__PURE__*/
        React.createElement("div", { className: "result" }, /*#__PURE__*/
          React.createElement("div", { className: "text-xs text-slate-500" }, "Median home value (ACS, ZIP)"), /*#__PURE__*/
          React.createElement("div", { className: "text-lg font-semibold" }, home && home.value ? money0(home.value) : '—'), /*#__PURE__*/
          React.createElement("div", { className: "text-xs text-slate-500" }, (home == null ? void 0 : home.name) || '')), /*#__PURE__*/

        React.createElement("div", { className: "result" }, /*#__PURE__*/
          React.createElement("div", { className: "text-xs text-slate-500" }, "Median household income (ACS, ZIP)"), /*#__PURE__*/
          React.createElement("div", { className: "text-lg font-semibold" }, income && income.value ? money0(income.value) : '—'), /*#__PURE__*/
          React.createElement("div", { className: "text-xs text-slate-500" }, (income == null ? void 0 : income.name) || '')), /*#__PURE__*/

        React.createElement("div", { className: "result" }, /*#__PURE__*/
          React.createElement("div", { className: "text-xs text-slate-500" }, "Location"), /*#__PURE__*/
          React.createElement("div", { className: "text-lg font-semibold" }, area ? `${area.city}, ${area.state}` : '—'))), /*#__PURE__*/

      React.createElement("div", { className: "result mt-3" }, /*#__PURE__*/
        React.createElement("div", { className: "text-xs text-slate-500" }, "Status"), /*#__PURE__*/
        React.createElement("div", { className: "text-sm" }, status)), /*#__PURE__*/

      React.createElement("p", { className: "text-xs text-slate-600 mt-2" }, "Tip: placeholders across tools update when you click Refresh."))
  );
}

/* --------------------------- Landing + Tabs --------------------------- */
const TABS = [
{ id: 'home', label: 'Home' },
{ id: 'mortgage', label: 'Mortgage' },
{ id: 'downpoints', label: 'Down vs Points', title: 'Allocate cash between down payment and discount points' },
{ id: 'compound', label: 'Compound' },
{ id: 'retire', label: 'Retirement' },
{ id: 'debt', label: 'Debt Payoff' },
{ id: 'auto', label: 'Auto' },
{ id: 'rent', label: 'Home Affordability' },
{ id: 'networth', label: 'Net Worth' },
{ id: 'tax', label: 'Tax' },
{ id: 'ss', label: 'Social Security' },
{ id: 'sim', label: 'Simulations' },
{ id: 'data', label: 'Data' }];

const CARDS = [
{ id: 'mortgage', title: 'Mortgage / Loan', why: 'Estimate payments and compare strategies like extra paydowns, refinancing, or lump sums.' },
{ id: 'downpoints', title: 'Down Payment vs Points', why: 'Decide how much cash to allocate between discount points and extra down payment.' },
{ id: 'compound', title: 'Compound Interest', why: 'Project investment growth over time with recurring contributions.' },
{ id: 'retire', title: 'Retirement Goal', why: 'Figure out the monthly savings needed to reach a future nest egg.' },
{ id: 'debt', title: 'Debt Payoff', why: 'Simulate paying multiple debts using avalanche or snowball methods.' },
{ id: 'auto', title: 'Auto Affordability', why: 'Estimate car budget, max loan, and compare leasing versus buying.' },
{ id: 'rent', title: 'Home Affordability', why: 'Derive an affordable purchase price and housing cost from your rent and expenses.' },
{ id: 'networth', title: 'Net Worth', why: 'Track assets and liabilities with a color-coded balance sheet.' },
{ id: 'tax', title: 'Taxes (2025)', why: 'Approximate federal and state income taxes with current brackets.' },
{ id: 'ss', title: 'Social Security', why: 'Compare benefits at different retirement ages.' },
{ id: 'sim', title: 'Simulations', why: 'Run Monte Carlo experiments for investment growth or retirement outcomes.' },
{ id: 'data', title: 'Data Sources', why: 'Load open ZIP-based data like home values to prefill placeholders.' }];

const FUN_FACTS = {
  mortgage: [
    'The word “mortgage” comes from Old French meaning “dead pledge.”',
    'Making biweekly payments can shave years off a 30-year mortgage.',
    'Paying extra principal early saves more interest than later payments.',
    'The first modern mortgage loans appeared in the 19th century.',
    'In many countries a 30-year fixed-rate loan is unique to the U.S.',
    'Paying one extra monthly payment per year can cut a 30-year mortgage to about 25 years.',
    'FHA loans often require as little as 3.5% down.',
    'Your mortgage payment typically includes principal, interest, taxes, and insurance (PITI).',
    'Some mortgages allow recasting after a large principal payment.',
    'The 15-year mortgage usually has lower rates than the 30-year.',
    'Private mortgage insurance (PMI) can be canceled once you have 20% equity.',
    'Adjustable-rate mortgages usually have a fixed period before rates adjust.',
    'The 2008 housing crisis was triggered by subprime mortgage defaults.',
    'Mortgages in Denmark can sometimes have negative interest rates.',
    'Early payoff penalties are less common today than in decades past.',
    'A mortgage note is a legal document pledging the property as collateral.',
    'In many U.S. states mortgages are non-recourse, meaning lenders can only take the house.',
    'VA loans for veterans often require no down payment.',
    'Mortgage-backed securities bundle many loans into investment products.',
    "Some buyers 'house hack' by renting spare rooms to help cover the mortgage."
  ],
  compound: [
    'Albert Einstein allegedly called compound interest the eighth wonder of the world.',
    'Rule of 72: divide 72 by an interest rate to estimate doubling time.',
    'A single penny doubled every day for 30 days grows past $5 million.',
    'Compounding more frequently than annually slightly increases returns.',
    'Time in the market often matters more than timing the market.',
    'Starting early allows more compounding periods and greater growth.',
    "Continuous compounding uses Euler's number e to calculate growth.",
    'At 7% annual return, investments roughly double every 10 years.',
    'Compound interest works against you with debt as well as for you with savings.',
    'Ben Franklin left money in trust that grew for 200 years via compounding.',
    'Stock dividends that are reinvested harness compound growth.',
    'Many retirement accounts compound tax-deferred.',
    'A 1% difference in return can lead to huge differences over decades.',
    'Interest compounded quarterly yields more than annually at the same APR.',
    'The compound interest formula is A = P(1 + r/n)^{nt}.',
    'Warren Buffett credits compound interest for much of his wealth.',
    'Compounding can be visualized with exponential curves.',
    'Bank savings accounts compound interest daily or monthly.',
    'Real estate values can compound through appreciation and reinvested profits.',
    'Credit card debt compounds interest on average daily.'
  ],
  retire: [
    'The concept of retirement only became common in the 20th century.',
    '401(k) plans were created in the U.S. tax code in 1978.',
    'Many advisors suggest saving at least 15% of income for retirement.',
    'Social Security originally paid benefits starting at age 65 in 1935.',
    'Retirees today can expect to spend 20 years or more in retirement.',
    'The FIRE movement aims for financial independence and early retirement.',
    'Traditional pensions have become less common in the private sector.',
    'Roth IRAs allow tax-free withdrawals in retirement.',
    'Healthcare often becomes one of the largest expenses for retirees.',
    'Required minimum distributions start at age 73 in the U.S.',
    'Many retirees downsize homes to reduce expenses.',
    'Social Security benefits increase the longer you delay claiming up to age 70.',
    'Retirees may spend more on travel in early retirement years.',
    'Some countries have mandatory retirement savings schemes.',
    'The 4% rule suggests withdrawing 4% of your portfolio annually.',
    'Women typically live longer and may need larger retirement savings.',
    'Many people pursue part-time work or hobbies for income in retirement.',
    'Compound interest is critical when saving for retirement early.',
    'Inflation can erode retirement income purchasing power.',
    'Longevity risk is the chance of outliving your savings.'
  ],
  debt: [
    'The snowball method builds momentum by tackling the smallest debt first.',
    'Avalanche pays off debt faster mathematically by targeting highest APRs.',
    'The average credit card APR in the U.S. is now above 20%.',
    'Paying just $50 extra each month can save thousands in interest.',
    'Debt snowball was popularized by radio host Dave Ramsey.',
    'Average U.S. household debt exceeds $100,000.',
    'Student loan debt in the U.S. totals over $1.7 trillion.',
    'Paying more than the minimum credit card payment reduces interest drastically.',
    'Debt-to-income ratio is a key metric for lenders.',
    'Consolidation loans can simplify multiple debts into one payment.',
    'Some states have statutes of limitations on how long debts can be collected.',
    'Bankruptcy can remain on credit reports for up to 10 years.',
    'The average American carries four credit cards.',
    'Interest on some debts like mortgages can be tax-deductible.',
    'Debt settlement can harm credit but reduce balances.',
    'Payday loans often carry APRs exceeding 400%.',
    'Credit scores factor in credit utilization, payment history, and more.',
    'Closing old credit accounts can temporarily lower credit scores.',
    'High debt levels can hinder ability to qualify for mortgages or car loans.',
    'The Fair Debt Collection Practices Act protects consumers from abusive tactics.'
  ],
  auto: [
    'A new car typically loses around 20% of its value in the first year.',
    'Lease money factors can be converted to APR by multiplying by 2400.',
    'Leasing often limits mileage to 10–15k miles per year.',
    'Average car loan terms have stretched to about 70 months.',
    'Electric vehicles have fewer moving parts than gas cars.',
    'The average new car price in the U.S. surpasses $48,000.',
    'Cars start depreciating the moment they drive off the lot.',
    'Hybrid vehicles can recapture energy through regenerative braking.',
    'Some states offer rebates for purchasing electric vehicles.',
    'GAP insurance covers the difference between a car\'s value and what you owe.',
    'Car insurance rates often drop after age 25.',
    'Maintenance costs increase significantly after 100,000 miles.',
    'Leasing usually requires returning the car in good condition or paying fees.',
    'Car subscriptions are emerging as an alternative to leasing or buying.',
    'The first speeding ticket was issued in 1902 at 45 mph.',
    'Horsepower originally referred to the power of a draft horse.',
    'Tires usually lose about 1 PSI of pressure per month.',
    'Automotive loans longer than 84 months are considered risky.',
    'Some modern cars have over 100 million lines of software code.',
    'A well-maintained vehicle can easily last over 200,000 miles.'
  ],
  rent: [
    'A common rule of thumb is to spend no more than 30% of income on housing.',
    'Property taxes can vary dramatically from one county to another.',
    'Homeowners in the U.S. move every 7 to 10 years on average.',
    'Mortgage preapproval letters can strengthen purchase offers.',
    'In some markets renting can be cheaper than owning even long term.',
    'Rent control laws exist in cities like New York and San Francisco.',
    'Landlords typically screen tenants with credit and background checks.',
    'Security deposits are often equal to one month\'s rent.',
    'Renters insurance is inexpensive and covers personal belongings.',
    'Some landlords offer rent discounts for long-term leases.',
    'Rent-to-own agreements let tenants apply rent toward purchase.',
    'The term "landlord" dates back to feudal times.',
    'Many leases require 30-day notice before moving out.',
    'Pet-friendly rentals may charge additional deposits or monthly fees.',
    'Online listings have replaced newspaper classifieds for rentals.',
    'Rent ratios compare the cost of renting vs buying in a market.',
    'Co-living spaces offer shared housing with individual leases.',
    'In some cities, vacant units pay higher taxes to deter speculation.',
    'Moving during winter can sometimes yield lower rent prices.',
    'Housing choice vouchers help low-income families pay rent.'
  ],
  networth: [
    'Net worth equals assets minus liabilities.',
    'Tracking net worth over time helps reveal financial progress.',
    'Many billionaires once had negative net worth due to heavy debt.',
    'The top 1% of U.S. households hold over $10 million in wealth.',
    'Emergency funds are counted as assets in net worth calculations.',
    'A positive net worth means assets exceed liabilities.',
    'Net worth can fluctuate with market changes daily.',
    'Tracking net worth monthly helps monitor financial health.',
    'High-net-worth individuals are often defined as having $1 million in liquid assets.',
    'Liabilities like mortgages decrease as you make payments, boosting net worth.',
    'Investing in appreciating assets can grow net worth over time.',
    'Depreciating assets like cars reduce net worth as they lose value.',
    'Some people track net worth using spreadsheets or apps.',
    "Net worth is a snapshot and doesn't reflect cash flow.",
    'Inflation can erode the real value of net worth.',
    'Dividing net worth by age provides a rough benchmark for savings.',
    'Net worth milestones, like the first $100k, are celebrated in finance communities.',
    'Entrepreneurs often reinvest profits, delaying net worth growth.',
    'Debt payoff strategies directly increase net worth.',
    'A negative net worth is common early in adulthood due to student loans.'
  ],
  tax: [
    'The U.S. introduced the federal income tax in 1913.',
    'The highest U.S. marginal tax rate peaked at 94% during WWII.',
    'Several states including Texas and Florida have no state income tax.',
    'The IRS processes more than 150 million tax returns each year.',
    'Electronic filing usually yields faster refunds than paper returns.',
    'Tax brackets in the U.S. are progressive; higher income is taxed at higher rates.',
    'The IRS was created by President Lincoln in 1862.',
    'The first e-file tax return was transmitted in 1986.',
    'Some countries have flat tax systems instead of progressive ones.',
    'Tax refunds are essentially an interest-free loan to the government.',
    'Capital gains may be taxed differently than regular income.',
    'The average American spends 13 hours preparing their tax return.',
    'The Alternative Minimum Tax was designed to ensure wealthy pay minimum taxes.',
    'Sales taxes vary by state and locality.',
    'Some states have no sales tax, like Oregon.',
    'Child tax credits can significantly reduce tax liability.',
    'Payroll taxes fund Social Security and Medicare.',
    'Property taxes often fund local schools and services.',
    'Tax audits are rare, with less than 1% of returns examined.',
    'The U.S. tax code spans thousands of pages.'
  ],
  ss: [
    'Social Security was established in 1935.',
    'Delaying benefits past full retirement age increases payments by about 8% per year until age 70.',
    'About 67 million Americans received Social Security benefits in 2023.',
    'Social Security is primarily funded by payroll taxes under FICA.',
    'The first monthly Social Security check was issued in 1940.'
  ],
  data: [
    'Open data portals let you download housing and wage statistics for free.',
    'ZIP Codes were created in 1963 to speed up mail delivery.',
    'Many governments provide APIs for real-time economic data.',
    'Real estate sale records can lag by months before publication.',
    'Analyzing public data can uncover surprising financial trends.',
    'APIs often return data in JSON format for easy parsing.',
    'OpenStreetMap is a crowdsourced geographic database.',
    'Governments release data under open licenses for public use.',
    'Big data tools like Hadoop and Spark process massive datasets.',
    'Data visualizations help communicate complex information quickly.',
    'Many datasets include metadata describing their contents and provenance.',
    'CSV is a common flat-file format for tabular data.',
    'Some APIs rate-limit requests to prevent abuse.',
    'Data cleaning often consumes most of a data scientist\'s time.',
    'Open government initiatives aim to increase transparency.',
    'Weather data is frequently used in economic forecasting.',
    'Machine learning models rely on high-quality training data.',
    'Data breaches can expose sensitive personal information.',
    'Real-time APIs power live dashboards and apps.',
    'Public datasets can be combined to uncover new insights.'
  ],
  sim: [
    'Monte Carlo methods model uncertainty by running many random trials.',
    'The approach was popularized during the Manhattan Project.',
    'In finance, Monte Carlo simulations help estimate investment risk and return.',
    'More simulation runs generally yield more reliable percentile estimates.'
  ]
};

function Home({ onOpen }) {
  return /*#__PURE__*/(
    React.createElement(Section, { title: "Pick a Calculator", right: /*#__PURE__*/React.createElement("span", { className: "text-xs text-slate-500" }, "Everything updates instantly") }, /*#__PURE__*/
    React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" },
    CARDS.map((c) => /*#__PURE__*/
    React.createElement("div", { key: c.id, className: "p-4 rounded-2xl border bg-white/70 hover:shadow-card transition" }, /*#__PURE__*/
    React.createElement("div", { className: "font-medium mb-1" }, c.title), /*#__PURE__*/
    React.createElement("p", { className: "text-sm text-slate-600 mb-3" }, c.why), /*#__PURE__*/
    React.createElement("button", { className: "kbd", onClick: () => onOpen(c.id) }, "Open"))))));





}

function FunFacts({ topic }) {
  const facts = useMemo(() => {
    if (topic === 'home') return Object.values(FUN_FACTS).flat();
    return FUN_FACTS[topic] || [];
  }, [topic]);

  const randomFact = () => facts[Math.floor(Math.random() * facts.length)];
  const [fact, setFact] = useState(() => facts.length ? randomFact() : '');

  useEffect(() => {
    if (facts.length) setFact(randomFact());
  }, [facts]);

  useEffect(() => {
    if (!facts.length) return;
    const timer = setTimeout(() => setFact(randomFact()), 10000);
    return () => clearTimeout(timer);
  }, [fact, facts]);

  const shuffle = () => {
    if (facts.length) setFact(randomFact());
  };

  if (!facts.length) return null;
  return /*#__PURE__*/(
    React.createElement("div", { className: "mt-4 px-4 py-3 bg-white border rounded-xl flex items-center justify-between gap-3 shadow-card" }, /*#__PURE__*/
    React.createElement("span", { className: "text-sm text-slate-700" }, fact), /*#__PURE__*/
    React.createElement("button", {
      className: "icon-btn hover:bg-slate-100 transition-colors duration-150",
      onClick: shuffle,
      title: "Shuffle fun fact",
      "aria-label": "Shuffle fun fact",
      style: { background: "transparent" }
    }, "\uD83D\uDD00\uFE0F")));
}

/* --------------------------------- App --------------------------------- */
function App() {
  const [view, setView] = useState('home');
  const [placeholders, setPlaceholders] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage('settings', { theme: 'light', accent: 'slate', font: 'base' });

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.accent = settings.accent;
    document.documentElement.dataset.font = settings.font;
    document.body.classList.remove('bg-slate-50', 'text-slate-900', 'bg-slate-900', 'text-slate-50');
    if (settings.theme === 'dark') {
      document.body.classList.add('bg-slate-900', 'text-slate-50');
    } else {
      document.body.classList.add('bg-slate-50', 'text-slate-900');
    }
    const meta = document.querySelector('meta[name=color-scheme]');
    if (meta) meta.setAttribute('content', settings.theme === 'dark' ? 'dark light' : 'light dark');
  }, [settings]);

  const updateSetting = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  return /*#__PURE__*/(
    React.createElement("div", { className: "max-w-5xl mx-auto px-4 py-6" }, /*#__PURE__*/

    React.createElement("div", { className: "flex items-start justify-between gap-4 mb-4 animate-fadeUp" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-start gap-4" }, /*#__PURE__*/
    React.createElement("div", { className: "w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl shadow select-none", title: "Hi!", "aria-hidden": true }, "\uD83D\uDE42"), /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h1", { className: "text-2xl md:text-3xl font-bold tracking-tight" }, "Finance Calculators"), /*#__PURE__*/
    React.createElement("p", { className: "text-slate-600" }, "Your clean, accurate, no-fluff toolkit."))), /*#__PURE__*/



    React.createElement("div", { className: "flex flex-col items-end gap-2 relative" }, /*#__PURE__*/
    React.createElement("div", { className: "flex items-center gap-2" }, /*#__PURE__*/
    React.createElement(SocialBar, null), /*#__PURE__*/
    React.createElement("button", { className: "icon-btn hover:bg-slate-100 transition-colors duration-150", onClick: () => setSettingsOpen(o => !o), "aria-label": "Settings", title: "Settings", "aria-expanded": settingsOpen }, "\u2699\uFE0F")), /*#__PURE__*/
    settingsOpen && /*#__PURE__*/React.createElement(SettingsPanel, { config: settings, onChange: updateSetting }), /*#__PURE__*/
    React.createElement("span", { className: "text-[11px] text-slate-500" }, "@luisitin2001"))), /*#__PURE__*/




    React.createElement(Section, { title: "Tools", right: /*#__PURE__*/React.createElement("span", { className: "text-xs text-slate-500" }, "Scroll to see more") }, /*#__PURE__*/
    React.createElement("div", { className: "tabs-scroll -mx-2 px-2", role: "tablist", "aria-label": "Tools" }, /*#__PURE__*/
    React.createElement("div", { className: "inline-flex gap-2 whitespace-nowrap pr-2" },
    TABS.map((t) => /*#__PURE__*/
    React.createElement("button", { key: t.id, role: "tab", "aria-selected": view === t.id ? 'true' : 'false',
      onClick: () => setView(t.id), title: t.title,
      className: (view === t.id ? 'bg-slate-900 text-white ' : 'bg-white hover:bg-slate-50 ') + 'tab-btn border rounded-2xl px-3 py-2 transition-colors text-[13px] sm:text-sm' },
    t.label))))), /*#__PURE__*/
    React.createElement(FunFacts, { topic: view }), /*#__PURE__*/







    React.createElement(ErrorBoundary, null,
    view === 'home' && /*#__PURE__*/React.createElement(Home, { onOpen: setView }),
    view === 'mortgage' && /*#__PURE__*/React.createElement(MortgageCalc, { placeholders: placeholders }),
    view === 'downpoints' && /*#__PURE__*/React.createElement(DownVsPoints, null),
    view === 'compound' && /*#__PURE__*/React.createElement(CompoundCalc, null),
    view === 'retire' && /*#__PURE__*/React.createElement(RetirementGoal, null),
    view === 'debt' && /*#__PURE__*/React.createElement(DebtPayoff, null),
    view === 'auto' && /*#__PURE__*/React.createElement(AutoTools, null),
    view === 'rent' && /*#__PURE__*/React.createElement(HomeAffordability, { placeholders: placeholders }),
    view === 'networth' && /*#__PURE__*/React.createElement(NetWorth, null),
    view === 'tax' && /*#__PURE__*/React.createElement(TaxCalc, null),
    view === 'ss' && /*#__PURE__*/React.createElement(SocialSecurity, null),
    view === 'sim' && /*#__PURE__*/React.createElement(Simulations, { scenarioDefaults: SCENARIO_DEFAULTS }),
    view === 'data' && /*#__PURE__*/React.createElement(DataPanel, { onPlaceholders: setPlaceholders })), /*#__PURE__*/


    React.createElement("div", { className: "text-center text-xs text-slate-500 space-y-2 mt-8 mb-8" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/React.createElement("a", { className: "underline", href: "https://www.investor.gov", target: "_blank", rel: "noreferrer" }, "Investor.gov")), /*#__PURE__*/
    React.createElement("div", null, "Built for clarity \u2014 not financial advice."))));



}

/* Mount */
ReactDOM.createRoot(document.getElementById('root')).render( /*#__PURE__*/React.createElement(App, null));
