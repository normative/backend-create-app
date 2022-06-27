const LambdaException = require('@serverless/libs/LambdaException')
const DbConnector = require('@serverless/libs/DbConnector')
const Utils = require('@serverless/libs/Utils')

class ApolloUtils {
  static getFieldsObject(selectionSet){
    const fields = {}

    selectionSet.selections.filter(selection => selection.kind === 'Field').forEach(selection => {
      const currName = selection.name.value
      if(selection.selectionSet !== undefined){
        fields[currName] = this.getFieldsObject(selection.selectionSet)
      } else {
        fields[currName] = 1
      }
    })

    return fields
  }
  static getTypeDefs(){
    return Utils.getGraphQLTypeDefsFromFile(
      './serverless/models/graphql/schema.graphql',
      false
    )
  }
  static resolverToApolloFnc(fnc, dbs = []){
    return async(_, args, ctx, info) => {
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
      const fields = this.getFieldsObject(info.fieldNodes[0].selectionSet)

      //Getting db connections
      ctx.dbs = {}

      const params = Utils.getParams()
      for(let db of dbs){
        await db.connect(ctx, params)
      }

      args = JSON.parse(JSON.stringify(args, null, '\t'))

      return await fnc(args, fields, ctx, {fieldName: info.fieldName})
    }
  }
}

module.exports = ApolloUtils
