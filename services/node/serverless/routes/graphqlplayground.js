const lambdaPlayground = require('graphql-playground-middleware-lambda').default

module.exports = {
  playgroundHandler: lambdaPlayground({
    endpoint: 'https://yxgxm53webafnn54kk4ovc3nha.appsync-api.us-east-1.amazonaws.com/graphql'
  })
}
