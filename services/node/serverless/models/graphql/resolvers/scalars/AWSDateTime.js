const { GraphQLScalarType, Kind } = require('graphql')

const AWSDateTimeRegex = /^[0-9]{4}-((0[1-9])|10|11|12)-((0[1-9])|([1-2][0-9])|30|31)T(([0-1][0-9])|(2[0-3])):([0-5][0-9]):([0-5][0-9]).([0-9]{3})((((\+|-)(([0-1][0-9])|(2[0-3]))(:[0-5][0-9])?)|Z)?)$/
const awsDateTimeScalar = new GraphQLScalarType({
  name: 'AWSDateTime',
  description: 'AWSDateTime custom scalar type',
  serialize(value){
    let result = value

    if(value !== null && (typeof(value) !== 'string')){
      if(typeof(value) === 'object' && value.constructor.name === 'Date'){
        result = value.toISOString()
      } else {
        throw new Error(`Invalid datetime: ${value.value}. Must be in the form: YYYY-MM-DDThh:mm:ss.sss`)
      }
    } else if(typeof(value) === 'string'){
      result = new Date(value)
      if(isNaN(result.getTime())){
        throw new Error(`Invalid datetime: ${value.value}. Must be in the form: YYYY-MM-DDThh:mm:ss.sss`)
      }
    }

    return result
  },
  parseValue(value){
    if(value !== null && (typeof(value) !== 'string' || value.match(AWSDateTimeRegex) === null)){
      throw new Error(`Invalid datetime: ${value}. Must be in the form: YYYY-MM-DDThh:mm:ss.sss`)
    }

    return new Date(value)
  },
  parseLiteral(ast){
    let result = null

    if(ast.kind === Kind.STRING){
      if(ast.value.match(AWSDateTimeRegex) === null){
        throw new Error(`Invalid datetime: ${ast.value}. Must be in the form: YYYY-MM-DDThh:mm:ss.sss`)
      }

      const dateCheck = new Date(ast.value)
      if(isNaN(dateCheck)){
        throw new Error(`Invalid datetime: ${ast.value}. Must be a valid ISODateTime: YYYY-MM-DDThh:mm:ss.sss`)
      }

      result = ast.value
    }

    return result
  }
})

module.exports = awsDateTimeScalar
