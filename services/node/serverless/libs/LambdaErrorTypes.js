class LambdaErrorTypes {
  static ACCOUNT_LIMIT = new LambdaErrorTypes(`Account Limit`)
  static BAD_REQUEST = new LambdaErrorTypes(`Bad Request`)
  static CONFLICT = new LambdaErrorTypes(`Conflict`)
  static INTERNAL_ERROR = new LambdaErrorTypes(`Internal Error`)
  static MISSING = new LambdaErrorTypes(`Missing`)
  static UNAUTHORIZED = new LambdaErrorTypes(`Unauthorized`)
  static VALIDATION_ERROR = new LambdaErrorTypes(`Validation Error`)

  constructor(errorType) {
    this.errorType = errorType
  }
  toString() {
    return `${this.errorType}`
  }
}

module.exports = LambdaErrorTypes
