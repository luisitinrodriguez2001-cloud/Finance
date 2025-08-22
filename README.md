# Finance

## Overview
Mini-prompt: Write a concise Overview that explains the Finance app’s purpose (browser-based calculators), mentions React+Tailwind+Babel in-browser rendering, and notes the educational-use disclaimer (“Past performance is not indicative of future results.”).
Finance is a collection of browser-based calculators that help answer everyday personal finance questions. The interface is written in React and styled with Tailwind, then compiled on the fly in the browser through Babel Standalone—no build step required. These tools are for educational use only; past performance is not indicative of future results.

## Features
Mini-prompt: List all current calculators (from Mortgage/Loan to Monte Carlo) as bullets. Add a highlighted sub-bullet for the NEW Economic Data toggle with Month/Year selectors and what it fetches (CPI, Unemployment, 10Y, Fed Funds). If not yet live, label it “New (upcoming)”.
- Mortgage / Loan (amortization schedules and extra payments)
- Compound Interest (future value and required contribution)
- Retirement Goal (savings needed for a target nest egg)
- Debt Payoff (avalanche or snowball across multiple debts)
- Auto Affordability (ZIP-based income lookups)
- Home Affordability (rent, taxes and census data)
- Net Worth (asset/liability tracker with XIRR)
- Taxes (2025) (federal and state approximations)
- Social Security (benefit comparisons by age)
- Monte Carlo simulations (growth and retirement scenarios)
  - **New (upcoming): Economic Data toggle** — choose “Economic data” under the Data source dropdown, pick a Month and Year, then fetch CPI, Unemployment, 10Y Treasury and Effective Fed Funds rates.

## Live Demo
Mini-prompt: Provide the production URL and a one-liner about first-load behavior (JS required, client-rendered UI via Babel Standalone).
Visit https://luisitinrodriguez2001-cloud.github.io/Finance/—JavaScript must be enabled and the UI renders entirely on the client via Babel Standalone on first load.

## Installation
Mini-prompt: Give exact steps to clone and run locally. Include a Node-based option (npm install; node server.js or npm run dev) and an alternative “no Node” static server (Python http.server). Emphasize that no bundler is required because JSX is compiled by Babel in the browser.
1. Clone the repo:
   ```bash
   git clone https://github.com/luisitinrodriguez2001-cloud/Finance.git
   cd Finance
   ```
2. **Node option** – install and start the Express server:
   ```bash
   npm install
   npm run dev        # or: node server.js
   ```
3. **No Node?** Serve the files statically:
   ```bash
   python3 -m http.server 3000
   ```
4. Open http://localhost:3000 in a browser. No bundler is needed; Babel compiles JSX in the browser.

## Usage
Mini-prompt: Explain how to navigate calculators; how inputs persist (e.g., localStorage if applicable); how to use the Data tab. For Economic Data: select Data source → “Economic data”, then Month/Year, then Fetch/Download CSV. Include a brief interpretation note for each metric (CPI, Unemployment, 10Y, Fed Funds).
- Use the sidebar to switch between calculators. Inputs are saved in localStorage so values reappear on reload.
- Zip code inputs automatically query public endpoints (Zippopotam.us / US Census) for city, state, income and median home values.
- In the **Data** tab, choose a source and fetch live numbers:
  - Set **Data source** to **Economic data** → pick a Month and Year → click *Fetch* to display the table or *Download CSV* for a file.
  - CPI: measures consumer inflation.
  - Unemployment: national jobless rate.
  - 10Y Treasury: benchmark long-term interest rate.
  - Fed Funds: effective short-term rate set by the Federal Reserve.

## Economic Data Sources (Keyless)
Mini-prompt: Document the keyless providers and series: BLS Public Data API (CPI CUSR0000SA0, Unemployment LNS14000000), Treasury Daily Yield Curve XML (bc_10year averaged by month), and FRED CSV download for FEDFUNDS (may require a simple CORS proxy). Describe guardrails: timeouts, retries with jitter, schema checks, missing-value filtering, and a toggleable proxy constant. Clarify that Month/Year dropdowns should only allow dates within available data ranges.
- **BLS Public Data API** – series CUSR0000SA0 for CPI and LNS14000000 for Unemployment.
- **U.S. Treasury Daily Yield Curve** – XML feed; the app averages the `bc_10year` yield by month.
- **FRED (Federal Reserve Economic Data)** – CSV download for the FEDFUNDS series; requests may be routed through an optional CORS proxy constant.

Guardrails: network timeouts, exponential backoff with jitter, schema validation and missing-value filtering are applied to each request. Month and Year selectors are limited to the data ranges returned by each provider.

## Architecture & Project Structure
Mini-prompt: Summarize the tech stack (React 18, Tailwind, Babel Standalone). Explain why no bundler is needed. Outline the file tree with one-line purposes for key files (index.html, public/script.js, public/style.css, components/SourceNote.jsx, sim/*.js, server.js).
The app uses React 18, Tailwind CSS and Babel Standalone in the browser, so JSX and ES modules compile at runtime—no bundler or build step is required.

```
Finance/
├── index.html                # Loads CDN libs and bootstraps React
├── public/
│   ├── script.js             # All calculators and helper utilities
│   └── style.css             # Tailwind overrides and custom styles
├── components/
│   └── SourceNote.jsx        # Citation footers for charts/tables
├── sim/
│   ├── horizonDefaults.js    # Monte Carlo horizon assumptions
│   └── investorProfiles.js   # Sample risk profiles
└── server.js                 # Minimal Express server for local dev
```

## Development
Mini-prompt: Describe coding conventions, where to add new calculators, how to add a new data source (new fetch module + UI wiring), how to configure an optional CORS proxy, and how retry/timeout utilities are organized. Mention testing tips and how to run a local server.
- Follow React functional-component style and Tailwind utility classes; keep new calculators in `public/script.js` alongside helper functions.
- To add a data source: create a fetch helper with retries/timeout, wire it to the Data tab UI and document it in the README.
- Optional CORS proxy: set the `PROXY_URL` constant before fetching external CSV/JSON resources.
- Retry/timeout utilities live near the data-fetching helpers in `public/script.js`.
- Start a local server with `npm run dev` and run quick checks with `npm test`.

## Deployment
Mini-prompt: Explain GitHub Pages deployment (static hosting from repo). Note that pushing to the main/gh-pages branch updates the site; include a brief note on repository settings for Pages.
- The site is hosted via GitHub Pages directly from the repo.
- Pushing to the `main` (or configured `gh-pages`) branch updates the public site.
- Ensure repository Settings → Pages points to the correct branch and `/` root.

## Contributing
Mini-prompt: Provide guidelines for issues/PRs, coding style notes, where to put tests or examples, and how to document new sources (update the Economic Data Sources section and add UI tooltips/(i) notes).
- Open an issue before large changes; small fixes can go straight to a PR.
- Match existing code style (prettier spacing, React hooks, Tailwind utilities).
- Place tests or usage examples under `docs/` or alongside the feature.
- When adding a new data source, document it in **Economic Data Sources** and include an `(i)` tooltip or note in the UI.

## License
Mini-prompt: Include a placeholder License section and instruct maintainers to choose and link an OSI-approved license (e.g., MIT, Apache-2.0).
Project maintainers should choose and add an OSI-approved license (e.g., MIT, Apache‑2.0) in a top-level `LICENSE` file and link it here.

## Disclaimers
Mini-prompt: Restate the educational-use disclaimer and add a brief “not investment advice” notice; mention that historical returns don’t guarantee future outcomes.
These tools are for educational purposes only and do not constitute investment advice. Historical returns and model projections do not guarantee future outcomes.
