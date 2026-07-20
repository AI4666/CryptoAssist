if (!require(dplyr)) install.packages("dplyr", repos = "http://cran.us.r-project.org")
library(dplyr)

# Determine the correct path depending on where the script is run from (backend/ or root)
data_dir <- "data"
if (!dir.exists(data_dir)) {
  data_dir <- "../data"
}

# List of Kaggle CSV files to read
files_to_read <- c("coin_Bitcoin.csv", "coin_Ethereum.csv", "coin_BinanceCoin.csv")

crypto_data_list <- lapply(files_to_read, function(file) {
  file_path <- file.path(data_dir, file)
  if (file.exists(file_path)) {
    read.csv(file_path, stringsAsFactors = FALSE)
  } else {
    NULL
  }
})

# Combine all the individual coin data frames into one
raw_data <- do.call(rbind, crypto_data_list)

if (is.null(raw_data) || nrow(raw_data) == 0) {
  stop("Could not find Kaggle CSV files in the data directory.")
}

# Clean and format to match what our skills expect
crypto_data <- raw_data %>%
  rename(
    Coin = Symbol,
    MarketCap = Marketcap
  ) %>%
  mutate(Date = as.Date(Date)) %>%
  arrange(Coin, Date) %>%
  group_by(Coin) %>%
  mutate(DailyReturn = (Close - lag(Close)) / lag(Close)) %>%
  ungroup() %>%
  filter(!is.na(DailyReturn)) # Remove first day NAs from lag calculation

# Validation functions
validate_coin <- function(coin) {
  if (is.null(coin) || coin == "") stop("A coin must be specified.")
  if (!(coin %in% unique(crypto_data$Coin))) {
    stop(paste("The requested coin", coin, "did not appear in the dataset."))
  }
}

validate_numeric <- function(var_name) {
  if (is.null(var_name) || var_name == "") stop("A variable must be specified.")
  if (!(var_name %in% colnames(crypto_data))) stop("The selected variable does not exist.")
  if (!is.numeric(crypto_data[[var_name]])) stop(paste("The selected outcome must be numeric. (", var_name, ")"))
}

validate_date_variable <- function() {
    if(!("Date" %in% colnames(crypto_data))) {
        stop("This skill requires a valid date variable.")
    }
}
