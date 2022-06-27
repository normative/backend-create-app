const Utils = require('@serverless/libs/Utils')

class GraphqlResolver {
  static #getAwsSubscribeMutationHandlers(typeDef, mutationName){
    const awsSubscribeHandlers = typeDef.definitions.filter(definition => definition.name.value === 'Subscription')?.[0].fields.filter(field =>
      field.directives.filter(directive => directive.name.value === 'aws_subscribe' &&
        directive.arguments[0].value.values.filter(value => value.value === mutationName).length > 0
      ).length > 0)

    return awsSubscribeHandlers.map(handler => handler.name.value)
  }
  static getMutation(fnc, dbs){
    if(!Utils.isServerless()){
      const ApolloUtils = require('@serverless/libs/ApolloUtils')

      const fncNew = async(_, args, ctx, info) => {
        let handlerFncName = info.fieldName

        args = JSON.parse(JSON.stringify(args, null, '\t'))
        let results = await fnc(_, args, ctx, info)

        const typeDefs = ApolloUtils.getTypeDefs()

        const subscriptionNames = GraphqlResolver.#getAwsSubscribeMutationHandlers(typeDefs, handlerFncName)
        for(const subscriptionName of subscriptionNames){
          const subscriptionLabel = this.#handlerToLabel(subscriptionName)
          const pubsub = global.pubsub

          await pubsub.publish(subscriptionLabel, {
            [subscriptionName]: results
          })
        }

        return results
      }

      return ApolloUtils.resolverToApolloFnc(fncNew, dbs)
    }

    return GraphqlResolver.getQuery(fnc, dbs)
  }
  static getQuery(fnc, dbs){
    if(Utils.isServerless()){
      const AppSyncUtils = require('@serverless/libs/AppSyncUtils')

      return AppSyncUtils.resolverToAppSyncFnc(fnc, dbs)
    } else {
      const ApolloUtils = require('@serverless/libs/ApolloUtils')

      return ApolloUtils.resolverToApolloFnc(fnc, dbs)
    }
  }
  static getSubscription(name){
    if(!Utils.isServerless()){
      const pubsub = global.pubsub
      const { withFilter } = require('graphql-subscriptions')

      return {
        subscribe: withFilter(
          () => global.pubsub.asyncIterator([name]),
          (topLevelPayload, variables) => {
            const payload = topLevelPayload[Object.keys(topLevelPayload)?.[0]]

            let allMatch = true
            for(const k in variables){
              if(variables[k] !== payload[k]){
                allMatch = false

                break
              }
            }

            return allMatch
          }
        )
      }
    } else {
      return () => ({})
    }

  }
  static #handlerToLabel(handlerName){
    let label = ''
    for(let currChar of handlerName){
      const upperCaseChar = currChar.toUpperCase()

      if(currChar === upperCaseChar){
        label += '_'
      }
      label += upperCaseChar
    }

    return label
  }
}

module.exports = GraphqlResolver
