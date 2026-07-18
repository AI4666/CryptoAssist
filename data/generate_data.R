set.seed(42)

dates <- seq(as.Date("2025-01-01"), as.Date("2025-12-31"), by = "days")
n <- length(dates)

# Simulate BTC
btc_start <- 45000
btc_returns <- rnorm(n, mean = 0.001, sd = 0.03)
btc_close <- btc_start * cumprod(1 + btc_returns)
btc_open <- c(btc_start, btc_close[-n])
btc_high <- btc_close * (1 + abs(rnorm(n, 0, 0.01)))
btc_low <- btc_open * (1 - abs(rnorm(n, 0, 0.01)))
btc_volume <- runif(n, 1e9, 5e9)
btc_mc <- btc_close * 19e6

btc_df <- data.frame(
  Date = dates,
  Coin = "BTC",
  Open = btc_open,
  High = btc_high,
  Low = btc_low,
  Close = btc_close,
  Volume = btc_volume,
  MarketCap = btc_mc,
  DailyReturn = btc_returns
)

# Simulate ETH
eth_start <- 2500
eth_returns <- rnorm(n, mean = 0.0015, sd = 0.04) # Slightly higher volatility
eth_close <- eth_start * cumprod(1 + eth_returns)
eth_open <- c(eth_start, eth_close[-n])
eth_high <- eth_close * (1 + abs(rnorm(n, 0, 0.015)))
eth_low <- eth_open * (1 - abs(rnorm(n, 0, 0.015)))
eth_volume <- runif(n, 5e8, 2e9)
eth_mc <- eth_close * 120e6

eth_df <- data.frame(
  Date = dates,
  Coin = "ETH",
  Open = eth_open,
  High = eth_high,
  Low = eth_low,
  Close = eth_close,
  Volume = eth_volume,
  MarketCap = eth_mc,
  DailyReturn = eth_returns
)

# Simulate SOL
sol_start <- 100
sol_returns <- rnorm(n, mean = 0.002, sd = 0.05)
sol_close <- sol_start * cumprod(1 + sol_returns)
sol_open <- c(sol_start, sol_close[-n])
sol_high <- sol_close * (1 + abs(rnorm(n, 0, 0.02)))
sol_low <- sol_open * (1 - abs(rnorm(n, 0, 0.02)))
sol_volume <- runif(n, 1e8, 5e8)
sol_mc <- sol_close * 400e6

sol_df <- data.frame(
  Date = dates,
  Coin = "SOL",
  Open = sol_open,
  High = sol_high,
  Low = sol_low,
  Close = sol_close,
  Volume = sol_volume,
  MarketCap = sol_mc,
  DailyReturn = sol_returns
)

crypto_data <- rbind(btc_df, eth_df, sol_df)

# Introduce a few missing values to allow for data quality checks
missing_indices <- sample(1:nrow(crypto_data), 10)
crypto_data$Volume[missing_indices] <- NA

write.csv(crypto_data, "crypto_data.csv", row.names = FALSE)
cat("Dataset generated successfully at data/crypto_data.csv\n")
