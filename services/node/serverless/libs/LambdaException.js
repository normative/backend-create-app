const LambdaErrorTypes = require('./LambdaErrorTypes')

class LambdaException extends Error {
  constructor(message, type){
    type = type === undefined ? LambdaErrorTypes.BAD_REQUEST : type

    super(`${type}: ${message}`)

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = LambdaException
