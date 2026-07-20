# Returns a list of unique coins available in the dataset
get_available_coins <- function() {
  # crypto_data is sourced from clean_data.R
  available_coins <- unique(crypto_data$Coin)
  
  result <- list(
    status = "success",
    coins = available_coins
  )
  
  return(result)
}
