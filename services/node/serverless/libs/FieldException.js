const LambdaException = require('./LambdaException')
const LambdaErrorTypes = require('./LambdaErrorTypes')

class FieldException extends LambdaException {
  constructor(message){
    super(`${message}`, LambdaErrorTypes.BAD_REQUEST)

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = FieldException
