run_trend <- function(inputs) {
  coin <- inputs$coin
  validate_coin(coin)
  validate_date_variable()
  
  window <- if (!is.null(inputs$window)) as.numeric(inputs$window) else 30
  
  coin_data <- crypto_data[crypto_data$Coin == coin, ]
  coin_data <- coin_data[order(coin_data$Date), ]
  
  if(nrow(coin_data) < window) {
      stop(paste("Not enough data to calculate a", window, "-day moving average."))
  }
  
  ma_calc <- stats::filter(coin_data$Close, rep(1/window, window), sides=1)
  
  last_ma <- as.numeric(tail(ma_calc, 1))
  current_price <- as.numeric(tail(coin_data$Close, 1))
  
  result <- list(
    status = "success",
    skill_name = "trend-analysis",
    method = paste(window, "-Day Moving Average", sep=""),
    main_result = list(
      current_price = current_price,
      ma_val = last_ma,
      window = window,
      trend = ifelse(current_price > last_ma, "Bullish (Above MA)", "Bearish (Below MA)"),
      plot_data = list(
          date = as.character(coin_data$Date),
          close = coin_data$Close,
          ma_val = as.numeric(ma_calc)
      )
    ),
    interpretation = paste("The current price of", coin, "is", ifelse(current_price > last_ma, "above", "below"), "its", window, "-day moving average, indicating a", ifelse(current_price > last_ma, "bullish", "bearish"), "short-term trend."),
    limitation = "Moving averages are lagging indicators and may not accurately predict sudden market reversals."
  )
  return(result)
}
