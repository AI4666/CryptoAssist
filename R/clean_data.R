if (!require(dplyr)) install.packages("dplyr", repos = "http://cran.us.r-project.org")
library(dplyr)

# Determine the correct path depending on where the script is run from (backend/ or root)
dataset_path <- "data/crypto_data.csv"
if(!file.exists(dataset_path)) {
  dataset_path <- "../data/crypto_data.csv"
}

if(file.exists(dataset_path)) {
    crypto_data <- read.csv(dataset_path, stringsAsFactors = FALSE)
    crypto_data$Date <- as.Date(crypto_data$Date)
} else {
    stop("Could not find data/crypto_data.csv")
}

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
