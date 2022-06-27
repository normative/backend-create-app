const LambdaException = require('@serverless/libs/LambdaException')
const LambdaErrorTypes = require('@serverless/libs/LambdaErrorTypes')
const DbConnector = require('@serverless/libs/DbConnector')
const Utils = require('@serverless/libs/Utils')
const Request = require('@serverless/libs/Request')

class LambdaUtils {
  static toLambdaFnc(fnc, dbs = []){
    return async (evt, ctx, callback) => {
      let results = []
      let errors = []

      ctx.dbs = {}

      try {
        //Type checking
        if(typeof (fnc) !== 'function'){
          throw new LambdaException(`Invalid function passed to be processed. Must be a function. Provided: ${fnc}. Type: ${typeof (fnc)}`)
        }
        if(!Array.isArray(dbs)){
          throw new LambdaException(`Invalid list of database connections to make provided. Must provide an array. Provided: ${dbs}. Type: ${typeof (dbs)}`)
        }
        dbs.forEach(db => {
          if(!(db instanceof DbConnector)){
            throw new LambdaException(`Invalid list of database connections to make provided. Included: ${db}. Must be an instance of DbConnector.`)
          }
        })

        //Connecting to DBs
        const params = Utils.getParams()
        for(let db of dbs){
          await db.connect(ctx, params)
        }

        //results can either be an array([results: [], errors: []) or just results(object)
        results = await fnc(evt, ctx, callback)

        if(Array.isArray(results)){
          errors = results.length > 1 ? results[1] : errors
          results = results[0]
        }

        results = [results]

        if(errors.length){
          throw new LambdaException(errors[0].message)
        }
      } catch(e){
        if(e instanceof LambdaException){
          ctx.fail(e.message)
        } else {
          ctx.fail(`${LambdaErrorTypes.INTERNAL_ERROR}: ${e.message}`)
        }
      }

      return Request.convertResults(results, errors)
    }
  }
}

module.exports = LambdaUtils
