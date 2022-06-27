class ExpressRequest {
  static toLambdaArgs(request){
    return [{
      path: request.params,
      query: request.query,
      body: request.body,
      headers: request.headers
    },{
      fail: msg => { throw new Error(msg) }
    }]
  }
}

module.exports = ExpressRequest
