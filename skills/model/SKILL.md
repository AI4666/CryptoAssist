# Statistical Model

## Purpose
What industry question does this skill answer?
It answers: What factors (e.g., volume, market cap) are associated with the outcome (e.g., daily returns) of a cryptocurrency?

## When to Use
What type of request should activate this skill?
Use this skill when the user asks to predict an outcome, find associations, or understand what drives a particular metric for a cryptocurrency using multiple variables.

## Required Inputs
What variables, files, or user selections are required?
- `coin`: The cryptocurrency symbol (e.g., "BTC").
- `outcome_variable`: The numeric variable to predict (e.g., "DailyReturn").
- `predictor_variables`: A list of numeric variables to use as predictors (e.g., `["Volume", "MarketCap"]`).

## Files Used
Which R scripts, data files, Quarto pages, or API endpoints are used?
- Backend API Endpoint: `POST /model`
- R Script: `R/model.R`

## Method
What statistical or analytical method is used?
Multiple Linear Regression.

## Procedure
What steps should Antigravity follow?
1. Extract `coin`, `outcome_variable`, and `predictor_variables` from the user's request.
2. Send a POST request to `http://localhost:8000/model` with JSON body:
   `{"inputs": {"coin": "BTC", "outcome_variable": "DailyReturn", "predictor_variables": ["Volume", "MarketCap"]}}`
3. Receive the regression results from the API.
4. Present the evaluation metrics, coefficients, and interpretation to the user.

## Validation
What must be checked before running the analysis?
- The coin must exist.
- The outcome and all predictor variables must exist and be numeric.
- At least one predictor variable must be provided.

## Output
What statistic, table, chart, score, estimate, or prediction is returned?
- R-squared and Adjusted R-squared (model evaluation).
- Estimated coefficients for each predictor.

## Interpretation
How should the result be explained to the industry user?
Explain how much variance the model explains (R-squared). Explain which factors appear most important based on the size and sign of the coefficients (e.g., "higher volume is associated with higher returns"). 

## Limitation
What should the user not conclude?
The user should not automatically interpret the results as causal. The model identifies associations, not a direct cause-and-effect relationship. It also assumes linear relationships which may not hold in crypto markets.
