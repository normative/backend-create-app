const LambdaException = require('@serverless/libs/LambdaException')
const DbConnector = require('@serverless/libs/DbConnector')
const Utils = require('@serverless/libs/Utils')

class AppSyncUtils {
  static getFieldsObject(selectionArray){
    //Getting rid of object keys
    const selectionArrayFiltered = []
    selectionArray.filter((selection, i) => {
      if(!selectionArray.filter((selectionInner, j) => i !== j && selectionInner.startsWith(selection + '/')).length){
        selectionArrayFiltered.push(selection)
      }
    })

    const selectionArraySplit = selectionArrayFiltered.map(selection => selection.split('/'))

    const fields = {}
    selectionArraySplit.forEach((selectionParts, i) => {
      let currPointer = fields

      selectionParts.forEach((field, j) => {
        if(j === selectionParts.length - 1){
          currPointer[field] = 1
        } else {
          if(currPointer[field] === undefined){
            currPointer[field] = {}
          }

          currPointer = currPointer[field]
        }
      })
    })

    return fields
  }
  static getTypeDefs(){
    return Utils.getGraphQLTypeDefsFromFile(
      './models/graphql/schema.graphql',
      false
    )
  }
  static resolverToAppSyncFnc(fnc, dbs = []){
    return async(evt, ctx, callback) => {
      //Type checks
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

      //Getting fields
      evt.fields = this.getFieldsObject(evt.fields)

      //Getting db connections
      ctx.dbs = {}

      const params = Utils.getParams()
      for(let db of dbs){
        await db.connect(ctx, params)
      }

      return await fnc(evt.arguments, evt.fields, ctx, evt)
    }
  }
}

module.exports = AppSyncUtils
