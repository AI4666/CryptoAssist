# Asset Ranking

## Purpose
What industry question does this skill answer?
It answers: Which cryptocurrencies have the best risk-adjusted historical returns over the recent past?

## When to Use
What type of request should activate this skill?
Use this skill when the user asks to rank, prioritize, or identify the "best" or "safest" cryptocurrencies to hold in their portfolio.

## Required Inputs
What variables, files, or user selections are required?
- No specific user inputs required; it runs across all available coins in the dataset for the last 90 days.

## Files Used
Which R scripts, data files, Quarto pages, or API endpoints are used?
- Backend API Endpoint: `POST /ranking`
- R Script: `R/ranking.R`

## Method
What statistical or analytical method is used?
Risk-Adjusted Return calculation (simplified Sharpe Ratio = Mean Return / Standard Deviation of Return).

## Procedure
What steps should Antigravity follow?
1. Receive a request to rank or prioritize assets.
2. Send a POST request to `http://localhost:8000/ranking` with an empty inputs object:
   `{"inputs": {}}`
3. Receive the ranking list from the API.
4. Present the top ranked coins based on the highest Sharpe ratio.

## Validation
What must be checked before running the analysis?
- The dataset must contain a valid date variable.
- There must be data available for the last 90 days.

## Output
What statistic, table, chart, score, estimate, or prediction is returned?
- A ranking table containing the Coin, Sharpe Ratio, Mean Return, and Volatility.

## Interpretation
How should the result be explained to the industry user?
Explain that a higher Sharpe ratio means the asset provided better returns relative to the risk (volatility) it experienced. Assets at the top of the list historically offered the best risk/reward tradeoff.

## Limitation
What should the user not conclude?
The user should not conclude that a high historical Sharpe ratio guarantees future stability or returns. The simplified calculation also ignores the risk-free rate, which is standard in traditional finance.
