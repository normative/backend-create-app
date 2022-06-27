class ExpressError {
  static getError(res, err){
    return res.error({
      'errorType': 'string',
      'errorMessage': err.message,
      'trace': []
    })
  }
}

module.exports = ExpressError
