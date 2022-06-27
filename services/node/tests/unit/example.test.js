const expect = require('expect')
const _ = require('lodash')
const request = require('supertest')

const {app} = require('../../app')

/*
    Create a beforeEach handler that will run a set of tasks, normally related to the DB,
    prior to each test
 */
//beforeEach(myFunction)

describe('POST /testrelay\n----------------', () => {
    it('Should return the data that it is sent via the data variable', async () => {
        try {
            let mockData = {data: 1234}

            await request(app)
                .post(`/testrelay`)
                .send(mockData)
                .expect(200)
                .expect(res => {
                    expect(res.body).toEqual({response: mockData.data})
                })
                .catch(e => Promise.reject(e))


            return Promise.resolve()
        } catch (e) {
            return Promise.reject(e)
        }
    })
    it('Should return an error code and empty object if no data sent', async () => {
        try {
            await request(app)
                .post(`/testrelay`)
                .send({})
                .expect(400)
                .expect(res => {
                    expect(res.body).toEqual({})
                })
                .catch(e => Promise.reject(e))

            return Promise.resolve()
        } catch (e) {
            return Promise.reject(e)
        }
    })
})
