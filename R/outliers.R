run_outliers <- function(inputs) {
  coin <- inputs$coin
  variable <- inputs$variable
  
  validate_coin(coin)
  validate_numeric(variable)
  
  coin_data <- crypto_data[crypto_data$Coin == coin, ]
  valid_data <- coin_data[!is.na(coin_data[[variable]]), ]
  
  mean_val <- mean(valid_data[[variable]])
  sd_val <- sd(valid_data[[variable]])
  
  valid_data$z_score <- (valid_data[[variable]] - mean_val) / sd_val
  
  outliers <- valid_data[abs(valid_data$z_score) > 3, ]
  
  outlier_list <- lapply(1:nrow(outliers), function(i) {
      list(
          date = as.character(outliers$Date[i]),
          value = outliers[[variable]][i],
          z_score = outliers$z_score[i]
      )
  })
  
  result <- list(
    status = "success",
    skill_name = "outlier-detection",
    method = "Z-Score Outlier Detection",
    main_result = list(
      total_observations = nrow(valid_data),
      outlier_count = nrow(outliers),
      outliers = outlier_list
    ),
    interpretation = paste("Found", nrow(outliers), "days where the", variable, "was unusually high or low (more than 3 standard deviations from the mean)."),
    limitation = "Z-score assumes a normal distribution, which may not be appropriate for highly skewed financial data."
  )
  return(result)
}
