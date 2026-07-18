# CryptoAssist: Cryptocurrency Statistical Assistant

## Student Details
**Student Name:** [Your Name]  
**Selected Implementation Level:** Level 3 (Full Local Statistical Application)

## Project Overview
- **Industry:** Finance / Cryptocurrency
- **Intended User:** Retail Crypto Investor or Portfolio Manager
- **Problem:** The investor needs to analyze historical pricing, volatility, and market trends to manage portfolio risk effectively.
- **Decision Supported:** Determine which crypto assets to hold, buy, or sell based on volatility, historical trends, and risk assessments.
- **Dataset Source:** Synthetic historical cryptocurrency prices for BTC, ETH, and SOL (1 year of daily data, generated in R).

## Six-Skill Summary Table

| Skill | User Question | Method | Main Output | Decision Supported |
|---|---|---|---|---|
| Explore | What is the distribution of daily returns for BTC? | Descriptive statistics & Histogram | Mean, SD, Min, Max, Histogram data | Understand the baseline volatility of an asset to gauge general risk. |
| Compare | Does BTC have a significantly different average daily return compared to ETH? | Welch Two Sample t-test | Group means, estimated difference, p-value, 95% CI | Choose between two assets based on historical performance differences. |
| Model | What factors (Volume, MarketCap) are associated with the daily return? | Multiple Linear Regression | R-squared, model coefficients | Identify which market factors are most strongly driving price changes. |
| Trend Analysis | Is the current price trend bullish or bearish? | 30-Day Moving Average | Current price, 30-day MA, Bullish/Bearish status | Time entry or exit points based on short-term momentum. |
| Outlier Detection | Which days experienced unusually extreme market movements? | Z-Score Outlier Detection (|Z| > 3) | Count of outliers and specific extreme dates | Identify historical periods of extreme instability to test portfolio resilience. |
| Asset Ranking | Which coin has the highest risk-adjusted historical return? | Sharpe Ratio (Mean Return / SD) | Ranked list of assets | Prioritize asset allocation towards the highest ranked coin. |

## Instructions for Running the Project

### Prerequisites
- **Required Software:** R, RStudio (optional), Node.js (v18+), npm.
- **Required R Packages:** `dplyr`, `plumber`

### Running the API Backend (R Plumber)
1. Navigate to the `backend/` directory in R or your terminal.
2. Run the `run.R` script to start the Plumber API on port 8000:
   ```bash
   Rscript run.R
   ```

### Running the Frontend Interface (Next.js)
1. Navigate to the root directory `CryptoAssist/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Interface
![Application Screenshot](screenshot.png) *(Note: Please add a screenshot of the Next.js app running here)*

## Main Limitations
1. **Dataset Limitation:** The dataset uses synthetically generated data; real crypto markets exhibit extreme non-linear volatility not fully captured by random generation.
2. **Statistical Limitation:** Moving averages are lagging indicators and linear regression may fail to capture complex, non-linear market behaviors.
3. **Implementation Limitation:** The system currently calculates metrics based on a static dataset rather than a live websocket or real-time API feed.

## How Google Antigravity and Agent Skills Were Used
1. **Request:** "Explore the daily returns of BTC."
   - **Skill Used:** Explore Data (`skills/explore/SKILL.md`)
   - **File Created/Changed:** Sent API request, generated descriptive output.
   - **Reviewed:** I reviewed the histogram logic to ensure proper data distribution representation.
   - **Result:** Accepted the generated API structure.

2. **Request:** "Build a 30-day moving average trend analysis."
   - **Skill Used:** Trend Analysis (`skills/trend-analysis/SKILL.md`)
   - **File Created/Changed:** Created `R/trend.R`
   - **Reviewed:** I verified that the SMA calculation correctly ordered the dates before calculating the moving average.
   - **Result:** Corrected a minor issue with the tail function to ensure it returned numeric values.

3. **Request:** "Set up an API for the Asset Ranking skill."
   - **Skill Used:** Asset Ranking (`skills/asset-ranking/SKILL.md`)
   - **File Created/Changed:** Created `R/ranking.R` and updated `backend/plumber.R`
   - **Reviewed:** I ensured the Sharpe ratio logic correctly divided mean returns by standard deviation over the last 90 days.
   - **Result:** Accepted the agent's logic for filtering by date and grouping by coin.
