# Trend Analysis

## Purpose
What industry question does this skill answer?
It answers: How has the price trend of a cryptocurrency changed over time, and is the current short-term trend bullish or bearish?

## When to Use
What type of request should activate this skill?
Use this skill when the user asks about the recent price trend, momentum, or wants to see a moving average for a specific coin.

## Required Inputs
What variables, files, or user selections are required?
- `coin`: The cryptocurrency symbol (e.g., "BTC").

## Files Used
Which R scripts, data files, Quarto pages, or API endpoints are used?
- Backend API Endpoint: `POST /trend`
- R Script: `R/trend.R`

## Method
What statistical or analytical method is used?
30-Day Simple Moving Average (SMA).

## Procedure
What steps should Antigravity follow?
1. Extract the `coin` from the user's request.
2. Send a POST request to `http://localhost:8000/trend` with JSON body:
   `{"inputs": {"coin": "BTC"}}`
3. Receive the trend analysis results.
4. Explain whether the trend is bullish or bearish and present the current price vs moving average.

## Validation
What must be checked before running the analysis?
- The coin must exist in the dataset.
- A valid date variable must be present in the dataset.
- There must be at least 30 days of data for the chosen coin.

## Output
What statistic, table, chart, score, estimate, or prediction is returned?
- Current Price
- 30-Day Moving Average value
- Trend status ("Bullish" or "Bearish")
- Time-series plot data.

## Interpretation
How should the result be explained to the industry user?
Explain that if the current price is above the 30-day moving average, it generally indicates positive momentum (bullish), whereas a price below the average indicates negative momentum (bearish).

## Limitation
What should the user not conclude?
Moving averages are lagging indicators based on past data. A bullish trend today does not guarantee the price will not drop tomorrow.
