require('module-alias/register')

const { User } = require(`@serverless/models/mongodb`)

const LambdaException = require('@serverless/libs/LambdaException')
const LambdaErrorTypes = require('@serverless/libs/LambdaErrorTypes')
const LambdaUtils = require('@serverless/libs/LambdaUtils')
const DbConnector = require('@serverless/libs/DbConnector')

const mongoose = require('mongoose')

const resetAllHandler = LambdaUtils.toLambdaFnc(async(evt, ctx, callback) => {
  const users = await User.find({},{_id:1}).lean()

  await User.deleteMany({})

  return {
    users: users.map(user => user._id)
  }
}, [DbConnector.MONGO])

const resetUsersHandler = LambdaUtils.toLambdaFnc(async(evt, ctx, callback) => {
    const users = await User.find({},{_id:1}).lean()

    await User.deleteMany({})

    return {users: users.map(user => user._id)}
}, [DbConnector.MONGO])

module.exports = {
  resetAllHandler,
  resetUsersHandler
}
