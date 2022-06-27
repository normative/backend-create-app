const { ApolloServer } = require('apollo-server-express')

const { makeExecutableSchema } = require('@graphql-tools/schema')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

class ApolloGoose {
  static async createApolloServer(typeDefs, resolvers, app, httpServer, path){
    const schema = makeExecutableSchema({ typeDefs, resolvers })

    const subscriptionServer = null

    if(resolvers.Subscription !== undefined){
      SubscriptionServer.create(
        {schema, execute, subscribe},
        {server: httpServer, path}
      )

      console.info(`🚀 Subscription endpoints @ ws://localhost:${process.env.NODE__PORT_CONTAINER ?? app.get('port')}${path}`)
    }

    const server = new ApolloServer({
      schema,
      plugins: [...(subscriptionServer !== null ? [{
        async serverWillStart(){
          return {
            async drainServer(){
              subscriptionServer.close()
            }
          }
        }
      }] : [])]
    })

    await server.start()

    server.applyMiddleware({ app, path })

    console.info(`🚀 Query/Mutation endpoints @ http://localhost:${process.env.NODE__PORT_CONTAINER ?? app.get('port')}${server.graphqlPath}`)

    return server
  }
}

module.exports = ApolloGoose
