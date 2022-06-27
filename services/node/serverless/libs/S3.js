const {S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3')

class S3 {
  static async getObject(region, bucketName, key){
    try {
      const s3Client = this.#getClient(region)

      //Convert ReadableStream to string
      const streamToString = stream => {
        return new Promise((resolve, reject) => {
          const chunks = []

          stream.on('data', chunk => chunks.push(chunk))
          stream.on('error', reject)
          stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        })
      }

      // Get the Object as ReadableStream.
      const data = await s3Client.send(new GetObjectCommand({Bucket: bucketName, Key: key}))

      // Convert the ReadableStream to a string.
      return await streamToString(data.Body)
    } catch(e){
      return Promise.reject(e)
    }
  }
  static async getObjectAsJson(region, bucketName, key){
    try {
      const contents = await this.getObject(region, bucketName, key)

      return JSON.parse(contents)
    } catch(e){
      return Promise.reject(e)
    }
  }
  static #getClient(region){
    return new S3Client({Region: region})
  }
  static async putObject(object, region, bucketName, key){
    try {
      const s3Client = this.#getClient(region)

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: typeof(object) === 'object' ? JSON.stringify(object) : ('' + object)
      }

      return await s3Client.send(new PutObjectCommand(params))
    } catch(e){
      return Promise.reject(e)
    }
  }
}

module.exports = S3
