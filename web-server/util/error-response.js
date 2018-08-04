const isProduction = process.env.NODE_ENV === 'production'

let errorResponse

if(isProduction) {
  errorResponse = function(req, res, next) {
    res.error = function(err) {
      res.status(err.statusCode || 500)
        .send({
          message: err.message,
          code: err.code
        })
    }
    next()
  }
} else {
  errorResponse = function(req, res, next) {
    res.error = function(err) {
      res.status(err.statusCode || 500)
        .send({
          message: err.message,
          code: err.code,
          stack: err.stack
        })
    }
    next()
  }
}

module.exports = errorResponse