const { createServer } = require('http')
const express = require('express')

require('module-alias/register')

const path = require('path')
const cors = require('cors')

(async () => {
  const cookieParser = require('cookie-parser')
  const bodyParser = require('body-parser')
  const errorHandler = require('express-json-errors')
  const logger = require('morgan')
  const favicon = require('serve-favicon')
  // const puggo = require('pug')
  const compileSass = require('express-compile-sass')

  const {env} = require('./config/config')

  const ApolloGoose = require('./libs/ApolloGoose')
  const {typeDefs, resolvers} = require('./routes/graphql/index')

  const PORT = process.env.PORT
  const app = express()

  app.use(errorHandler())
  // app.use(cors()) //Error still
  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(cookieParser(env.cookies?.secret || ''))
  app.use(compileSass({
    root: path.join(__dirname, 'views/assets/css'),
    sourceMap: true,
    sourceComments: true,
    watchFiles: true,
    logToConsole: true
  }))

  app.use('/assets', express.static(path.join(__dirname, '/views/assets')))
  app.use(favicon(path.join(__dirname, 'views/assets/img', 'favicon.ico')))

  //View Engine
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  const Utils = require('@serverless/libs/Utils')
  if(!Utils.isServerless()){
    const mongoose = require('mongoose')

    if(mongoose.connection.readyState === 0){
      await Utils.awaitMongooseConnectionUsingConfig()
    }
  }

  app.use('/', require('./routes/index'))

  const httpServer = createServer(app)

  await ApolloGoose.createApolloServer(
    typeDefs, resolvers,
    app, httpServer,
    '/graphql'
  )

  httpServer.listen(PORT)
  httpServer.on('listening', () => {
    console.info(`🚀 REST endpoints @ http://localhost:${process.env.NODE__PORT_CONTAINER ?? app.get('port')}`)
    console.info(`🚀 Serverless endpoints @ http://localhost:${process.env.NODE__PORT_CONTAINER ?? app.get('port')}/serverless`)
  })
  httpServer.on('error', error => {
    if (error.syscall !== 'listen') {
      throw error
    }

    const bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)

        break
      case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)

        break
      default:
        throw error
    }
  })
})()
