run_ranking <- function(inputs) {
  validate_date_variable()
  
  recent_data <- crypto_data[crypto_data$Date >= (max(crypto_data$Date) - 90), ]
  
  if(nrow(recent_data) == 0) {
      stop("No data available for the last 90 days.")
  }
  
  stats <- recent_data %>%
    group_by(Coin) %>%
    summarize(
      mean_return = mean(DailyReturn, na.rm = TRUE),
      sd_return = sd(DailyReturn, na.rm = TRUE),
      .groups = "drop"
    ) %>%
    mutate(sharpe_ratio = mean_return / sd_return) %>%
    arrange(desc(sharpe_ratio))
  
  ranking_list <- lapply(1:nrow(stats), function(i) {
      list(
          rank = i,
          coin = stats$Coin[i],
          sharpe_ratio = stats$sharpe_ratio[i],
          mean_return = stats$mean_return[i],
          volatility = stats$sd_return[i]
      )
  })
  
  result <- list(
    status = "success",
    skill_name = "asset-ranking",
    method = "Risk-Adjusted Return (Sharpe Ratio) Ranking",
    main_result = list(
      period_days = 90,
      ranking = ranking_list
    ),
    interpretation = paste("The highest ranked asset based on risk-adjusted returns is", stats$Coin[1], "."),
    limitation = "The simplified Sharpe ratio assumes normal distribution of returns and a risk-free rate of 0."
  )
  return(result)
}
