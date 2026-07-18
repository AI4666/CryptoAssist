if (!require(plumber)) install.packages("plumber", repos = "http://cran.us.r-project.org")
library(plumber)

pr <- plumb("plumber.R")
pr$run(port = 8000, host = "0.0.0.0")
