const express = require('express')
const errorHandler = require('express-json-errors')

const ExpressRequest = require('@libs/ExpressRequest')
const ExpressError = require('@libs/ExpressError')

const {getStatus} = require('@serverless/routes/status')

const router = express.Router()
router.use(errorHandler())

router.get('/', async(req, res) => {
  try {
    const results = await getStatus(...ExpressRequest.toLambdaArgs(req))

    res.send(results)
  } catch(e){
    return res.error({description: e.message || e})
  }
})

module.exports = router
