# State tax data

This directory holds CSV tables that describe state income tax brackets. Each filing status
(single and married filing jointly) has its own set of files.

## CSV formats

* **`bracket_counts_*.csv`** – Number of brackets in each state. This lets scripts know how
  many breakpoint and rate columns are filled for a given state.
* **`breakpoints_*.csv`** – Lower income threshold for each bracket. Columns `breakpoint_1`,
  `breakpoint_2`, … mark where a new marginal rate begins.
* **`rates_*.csv`** – Marginal rates corresponding to each breakpoint column.
* **`state_taxes_*_long.csv`** – Flattened table with four columns:
  `state, bracket_index, threshold, rate`. Each row represents one bracket and
  is sorted by increasing threshold. These long-form tables are generated from
  the breakpoint and rate files and are the only CSVs used at runtime.

## Consumption

Both the server and browser load the long-form files:

* `stateTax.js` reads `state_taxes_single_long.csv` and
  `state_taxes_married_joint_long.csv` to calculate taxes on the server.
* `public/script.js` fetches the same CSVs so the client-side calculator can
  operate even when the API is unavailable.

## Updating when brackets change

1. Edit `breakpoints_*.csv` and `rates_*.csv` for the affected states and
   filing statuses.
2. Update `bracket_counts_*.csv` if the number of brackets changes.
3. Regenerate the long-form `state_taxes_*_long.csv` files from the updated
   breakpoints and rates, ensuring rows are sorted by threshold.
4. Commit the updated CSVs; the application will use the new brackets
   automatically.

