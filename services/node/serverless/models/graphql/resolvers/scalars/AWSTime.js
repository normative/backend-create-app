const { GraphQLScalarType, Kind } = require('graphql')

const AWSTimeRegex = /^(([0,1][0-9])|(2[0-3]))(((:[0-5][0-9]){1,2}((.[0-9]{3})?))?)((((\+|-)(([0-1][0-9])|(2[0-3]))(:[0-5][0-9])?)|Z)?)$/
const awsTimeScalar = new GraphQLScalarType({
  name: 'AWSTime',
  description: 'AWSTime custom scalar type',
  serialize(value){
    let result = value

    if(value !== null && (typeof(value) !== 'string' || value.match(AWSTimeRegex) === null)){
      throw new Error(`Invalid time: ${value.value}. Must be in the form: hh:mm:ss.sss`)
    }

    return result
  },
  parseValue(value) {
    if(value !== null && (typeof(value) !== 'string' || value.match(AWSTimeRegex) === null)){
      throw new Error(`Invalid time: ${value}. Must be in the form: hh:mm:ss.sss`)
    }

    return value
  },
  parseLiteral(ast) {
    let result = null

    if(ast.kind === Kind.STRING){
      if(ast.value.match(AWSTimeRegex) === null){
        throw new Error(`Invalid time: ${ast.value}. Must be in the form: hh:mm:ss.sss`)
      }

      result = ast.value
    }

    return result
  }
})

module.exports = awsTimeScalar
