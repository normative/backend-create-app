const { GraphQLScalarType, Kind } = require('graphql')

const awsJSONScalar = new GraphQLScalarType({
  name: 'AWSJSON',
  description: 'AWSJSON custom scalar type',
  serialize(value){
    let result = value
    if(value !== null && typeof(value) === 'object'){
      result = JSON.stringify(result)
    } else {
      throw new Error(`Invalid JSON: ${result.value}`)
    }

    return result
  },
  parseValue(value) {
    let result = value

    if(result === null || !['string', 'object'].includes(typeof(result))){
      throw new Error(`Invalid JSON: ${result.value}`)
    }

    return typeof(result) === 'string' ? JSON.parse(result) : result
  },
  parseLiteral(ast) {
    let result = null

    if(ast.kind === Kind.STRING){
      result = JSON.parse(ast.value)
    }

    return result
  }
})

module.exports = awsJSONScalar
