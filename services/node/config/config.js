const path = require('path')
const fs = require('fs')

//Getting environment
const NODE_ENV = process.env.NODE_ENV || 'development'

//Getting configuration file
const config_file = process.env.NODE_CONFIG_FILE
const config_file_path = path.join(__dirname, config_file)

//Ensuring file exists
fs.access(config_file_path, fs.F_OK, err => {
    if(err){
        console.error(`Error reading configuration file. Doesn't exist, or has no access ${config_file}`, JSON.stringify(err))
    }
})

const config = require(config_file_path)

//Checking format
let config_file_env = {}
if(typeof(config.modes) === 'object' && config.modes.length >= 0){
    config_info = config.modes.filter(mode => mode.name === NODE_ENV)
    if(config_info){ //It is possible that the mode provided doesn't exist, therefore undefined
        config_file_env = config_info[0]
    }
}

//Setting env, config_file, as provided. Then, overriden by process environments.
const env = {...config_file_env, ...process.env}

module.exports = { env }
