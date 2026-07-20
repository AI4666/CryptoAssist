run_explore <- function(inputs) {
  coin <- inputs$coin
  variable <- inputs$variable
  
  validate_coin(coin)
  validate_numeric(variable)
  
  coin_data <- crypto_data[crypto_data$Coin == coin, ]
  
  # Data Quality Check
  missing_count <- sum(is.na(coin_data[[variable]]))
  if(missing_count > (0.5 * nrow(coin_data))) {
      stop("The selected outcome contains too much missing data.")
  }
  
  valid_data <- coin_data[[variable]][!is.na(coin_data[[variable]])]
  
  mean_val <- mean(valid_data)
  sd_val <- sd(valid_data)
  min_val <- min(valid_data)
  max_val <- max(valid_data)
  
  hist_data <- hist(valid_data, plot = FALSE)
  
  result <- list(
    status = "success",
    skill_name = "explore",
    method = "Descriptive Statistics",
    main_result = list(
      mean = mean_val,
      sd = sd_val,
      min = min_val,
      max = max_val,
      missing_values = missing_count,
      histogram = list(
        breaks = hist_data$breaks,
        counts = hist_data$counts
      )
    ),
    interpretation = paste("The average", variable, "for", coin, "is", round(mean_val, 4), "with a standard deviation of", round(sd_val, 4), "."),
    limitation = "These descriptive statistics summarize historical data only and do not predict future performance."
  )
  
  return(result)
}
