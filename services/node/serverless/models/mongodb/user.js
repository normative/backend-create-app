require('module-alias/register')

//const {env} = require('@config/config')
const {ObjectId} = require('mongodb')

const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

let UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    minLength: 1,
    required: true
  },
  middleName: {
    type: String,
    trim: true,
    minLength: 1,
    required: false
  },
  lastName: {
    type: String,
    trim: true,
    minLength: 1,
    required: true
  },
  email: {
    type: String,
    trim: true,
    minLength: 5,
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email' /*  TODO: Does this actually work?  */
    },
    required: true
  },
  loginType: {
    type: [{
      type: String,
      enum: ['local', 'apple', 'google', 'facebook', 'cognito'],
      required: true
    }],
    validate: {
      validator: v => v.length > 0,
      message: 'There must be at least one loginType specified'
    },
    required: true
  },
  password: {     /* Change to array so that it can be checked when changed that the password is not in the last 3 or whatever value  */
    type: String,
    trim: true,
    minLength: 12,
    select: false,
    validate: {
      validator: async val => {
        try {
          if(!/(?=.*[a-zA-Z]+)(?=.*\d+)(?=.*[!@#$%^&*()+{}\[\];:`~]+).*/.test(val)){
            throw new Error(`The password must be at least 12 characters long and contain at least: 1 letter a-z / A-Z, 1 number, and 1 special character: !@#$%^&*()+{}[];:\`~`)
          }

          return true
        } catch(e){
          throw new Error(e)
        }
      }
    },
    required: function(){
      return this.loginType.includes('local')
    }
  },
  tokens: {      /*   Create job that deletes expired tokens  */
    type: [{
      access: {
        type: String,
        trim: true,
        minLength: 1,
        select: false,
        required: true
      },
      token: {
        type: String,
        trim: true,
        minLength: true,
        required: true
      },
      expiryDate: {
        type: Date,
        default: () => Date.now(),  //+ env.session_expiry_time,
        required: true
      }
    }],
    select: false
  }
}, {timestamps: true, discriminatorKey: 'kind'})

UserSchema.methods.generateAuthToken = async function () {
  const user = this
  const access = 'auth'
  const token = jwt.sign({
      _id: user._id.toHexString(),
      access
    },
    'TMP_SECRET', //env.jwt.secret,
    {
      expiresIn: 223 //env.session_expiry_time
    }
  ).toString()

  try {
    user.tokens.push({access, token})

    //   let userInfo = await User.updateOne({_id: user._id}, {$addToSet: {tokens: {access, token}}}).find({},['tokens'])
    // let tokens = userInfo.toJSON().tokens.find(token => token._id.toHexString().equ === )
    let userInfo = await User.updateOne({_id: user._id}, {$addToSet: {tokens: {access, token}}})

    return Promise.resolve(token)
  } catch(e){
    return Promise.reject(e)
  }
}
UserSchema.statics.logout = async function(token){
  const user = this

  try {
    await user.updateOne({tokens: {
        $elemMatch: {
          token,
          access: 'auth'
        }
      }},{
      $pull: {
        tokens: {
          token,
          access: 'auth'
        }
      }
    })

    return Promise.resolve(true)
  } catch(e){
    return Promise.reject(e)
  }
}
UserSchema.statics.findByToken = async function (token) {
  const user = this
  let decoded

  try {
    decoded = jwt.verify(token) //, env.jwt.secret)

    return await user.findOne({
      '_id': decoded._id,
      tokens: {
        $elemMatch: {
          token,
          access: 'auth'
        }
      }
    }, {
      tokens: {
        $elemMatch: {
          token,
          access: 'auth'
        }
      }
    }).select('+tokens')
  } catch (e) {
    return Promise.reject()
  }
}

UserSchema.statics.findByCredentials = async function (email, password) {
  const userObj = this
  try {
    const user = await userObj.findOne({email}, ['password', 'tokens'])

    if(!user){
      throw new Error(`Couldn't find user with email: ${email}`)
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, async (err, res) => {
        if(res){
          return resolve(user)
        } else {
          return reject(`Password didn't match for user with email: ${email}`)
        }
      })
    })
  } catch(e){
    return Promise.reject(e)
  }
}

UserSchema.pre('deleteOne', {document: true, query: false}, async function(next){
  try {
    await UserGroup.updateMany({_users: {$in: [this._id]}}, {$pull: {_users: this._id}})

    return Promise.resolve()
  } catch(e){
    return Promise.reject(e)
  }
})
UserSchema.pre('findOneAndUpdate', async function(){
  try {
    return Promise.resolve()
  } catch(e){
    return Promise.reject(e)
  }
})
UserSchema.pre('save', async function(next){
  const user = this

  if(user.password !== undefined) {
    if (user.isModified('password')) {
      let salt = await bcrypt.genSalt(Math.floor(Math.random() * 5)) //env.passwords.rounds)
      let hash = await bcrypt.hash(user.password, salt)

      user.password = hash
    }

    next()
  }
})
UserSchema.pre('update', async function(){
  try {
    const updateQuery = this
    const queryConditions = updateQuery._conditions
    const queryParams = updateQuery._update.$push
    if(queryConditions._id){
      queryConditions._id = typeof queryConditions._id === 'string' ? ObjectId(queryConditions._id) : queryConditions._id

      let queryResults = await User.findOne({_id: queryConditions._id})
      if(!queryResults){
        throw new Error(`No user found with id: ${queryConditions._id}`)
      }
    }

    return Promise.resolve()
  } catch(e){
    return Promise.reject(e)
  }
})

const User = mongoose.model('User', UserSchema)

module.exports = {User}
