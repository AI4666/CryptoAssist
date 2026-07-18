run_model <- function(inputs) {
  coin <- inputs$coin
  outcome <- inputs$outcome_variable
  predictors <- inputs$predictor_variables
  
  validate_coin(coin)
  validate_numeric(outcome)
  if(length(predictors) == 0) {
      stop("A prediction is requested without required inputs.")
  }
  for (p in predictors) validate_numeric(p)
  
  coin_data <- crypto_data[crypto_data$Coin == coin, ]
  
  formula_str <- paste(outcome, "~", paste(predictors, collapse = " + "))
  
  model <- lm(as.formula(formula_str), data = coin_data)
  s <- summary(model)
  
  result <- list(
    status = "success",
    skill_name = "model",
    method = "Multiple Linear Regression",
    main_result = list(
      r_squared = s$r.squared,
      adj_r_squared = s$adj.r.squared,
      coefficients = as.list(coef(model))
    ),
    interpretation = paste("The model explains", round(s$r.squared * 100, 2), "% of the variance in", outcome, "using", paste(predictors, collapse=", ")),
    limitation = "This is a linear model which may not capture complex non-linear dynamics of crypto markets. It also assumes stationary variables which might not hold."
  )
  return(result)
}
