module.exports = function(req, res, next) {
  res.handleCallback = function(err, result) {
    if(err) return res.error(err)
    res.send(result)
  }
  next()
}