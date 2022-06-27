const FieldException = require('./FieldException')
const Utils = require('./Utils')

class Request {
  static arrayFromQueryParam(evt, paramName, validValues, defaultValues){
    let fields = evt.query?.[paramName] && evt.query?.[paramName].split(',') || []

    if(validValues !== undefined){
      fields.forEach(field => {
        if(!validValues.includes(field)){
          throw new FieldException(`Invalid field: ${field}`)
        }
      })
    }

    if(defaultValues !== undefined){
      fields = fields.length && fields || defaultValues
    }

    return fields
  }
  static mongoProjectionFromQueryParam(evt, paramName, validValues, defaultValues){
    const projectionArray = this.arrayFromQueryParam(evt, paramName, validValues, defaultValues)

    let result = {}
    projectionArray.forEach(item => {
      result[item] = true
    })

    return result
  }
  static convertResults(results, errors){
    const baseResults = {
      body: results.length > 1 ? results : results[0],
      ...(errors.length ? {errors} : {})
    }

    return baseResults.errors === undefined ? baseResults.body : baseResults
  }
}

module.exports = Request
