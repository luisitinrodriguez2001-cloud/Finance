const express = require('express');
const path = require('path');
const { calcStateTax } = require('./stateTax');

const app = express();

const INVESTOR_PROFILE = process.env.INVESTOR_PROFILE || '60/40';
app.locals.investorProfile = INVESTOR_PROFILE;

// Serve static assets used by the front-end. Previously only the `public`
// directory was exposed which meant files like `/components/SourceNote.jsx`
// and modules imported from `/sim` returned 404s in the browser. React would
// then fail to load and the page rendered blank. Expose those directories so
// the client can fetch them.
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/sim', express.static(path.join(__dirname, 'sim')));

app.get('/api/state-tax', (req, res) => {
  const { state, status, income, overrideRate } = req.query;
  const incomeNum = Number(income);
  if (!state || !Number.isFinite(incomeNum)) {
    return res.status(400).json({ error: 'state and income required' });
  }
  const override = overrideRate !== undefined ? Number(overrideRate) : NaN;
  const result = calcStateTax(state, status, incomeNum, override);
  res.json(result);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
