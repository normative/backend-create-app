const Utils = require('@serverless/libs/Utils')

const typeDefs = Utils.getGraphQLTypeDefsFromDir('./serverless/models/graphql/sdls', 'user.graphql', 'scalars.graphql')

let pubsub = null
if(typeDefs.definitions.filter(definition => definition.name.value === 'Subscription').length){
  const {PubSub} = require('graphql-subscriptions')

  pubsub = new PubSub()
}

global.pubsub = pubsub

const resolvers = require('@serverless/models/graphql/resolvers')

module.exports = {typeDefs, resolvers}
