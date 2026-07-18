library(plumber)

source("../R/clean_data.R")
source("../R/explore.R")
source("../R/compare.R")
source("../R/model.R")
source("../R/trend.R")
source("../R/outliers.R")
source("../R/ranking.R")

#* @apiTitle CryptoAssist Statistical API
#* @apiDescription R Plumber API for the Industry Statistical Assistant

#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  
  plumber::forward()
}

#* Check API Health
#* @get /health
function() {
  list(status = "OK", message = "API is running")
}

#* Explore Data Skill
#* @param inputs:object
#* @post /explore
function(req, res, inputs) {
  tryCatch({
    # Plumber automatically parses the JSON body into function arguments if named.
    # If the user sends {"inputs": {"coin": "BTC", "variable": "DailyReturn"}}, inputs will be a list.
    run_explore(inputs)
  }, error = function(e) {
    res$status <- 400
    list(status = "Error", message = e$message)
  })
}

#* Compare Two Groups Skill
#* @param inputs:object
#* @post /compare
function(req, res, inputs) {
  tryCatch({
    run_compare(inputs)
  }, error = function(e) {
    res$status <- 400
    list(status = "Error", message = e$message)
  })
}

#* Statistical Model Skill
#* @param inputs:object
#* @post /model
function(req, res, inputs) {
  tryCatch({
    run_model(inputs)
  }, error = function(e) {
    res$status <- 400
    list(status = "Error", message = e$message)
  })
}

#* Trend Analysis Skill
#* @param inputs:object
#* @post /trend
function(req, res, inputs) {
  tryCatch({
    run_trend(inputs)
  }, error = function(e) {
    res$status <- 400
    list(status = "Error", message = e$message)
  })
}

#* Outlier Detection Skill
#* @param inputs:object
#* @post /outliers
function(req, res, inputs) {
  tryCatch({
    run_outliers(inputs)
  }, error = function(e) {
    res$status <- 400
    list(status = "Error", message = e$message)
  })
}

#* Asset Ranking Skill
#* @param inputs:object
#* @post /ranking
function(req, res, inputs) {
  tryCatch({
    # For ranking, inputs might be empty list or NULL, we handle it if missing.
    if (missing(inputs)) inputs <- list()
    run_ranking(inputs)
  }, error = function(e) {
    res$status <- 400
    list(status = "Error", message = e$message)
  })
}

#* General Run Skill Endpoint
#* @param skill:string
#* @param inputs:object
#* @post /run-skill
function(req, res, skill, inputs) {
  if (missing(skill) || is.null(skill)) {
    res$status <- 400
    return(list(status = "Error", message = "Skill name is required."))
  }
  
  if (missing(inputs)) inputs <- list()
  
  tryCatch({
    result <- switch(skill,
      "explore" = run_explore(inputs),
      "compare" = run_compare(inputs),
      "model" = run_model(inputs),
      "trend-analysis" = run_trend(inputs),
      "outlier-detection" = run_outliers(inputs),
      "asset-ranking" = run_ranking(inputs),
      stop("Invalid skill name provided.")
    )
    return(result)
  }, error = function(e) {
    res$status <- 400
    list(status = "Error", message = e$message)
  })
}
