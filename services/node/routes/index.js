const express = require('express')
const errorHandler = require('express-json-errors')

const router = express.Router()
router.use(errorHandler())

router.use(`/serverless`, require(`./serverless/index`))
router.use(`/tests`, require(`./tests/index`))
router.get('/', async (req, res) => {
  try {
    res.render('index', {title: 'Node.js Express Server'})
  } catch(e){
    return res.error({description: e.message || e})
  }
})

module.exports = router
