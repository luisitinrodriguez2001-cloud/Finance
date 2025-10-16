# Finance Calculators — Site Overview

This repository documents the public site hosted at <https://luisitinrodriguez2001-cloud.github.io/Finance/>. The site is a collection of interactive financial calculators built with React. It provides clean, no-fluff tools that update instantly as you change inputs. Each calculator lives on its own page but the pages share a consistent layout: a top navigation bar, a short informational note that can be dismissed, input fields on the left and results on the right, and (for some tools) an interactive chart. The calculators are designed to help with common personal finance questions such as mortgages, compound interest, taxes, and more. All computations are for illustration only and the site repeatedly warns that it is not financial advice.[^1]

## Navigation and Layout

- **Top bar** – At the top of each page you’ll find the site logo and a horizontal list of tool names. Clicking a name navigates to the corresponding calculator (Home, Mortgage, Compound, Retirement, Debt Payoff, Auto, Home Affordability, Net Worth, Tax, Social, etc.). When the screen is narrow you can scroll horizontally to reveal more options. The active tool is highlighted.
- **Informational notes** – Just under the navigation bar each page shows a short fact or rule of thumb related to the tool (for example, “Net worth can fluctuate with market changes daily” on the Net Worth page[^2]). A small × button lets you dismiss the note.
- **Input panels** – Tools on the left side accept numeric inputs or selections. Text boxes automatically format numbers with dollar signs and percentages where appropriate.
- **Result panels** – Tools on the right display computed outputs. These update immediately as inputs change. Some tools also show graphs or tables to visualise the results.
- **Footer** – A footer warns that the site is built for clarity and includes links to external sources such as Investor.gov. Past performance is not indicative of future performance.[^1]

## Calculator Summaries

### Mortgage / Loan

This tool estimates the monthly payment for a mortgage or loan and compares payoff strategies. You provide the principal amount, annual percentage rate (APR) and term in years, and the tool computes the monthly payment, total paid and total interest. A line chart plots the amortisation schedule. The Analysis section lets you test scenarios:

- **Extra monthly principal** – Pay an additional fixed amount each month toward principal.
- **Refinance** – Specify how many years you’ve already paid, the new interest rate and the new term. The tool shows months and interest saved.[^3]
- **Lump-sum principal** – Apply a one-time payment at a chosen month.

### Compound Interest

This calculator projects investment growth over time with recurring contributions. Inputs include starting amount, monthly contribution, annual return (%) and number of years. It displays the projected value of your investment, the total contributed and the growth (earnings).[^4]

### Retirement Savings Target

Also labelled Retirement Goal, this tool answers the question: “How much should I save each month to reach a future nest egg?” You enter your desired future balance, current savings, years until retirement and assumed annual return. The calculator returns the required monthly contribution.[^5] It uses a standard compound interest formula and a default return sourced from LazyPortfolioETF.

### Debt Payoff

You can simulate paying off multiple debts using either the avalanche or snowball method. For each debt you specify a name, balance, APR and minimum payment. A graph shows how balances decline over time. The tool computes how many months it takes to become debt-free and the total interest paid under each strategy. An extra monthly payment field lets you see how additional payments affect your payoff schedule.[^6]

### Auto – Affordability and Lease vs Buy

The auto section combines two tools:

- **Affordability** – Enter your monthly budget, loan APR and loan term. The tool returns the approximate maximum loan principal you can afford.[^7]
- **Lease vs Buy** – Compare the cost of leasing versus buying a car. Inputs include MSRP / negotiated price, down or cap reduction, lease term, residual percentage, money factor, loan APR and loan term. Results show the monthly payment and total cost for leasing and buying. A note summarises the trade-off between lower monthly lease payments and building equity through ownership.[^8]

### Home Affordability – Estimate Purchase Price from Rent

This tool infers a purchase price based on your current rent. You provide monthly rent, mortgage APR, term, local property tax, insurance and maintenance rates, HOA, down payment percentage and annual pretax income. The calculator estimates the home value, down payment needed, monthly mortgage payment, taxes/insurance/maintenance/HOA, total monthly housing cost and front-end debt-to-income ratio.[^9]

### Net Worth

Track your assets and liabilities in a colour-coded balance sheet. You add assets by choosing a category (e.g. Cash, Investments, Real Estate, Other), naming the account and entering its value. Add liabilities (e.g. Mortgage, Student Loan, Credit Card) in the same way. The tool sums total assets and total liabilities and displays net worth at the top. A breakdown table lists each category with its value.[^10]

### Taxes (2025)

This calculator approximates federal and state income taxes for the 2025 tax year using current brackets. Inputs include filing status, state (for a simple effective rate estimate), wages / ordinary income, other income, long-term capital gains and qualified dividends and whether you plan to itemize or use the standard deduction. The tool shows the computed taxable income and total taxes owed.[^11] A breakdown lists the estimated federal tax, state income tax and Social Security/Medicare (other W-2) taxes.[^12] You can override the state estimate by manually entering a rate.

