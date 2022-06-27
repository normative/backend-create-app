require('module-alias/register')

const resolvers = require('@serverless/models/graphql/resolvers')

module.exports = {
  ...resolvers.Query,
  ...resolvers.Mutation,
  ...resolvers.Subscription
}
