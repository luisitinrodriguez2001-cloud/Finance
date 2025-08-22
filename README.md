# Finance Calculators

Finance is a collection of browser‑based tools that help answer common personal finance questions. A minimal [Express](https://expressjs.com/) server delivers the assets while the UI is built with React 18, Tailwind CSS and in‑browser Babel—no bundler or build step is required. Calculators cover mortgages, investing, taxes, Social Security benefits and more.

## Calculators
`public/script.js` bundles every calculator and supporting helper. Major tools include:

- **Mortgage / Loan** – payment schedules, extra‑payment simulations and remaining balance calculations.
- **Compound Interest** – future value and required contribution projections.
- **Retirement Goal** – savings needed to hit a target nest egg.
- **Debt Payoff** – avalanche or snowball payoff strategies across multiple debts.
- **Auto Affordability** – lease vs. buy comparison with real‑time ZIP lookups for median income.
- **Home Affordability** – estimates purchase price using rent, taxes and census‑based home values.
- **Net Worth** – asset/liability tracker with XIRR for investment performance.
- **Taxes (2025)** – state and federal income tax approximations.
- **Social Security** – benefit comparisons at different ages.
- **Monte Carlo Simulations** – growth and retirement scenarios with adjustable trials and inflation.

## Technology & Architecture
- **Express server** – [`server.js`](server.js) serves `index.html` and exposes `/public`, `/components` and `/sim`. It reads the `INVESTOR_PROFILE` env var and injects it into `app.locals` so the client can pick a default risk profile.
- **Client entry point** – [`index.html`](index.html) loads React and supporting libraries directly from CDNs: `mathjs`, `dayjs`, `chart.js`, `accounting-js` and `xirr` among others. Tailwind is configured in a script tag and `public/style.css` provides extra theming.
- **Runtime JSX** – components and calculators are authored in JSX and compiled in the browser via Babel Standalone, allowing each file (e.g., [`components/SourceNote.jsx`](components/SourceNote.jsx)) to be requested individually.
- **Simulation data** – [`sim/horizonDefaults.js`](sim/horizonDefaults.js) supplies expected returns and volatility by horizon, while [`sim/investorProfiles.js`](sim/investorProfiles.js) lists sample risk profiles used by the Monte Carlo tools.

## Project Structure
```
.
├── components/
│   └── SourceNote.jsx        # React component to render citation footers
├── docs/
│   ├── research_sources.md   # Notes on LLM serving frameworks
│   └── simulations_sources.md# References for Monte Carlo assumptions
├── public/
│   ├── script.js             # Main React app with all calculators and helpers
│   ├── style.css             # Tailwind overrides and custom styles
│   ├── instagram.svg         # Social icon
│   └── tiktok.svg            # Social icon
├── sim/
│   ├── horizonDefaults.js    # Expected return/volatility table
│   └── investorProfiles.js   # Example investor risk profiles
├── index.html                # HTML bootstrapper
├── server.js                 # Express server exposing static dirs
└── package.json              # Metadata and npm scripts
```

## Implementation Details
- **Financial helpers** – `public/script.js` defines utilities like `loanPayment`, `futureValue`, `requiredMonthly`, `buildSchedule` and `remainingBalance` for core calculations.
- **Custom hooks & storage** – a `useLocalStorage` hook persists inputs so calculators reload with saved values.
- **Live data lookups** – functions call the [Zippopotam.us](https://api.zippopotam.us/) and [US Census ACS](https://api.census.gov/data.html) APIs to prefill city, state, median home value and income based on a ZIP code.
- **UI primitives** – shared components such as `Section` and `SettingsPanel` manage layout and theme, while `SourceNote` attaches citations to charts and tables.

## Configuration
- **`INVESTOR_PROFILE`** – default investor profile slug (`60/40` if unset).
- **`PORT`** – port for the Express server (`3000` by default).

## Development
1. Install dependencies and start the server:
   ```
   npm install
   npm run dev
   ```
2. Run checks:
   ```
   npm test
   ```

## Sources and References
- `docs/research_sources.md` lists background reading on LLM serving frameworks previously investigated in this repo.
- `docs/simulations_sources.md` covers references for the Monte Carlo implementation.

## Disclaimer
Past performance is not indicative of future results. These calculators are for educational use only and do not constitute financial advice.
