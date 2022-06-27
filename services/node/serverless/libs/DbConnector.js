class DbConnector {
  static MONGO = new DbConnector('mongodb')
  static REDIS = new DbConnector('redis')

  #name = null
  #dbConnector = null
  #dbConnectors = {
    'mongodb': async(ctx, params) => {
      const mongoose = require('mongoose')

      if(mongoose.connection.readyState === 0){
        const Utils = require('@serverless/libs/Utils')

        return Utils.awaitMongooseConnectionUsingConfig()
      }
    },
    'redis': async(ctx, params) => {
      if(ctx.dbs.redis === undefined){
        ctx.dbs.redis = null
      }

      let client = null
      try {
        const asyncRedis = require('async-redis')

        client = await asyncRedis.createClient({
          host: params.REDIS__HOST,
          port: params.REDIS__PORT_HOST
        })
      } catch(e){
        console.log(e)

        throw new Error(e.message)
      }

      ctx.dbs.redis = client

      return client
    }
  }

  constructor(name){
    this.#name = name
    this.#dbConnector = this.#dbConnectors[this.#name]
  }

  connect(ctx, params){
    return this.#dbConnector(ctx, params)
  }

  toString(){
    return this.#name
  }
}

module.exports = DbConnector
