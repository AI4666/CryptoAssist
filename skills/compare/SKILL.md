# Compare Two Groups

## Purpose
What industry question does this skill answer?
It answers: Is there a statistically significant difference in performance or volatility (e.g., average daily return) between two different cryptocurrencies?

## When to Use
What type of request should activate this skill?
Use this skill when the user asks to compare two assets against each other based on a specific numeric metric (e.g., "Does BTC have higher average returns than ETH?").

## Required Inputs
What variables, files, or user selections are required?
- `coin1`: The first cryptocurrency symbol (e.g., "BTC").
- `coin2`: The second cryptocurrency symbol (e.g., "ETH").
- `outcome_variable`: The numeric variable to compare (e.g., "DailyReturn").

## Files Used
Which R scripts, data files, Quarto pages, or API endpoints are used?
- Backend API Endpoint: `POST /compare`
- R Script: `R/compare.R`

## Method
What statistical or analytical method is used?
Welch Two Sample t-test (independent samples, assuming unequal variances).

## Procedure
What steps should Antigravity follow?
1. Extract `coin1`, `coin2`, and `outcome_variable` from the user's request.
2. Send a POST request to `http://localhost:8000/compare` with JSON body:
   `{"inputs": {"coin1": "BTC", "coin2": "ETH", "outcome_variable": "DailyReturn"}}`
3. Receive the t-test results from the API.
4. Present the means, difference, p-value, and interpretation to the user.

## Validation
What must be checked before running the analysis?
- Both coins must exist in the dataset and be different from each other.
- The outcome variable must be numeric.
- Each group must have at least 30 non-missing observations.

## Output
What statistic, table, chart, score, estimate, or prediction is returned?
- Mean for group 1, mean for group 2.
- Estimated difference.
- 95% Confidence Interval.
- P-value.

## Interpretation
How should the result be explained to the industry user?
Explain which coin had the higher average. State the approximate size of the difference. Explain whether the difference is statistically significant (based on p-value < 0.05) and if it is practically meaningful for investment decisions.

## Limitation
What should the user not conclude?
The user should not conclude that one asset causes the performance of the other, nor that this historical difference will persist indefinitely in the future.
