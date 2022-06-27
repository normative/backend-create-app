const express = require('express')
const errorHandler = require('express-json-errors')

const router = express.Router()
router.use(errorHandler())

router.use(`/resets`, require(`./resets/index`))

module.exports = router
