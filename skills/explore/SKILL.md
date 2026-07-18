# Explore Data

## Purpose
What industry question does this skill answer?
It answers: What does the distribution of a specific financial variable (e.g., daily returns, trading volume) look like for a given cryptocurrency?

## When to Use
What type of request should activate this skill?
Use this skill when the user asks to explore, summarize, or visualize the distribution, average, or range of a single variable for one cryptocurrency.

## Required Inputs
What variables, files, or user selections are required?
- `coin`: The cryptocurrency symbol (e.g., "BTC").
- `variable`: The numeric variable to analyze (e.g., "DailyReturn", "Volume", "Close").

## Files Used
Which R scripts, data files, Quarto pages, or API endpoints are used?
- Backend API Endpoint: `POST /explore`
- R Script: `R/explore.R`

## Method
What statistical or analytical method is used?
Descriptive statistics (mean, standard deviation, min, max, missing value counts) and histogram visualization data.

## Procedure
What steps should Antigravity follow?
1. Extract the `coin` and `variable` from the user's request.
2. Send a POST request to `http://localhost:8000/explore` with JSON body:
   `{"inputs": {"coin": "BTC", "variable": "DailyReturn"}}`
3. Receive the statistical summary from the API.
4. Present the statistics and the interpretation to the user.

## Validation
What must be checked before running the analysis?
- The coin must exist in the dataset.
- The variable must be numeric.
- The variable must not have more than 50% missing data.

## Output
What statistic, table, chart, score, estimate, or prediction is returned?
- Mean, Standard Deviation, Min, Max, and missing value counts.
- Histogram bin breaks and counts.

## Interpretation
How should the result be explained to the industry user?
Explain the average value and the spread (standard deviation). State whether the distribution suggests high or low volatility based on the spread.

## Limitation
What should the user not conclude?
The user should not conclude that historical averages or volatility guarantee future market performance.
