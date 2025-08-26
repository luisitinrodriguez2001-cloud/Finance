const fs = require('fs');
const path = require('path');

function loadBrackets(file) {
  const text = fs.readFileSync(file, 'utf8').trim();
  const lines = text.split(/\r?\n/);
  lines.shift(); // header
  const data = {};
  for (const line of lines) {
    if (!line) continue;
    const [state, bracketIndex, threshold, rate] = line.split(',');
    if (!data[state]) data[state] = [];
    data[state].push({ threshold: Number(threshold), rate: Number(rate) });
  }
  for (const st of Object.keys(data)) {
    data[st].sort((a, b) => a.threshold - b.threshold);
  }
  return data;
}

const single = loadBrackets(path.join(__dirname, 'state taxes', 'state_taxes_single_long.csv'));
const married = loadBrackets(path.join(__dirname, 'state taxes', 'state_taxes_married_joint_long.csv'));

function calcStateTax(state, status, income, overrideRate) {
  if (Number.isFinite(overrideRate)) {
    const tax = income > 0 ? income * overrideRate : 0;
    return { tax, effectiveRate: overrideRate };
  }
  if (status !== 'Single' && status !== 'Married Filing Jointly') {
    return { tax: 0, effectiveRate: 0, manual: true };
  }
  const table = status === 'Married Filing Jointly' ? married : single;
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
  const effectiveRate = tax / income;
  return { tax, effectiveRate };
}

module.exports = { calcStateTax };
