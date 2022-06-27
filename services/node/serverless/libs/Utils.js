const {gql} = require('apollo-server-express')

class Utils {
  static isServerless(){
    return process.env.IS_SERVERLESS === undefined || process.env.IS_SERVERLESS === 'true'
  }
  static getConfig(){
    const config = require('@serverless/config/config.json')

    return config[process.env.STAGE ?? 'local']
  }
  static getParams(){
    const config = Utils.getConfig()

    return {
      ...config.AWS,
      ...process.env
    }
  }
  static async awaitMongooseConnectionUsingConfig(){
    if(this.isServerless()){
      const config = this.getConfig()

      await this.#awaitMongooseConnection(
        config.mongo.username,
        config.mongo.password,
        config.mongo.hostname,
        config.mongo.port,
        config.mongo.db,
        config.mongo['hostname-srv'],
        config.mongo.ssl
      )
    } else {
      await this.#awaitMongooseConnection(
        process.env.MONGO__USER_MAIN,
        process.env.MONGO__USER_MAIN_PWD,
        process.env.MONGO__HOSTNAME,
        process.env.MONGO__PORT_CONTAINER,
        process.env.MONGO__DB_NAME,
        process.env.MONGO__SSL,
        process.env.MONGO__HOSTNAME_SRV
      )
    }
  }
  static async #awaitMongooseConnection(user, password, hostname, port, db_name, ssl=true, isSrv=false, timeoutMs=1000){
    const mongoose = require('mongoose')

    console.log('Connecting to Document DB...')

    isSrv = !!(typeof(isSrv) === 'string' && isSrv === 'true' || typeof(isSrv) === 'boolean' && isSrv)

    const mongoUri = `mongodb${isSrv ? '+srv' : ''}://${user}:${encodeURIComponent(password)}@${hostname}${!isSrv ? `:${port}` : ''}/${db_name}`

    const waitForDbConnection = async () => {
      return new Promise((resolve, reject) => {
        const waitForDb = async () => {
          mongoose.Promise = global.Promise

          try {
            await mongoose.connect(mongoUri, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              ssl
            })

            return resolve()
          } catch(e){
            console.log('Waiting for DocumentDB...')

            setTimeout(waitForDb, timeoutMs)
          }
        }

        waitForDb()
      })
    }

    await waitForDbConnection()

    console.log('Connected to DocumentDB')
  }
  static getGraphQLSchemaFromFile(fileName, filterAwsDirectives=true){
    const fs = require('fs')
    const { gql } = require('apollo-server-express')

    if(!fs.existsSync(fileName)){
      throw new Error(`No such GraphQL file: ${fileName}`)
    }

    const schemaRaw = fs.readFileSync(fileName,
      {encoding: 'utf8', flag: 'r'})

    //Removing AWS Directives
    let schemaGraphql = schemaRaw
    if(filterAwsDirectives){
      schemaGraphql = schemaRaw.split('\n').filter(line => {
        return !line.trim().startsWith('@aws_')
      }).join('\n')
    }

    return schemaGraphql
  }
  static getGraphQLSchemaFromFiles(fileNames, filterAwsDirectives=true){
    const schemas = []

    fileNames.forEach(fileName => {
      const schema = Utils.getGraphQLSchemaFromFile(fileName, filterAwsDirectives)

      schemas.push(schema)
    })

    return schemas.join('\n')
  }
  static getGraphQLTypeDefsFromFile(fileName, filterAwsDirectives=true){
    const schema = Utils.getGraphQLSchemaFromFile(fileName, filterAwsDirectives)

    return gql`${schema}`
  }
  static getGraphQLTypeDefsFromFiles(fileNames, filterAwsDirectives=true){
    const schema = Utils.getGraphQLSchemaFromFiles(fileNames, filterAwsDirectives)

    return gql`${schema}`
  }
  static getGraphQLTypeDefsFromDir(dirPath, primaryFile='index.graphql', schemaFile='schema.graphql', scalarsFile='scalars.graphql', filterAwsDirectives=true){
    try {
      const fs = require('fs')
      const path = require('path')

      let filesInDir = fs.readdirSync(dirPath, {encoding: 'utf8'})

      const files = [scalarsFile, primaryFile, ...filesInDir.filter(fileName => ![primaryFile, schemaFile].includes(fileName)), schemaFile]
        .map(fileName => path.join(dirPath, fileName))

      return Utils.getGraphQLTypeDefsFromFiles(files, filterAwsDirectives)
    } catch(e){
      console.log('Error', e.message)
    }
  }
}

module.exports = Utils
