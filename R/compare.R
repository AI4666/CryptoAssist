run_compare <- function(inputs) {
  coin1 <- inputs$coin1
  coin2 <- inputs$coin2
  outcome <- inputs$outcome_variable
  
  validate_coin(coin1)
  validate_coin(coin2)
  validate_numeric(outcome)
  
  if (coin1 == coin2) {
      stop("The grouping variable must contain exactly two valid groups.")
  }
  
  group1 <- crypto_data[crypto_data$Coin == coin1, outcome]
  group2 <- crypto_data[crypto_data$Coin == coin2, outcome]
  
  group1 <- group1[!is.na(group1)]
  group2 <- group2[!is.na(group2)]
  
  if (length(group1) < 30 || length(group2) < 30) {
      stop("One group contains too few observations.")
  }
  
  t_test_result <- t.test(group1, group2, var.equal = FALSE)
  
  result <- list(
    status = "success",
    skill_name = "compare",
    method = "Welch Two Sample t-test",
    main_result = list(
      coin1_n = length(group1),
      coin2_n = length(group2),
      coin1_mean = t_test_result$estimate[1],
      coin2_mean = t_test_result$estimate[2],
      estimated_difference = t_test_result$estimate[1] - t_test_result$estimate[2],
      p_value = t_test_result$p.value,
      confidence_interval = as.numeric(t_test_result$conf.int)
    ),
    interpretation = paste("We compared the average", outcome, "between", coin1, "and", coin2, ". The difference is", 
                           ifelse(t_test_result$p.value < 0.05, "statistically significant.", "not statistically significant.")),
    limitation = "This analysis identifies an association. It does not prove causation and assumes independent observations."
  )
  return(result)
}
