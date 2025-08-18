const express = require('express');
const path = require('path');

const app = express();

// Serve static assets used by the front-end. Previously only the `public`
// directory was exposed which meant files like `/components/SourceNote.jsx`
// and modules imported from `/sim` returned 404s in the browser. React would
// then fail to load and the page rendered blank. Expose those directories so
// the client can fetch them.
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/sim', express.static(path.join(__dirname, 'sim')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const investorProfile = process.env.INVESTOR_PROFILE || '60/40';
app.get('/api/config', (req, res) => {
  res.json({ investorProfile });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
