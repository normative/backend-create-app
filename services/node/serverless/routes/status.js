require('module-alias/register')
const LambdaException = require('@serverless/libs/LambdaException')
const LambdaErrorTypes = require('@serverless/libs/LambdaErrorTypes')
const LambdaUtils = require('@serverless/libs/LambdaUtils')
const DbConnector = require('@serverless/libs/DbConnector')
const {User} = require('@serverless/models/mongodb')

const mongoose = require('mongoose')

const getStatus = LambdaUtils.toLambdaFnc(async(evt, ctx, callback) => {
  //Mongo example
  const userDoc = new User({firstName: `firstName-${Math.random()}`, lastName: `lastName-${Math.random()}`})

  const user = await userDoc.save()

  //Redis example
  const redisClient = ctx.dbs.redis
  const redisKey = `key-${Math.random()}`
  await redisClient.set(redisKey, `value-${Math.random()}`)
  const redisKeyValue = await redisClient.get(redisKey)

  return {
    status: 'OK',
    mongo: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected',
    redis: ctx.dbs.redis !== null ? 'Connected' : 'Not Connected',
    mongoUser: user,
    redisKV: {[redisKey]: redisKeyValue}
  }
}, [DbConnector.MONGO, DbConnector.REDIS])

module.exports = {
  getStatus
}
