require('module-alias/register')

const {User} = require('@serverless/models/mongodb')
const DbConnector = require('@serverless/libs/DbConnector')
const GraphqlResolver = require('@serverless/libs/GraphqlResolver')

const resolvers = {
  Query: {
    getUser: GraphqlResolver.getQuery(async(args, fields, ctx, evt) => {
      const _id = args._id

      let user = await User.findOne({_id})

      if(!user){
        throw new Error(`No User found with id: ${_id}`)
      }

      if(user.kind === 'PROVIDER'){
        user = await user.populate('provider')
      }

      return user.toJSON()
    }, [DbConnector.MONGO]),
    getUsers: GraphqlResolver.getQuery(async(args, fields, ctx, evt) => {
      const users = await User.find({}).lean()

      return users
    }, [DbConnector.MONGO])
  },
  Mutation: {
    createUser: GraphqlResolver.getMutation(async(args, fields, ctx, evt) => {
      let userDef = args

      userDef = {...userDef.kindData, ...userDef}
      delete userDef['kindData']
      delete userDef['tokens']
      userDef.loginType = ['local']

      if(userDef.kind === 'PROVIDER'){
        userDef.provider = userDef.providerId
        delete userDef['providerId']
      }

      const userDoc = new User(userDef)
      const user = await userDoc.save()

      let userResult = null
      if(user.kind === 'PRODUCT_REPRESENTATIVE'){
        userResult = user
      } else if(user.kind === 'PROVIDER'){
        userResult = await user.populate('provider')
      }

      return userResult.toJSON()
    }, [DbConnector.MONGO]),
    createProductRepresentativeUser: GraphqlResolver.getMutation(async(args, fields, ctx, evt) => {
      const userDef = args

      userDef.loginType = ['local']
      userDef.kind = 'PRODUCT_REPRESENTATIVE'

      const userDoc = new User(userDef)
      const user = await userDoc.save()

      return user
    }, [DbConnector.MONGO]),
    createProviderUser: GraphqlResolver.getMutation(async(args, fields, ctx, evt) => {
      const userDef = args

      userDef.loginType = ['local']
      userDef.kind = 'PROVIDER'
      userDef.provider = userDef.providerId

      delete userDef['providerId']

      const userDoc = new User(userDef)
      const user = await userDoc.save()
      const userResult = await user.populate(['provider'])

      return userResult.toJSON()
    }, [DbConnector.MONGO]),
    deleteUser: GraphqlResolver.getMutation(async(args, fields, ctx, evt) => {
      const _id = args._id

      const user = await User.findOneAndRemove({_id}).lean()

      if(!user){
        throw new Error(`No User found with _id: ${_id}`)
      }

      return user
    }, [DbConnector.MONGO]),
    editUser: GraphqlResolver.getMutation(async(args, fields, ctx, evt) => {
      const user = await User.findOneAndUpdate(
        {_id: args._id},
        {$set: {...args}},
        {new: true, runValidators: true}
      )

      if(!user){
        throw new Error(`No User found with id: ${args._id}`)
      }

      return user
    }, [DbConnector.MONGO])
  },
  Subscription: {}
}

module.exports = resolvers
