const express = require('express')
const errorHandler = require('express-json-errors')

const router = express.Router()
router.use(errorHandler())

const {User} = require(`@models/mongodb`)

router.delete('/users', async (req, res) => {
  try {
    const users = await User.find({},{_id:1}).lean()

    await User.deleteMany({})

    res.status(200).json(users.map(user => user._id))
  } catch(e){
    return res.error({description: e.message || e})
  }
})
router.delete('/', async (req, res) => {
  try {
    const users = await User.find({},{_id:1}).lean()

    await User.deleteMany({})

    res.status(200).json({
      users: users.map(user => user._id)
    })
  } catch(e){
    return res.error({description: e.message || e})
  }
})

router.get('/', async (req, res) => {
  try {
    res.render('index', {title: 'Node.js Express Server — Serverless Routes Tests!'})
  } catch(e){
    return res.error({description: e.message || e})
  }
})

module.exports = router
