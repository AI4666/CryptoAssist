# Outlier Detection

## Purpose
What industry question does this skill answer?
It answers: Which days experienced unusually high or low market movements (crashes or spikes) for a cryptocurrency?

## When to Use
What type of request should activate this skill?
Use this skill when the user wants to identify extreme events, anomalies, crashes, or spikes in a specific variable (like returns or volume).

## Required Inputs
What variables, files, or user selections are required?
- `coin`: The cryptocurrency symbol (e.g., "ETH").
- `variable`: The numeric variable to check for outliers (e.g., "DailyReturn" or "Volume").

## Files Used
Which R scripts, data files, Quarto pages, or API endpoints are used?
- Backend API Endpoint: `POST /outliers`
- R Script: `R/outliers.R`

## Method
What statistical or analytical method is used?
Z-score analysis (flagging observations where |Z| > 3).

## Procedure
What steps should Antigravity follow?
1. Extract `coin` and `variable` from the user's request.
2. Send a POST request to `http://localhost:8000/outliers` with JSON body:
   `{"inputs": {"coin": "ETH", "variable": "DailyReturn"}}`
3. Receive the list of extreme dates/values.
4. Present the number of outliers found and list the most extreme events.

## Validation
What must be checked before running the analysis?
- The coin must exist in the dataset.
- The variable must be numeric.

## Output
What statistic, table, chart, score, estimate, or prediction is returned?
- Total observations processed.
- Total number of outliers detected.
- A list of outlier dates, raw values, and their respective Z-scores.

## Interpretation
How should the result be explained to the industry user?
Explain that these specific dates represent extreme deviations from normal market behavior (more than 3 standard deviations), indicating major market events, news catalysts, or extreme volatility.

## Limitation
What should the user not conclude?
Z-scores assume the underlying data follows a normal distribution. In crypto, "fat tails" are common, meaning extreme events happen more frequently than a strict normal distribution implies.
