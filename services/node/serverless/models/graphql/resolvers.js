const {user} = require('./resolvers/')
const {awsDateScalar, awsTimeScalar, awsDateTimeScalar, awsJSONScalar} = require('./resolvers/scalars')

const resolvers = {
  Query: {
    ...user.Query
  },
  Mutation: {
    ...user.Mutation
  },
  Subscription: {
    ...user.Subscription
  },
  AWSDate: awsDateScalar,
  AWSTime: awsTimeScalar,
  AWSDateTime: awsDateTimeScalar,
  AWSJSON: awsJSONScalar
}

module.exports = resolvers
