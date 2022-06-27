const { GraphQLScalarType, Kind } = require('graphql')

const AWSDateRegex = /^[0-9]{4}-((0[1-9])|10|11|12)-((0[1-9])|([1,2][0-9])|30|31)(((\+|-)(([0-1][0-9])|(2[0-3]))(:[0-5][0-9])?)|Z)?$/
const awsDateScalar = new GraphQLScalarType({
  name: 'AWSDate',
  description: 'AWSDate custom scalar type',
  serialize(value){
    let result = value

    if(value !== null && (typeof(value) !== 'string' || value.match(AWSDateRegex) === null)){
      throw new Error(`Invalid date: ${value.value}. Must be in the form: YYYY-MM-DD`)
    }

    return result
  },
  parseValue(value) {
    if(value !== null && (typeof(value) !== 'string' || value.match(AWSDateRegex) === null)){
      throw new Error(`Invalid date: ${value}. Must be in the form: YYYY-MM-DD`)
    }

    return value
  },
  parseLiteral(ast) {
    let result = null

    if(ast.kind === Kind.STRING){
      if(ast.value.match(AWSDateRegex) === null){
        throw new Error(`Invalid date: ${ast.value}. Must be in the form: YYYY-MM-DD`)
      }

      const dateCheck = new Date(ast.value)
      if(isNaN(dateCheck)){
        throw new Error(`Invalid date: ${ast.value}. Must be a valid ISODate: YYYY-MM-DD`)
      }

      result = ast.value
    }

    return result
  }
})

module.exports = awsDateScalar
