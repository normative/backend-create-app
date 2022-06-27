const AWS = require('aws-sdk')
const URL = require('url')
const fetch = require('node-fetch')

AWS.config.update({
  region: process.env.REGION,
  credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, process.env.AWS_SESSION_TOKEN)
})

class AppSyncTrigger {
  static async triggerSubscription(model, mutationType, data){
    const req = `mutation($_id: ID!, $mutationInfo: SubMutationInfo_Input!, $data: AWSJSON!){
      facilityMutated(_id: $_id, mutationInfo: $mutationInfo, data: $data){
        _id
        mutationInfo {
          model
          mutationType
        }
        data
      }
    }`

    Object.keys(data).forEach(key => {
      if(key.startsWith('__')){
        delete data[key]
      }
    })

    await AppSyncTrigger.signRequest({
      query: req,
      variables: JSON.stringify({
        _id: data._id,
        mutationInfo: {model, mutationType},
        data
      })
    })
  }
  static async signRequest(data){
    const uri = URL.parse(process.env.GRAPHQL_API)

    const httpRequest = new AWS.HttpRequest(uri.href, process.env.REGION)
    httpRequest.headers.host = uri.host
    httpRequest.headers['Content-Type'] = 'application/json'
    httpRequest.headers['x-api-key'] = process.env.API_KEY
    httpRequest.method = 'POST'
    httpRequest.body = JSON.stringify(data)

    const signer = new AWS.Signers.V4(httpRequest, 'appsync', true)
    signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate())

    const options = {
      body: httpRequest.body,
      headers: httpRequest.headers,
      method: httpRequest.method
    }

    const res = await fetch(uri.href, options)

    return res.json()
  }
}

module.exports = AppSyncTrigger