### Social Security

Estimate monthly Social Security benefits at different claiming ages. You enter your Primary Insurance Amount (PIA) – the monthly benefit you would receive at your full retirement age – and optionally adjust the PIA % to model spousal or survivor benefits. A table displays the monthly benefit at ages 62–70 and the difference compared to claiming at age 67.[^13] Earlier claiming reduces the benefit; delaying past full retirement age increases it.

### Monte Carlo Simulations

Run Monte Carlo experiments to understand uncertainty in investment returns. Two simulation types are available:

- **Investment Growth** – Specify a starting balance, annual contribution, years, and an optional goal. After clicking Run the tool performs thousands of random trials and reports the 10th percentile, median and 90th percentile ending balances along with the probability of reaching the goal. A histogram colours green bars for successful trials and red bars for failures.[^14]
- **Retirement Outcome** – Specify a starting balance, annual withdrawal and years. The simulator computes the chance your portfolio lasts for the entire retirement horizon. It also suggests a historically optimal asset allocation under the model’s assumptions.[^15] You can toggle between Simple and Advanced modes to adjust more parameters.

### Data Sources (Live Placeholders)

This helper fetches public data sets (e.g. U.S. Census American Community Survey) to pre-fill other calculators. Enter a ZIP code and click Refresh to load the median home value, median household income and location for that ZIP.[^16] The fetched values are then used as defaults for the Home Affordability calculator.

## Quick Reference Table

| Calculator | Key inputs | Key outputs |
| --- | --- | --- |
| Mortgage / Loan | Principal, APR, term, extra payment type/amount | Monthly payment, total paid, total interest, payoff chart |
| Compound Interest | Starting amount, monthly contribution, annual return, years | Projected value, total contributions, growth |
| Retirement Goal | Future goal, current savings, years, return | Required monthly contribution |
| Debt Payoff | For each debt: balance, APR, minimum payment; extra monthly payment | Months to pay off and interest for avalanche vs snowball |
| Auto (Affordability) | Monthly budget, loan APR, loan term | Approximate max loan principal |
| Auto (Lease vs Buy) | Price, down payment, lease term & residual %, money factor, loan APR & term | Lease monthly & total cost; buy monthly & net cost |
| Home Affordability | Rent, mortgage APR, term, property tax %, insurance %, maintenance %, HOA, down payment %, income | Estimated home value, down payment, mortgage payment, taxes/ins/maint/HOA, total housing, DTI |
| Net Worth | Asset and liability categories and amounts | Total assets, total liabilities, net worth, breakdown tables |
| Tax (2025) | Filing status, state, income sources, capital gains, deduction choice | Taxable income, total tax, federal/state/SS/Medicare breakdown |
| Social Security | PIA (monthly), PIA % for spouse/survivor | Monthly benefit at ages 62–70 and difference vs age 67 |
| Monte Carlo – Investment Growth | Starting balance, annual contribution, years, goal | Percentile ending balances, success probability, histogram |
| Monte Carlo – Retirement Outcome | Starting balance, annual withdrawal, years | Success probability, percentile ending balances, suggested allocation |
| Data Sources | ZIP code | Median home value, median household income, location |

## Running Locally

The calculators run entirely in the browser and rely on JavaScript. To develop locally, clone this repository and serve the React app (for example, run `npm install` followed by `npm run start`). A build can be deployed to GitHub Pages. Note that the live Data Sources tool makes network requests to public APIs; you may need to proxy these requests during local development.

## Disclaimer

These calculators are provided for educational and illustrative purposes only. Results do not constitute financial advice. Always consult a professional for decisions regarding mortgages, taxes, retirement planning or investment strategies.

[^1]: Disclaimer presented in the site footer emphasising educational use only and links to Investor.gov.
[^2]: Informational note example on the Net Worth page stating market-driven fluctuations.
[^3]: Mortgage analysis section describing refinance savings calculations.
[^4]: Compound interest tool outputs showing projected value, total contributions and growth.
[^5]: Retirement goal calculator prompt for required monthly contribution and data source.
[^6]: Debt payoff strategies comparing avalanche and snowball timelines and interest.
[^7]: Auto affordability calculator translating budget, APR and term to principal limit.
[^8]: Lease vs buy comparison emphasising cost trade-offs and equity considerations.
[^9]: Home affordability calculator output estimating purchase price and monthly obligations from rent.
[^10]: Net worth tracker summarising assets, liabilities and balance sheet breakdown.
[^11]: Tax calculator computing taxable income and total tax owed for 2025 brackets.
[^12]: Tax breakdown section separating federal, state and payroll-related taxes.
[^13]: Social Security calculator table mapping PIA to benefits across claiming ages.
[^14]: Monte Carlo investment growth simulation showing percentile outcomes and success rate.
[^15]: Monte Carlo retirement outcome simulation highlighting sustainability probability and suggested allocation.
[^16]: Data Sources tool fetching median home value and household income for a provided ZIP code.
