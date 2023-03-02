import mongoose from 'mongoose'
import supertest from 'supertest'
import { createUserSessionHandler } from '../controller/session.controller'
import * as SessionService from '../service/session.service'
import * as UserService from '../service/user.service'
import createServer from '../utils/server'

const app = createServer()

const userId = new mongoose.Types.ObjectId().toString() // can put into separate file

const userPayload = {
  _id: userId,
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
}

const userInput = {
  email: 'test@example.com',
  name: 'Jane Doe',
  password: 'Password123',
  passwordConfirmation: 'Password123',
}

const sessionPayload = {
  _id: new mongoose.Types.ObjectId().toString(),
  user: userId,
  valid: true,
  userAgent: 'PostmanRuntime/7.28.4',
  createdAt: new Date('2021-09-30T13:31:07.674Z'),
  updatedAt: new Date('2021-09-30T13:31:07.674Z'),
  __v: 0,
}

// describe.only('user', () => {
describe('user', () => {
  // User registration
  describe('user registration', () => {
    // the username and password get validated / validation
    describe('given the username and password are valid', () => {
      // it.only('should return the user payload', async () => {
      it('should return the user payload', async () => {
        // const createUserService = UserService.createUser(userInput)
        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          // @ts-ignore // userPayload vs createUser return ?
          .mockReturnValueOnce(userPayload) // Accepts a value that will be returned for one call to the mock function. Can be chained so that successive calls to the mock function return different values. When there are no more mockReturnValueOnce values to use, calls will return a value specified by mockReturnValue.
        // ! Argument of type '{ _id: string; email: string; name: string; }' is not assignable to parameter of type 'Promise<Pick<FlattenMaps<LeanDocument<any>>, string | number | symbol>>'.
        // ! Type '{ _id: string; email: string; name: string; }' is missing the following properties from type 'Promise<Pick<FlattenMaps<LeanDocument<any>>, string | number | symbol>>'
        // ! 'Promise<Pick<FlattenMaps<LeanDocument<any>>, string | number | symbol>>' ? userPayload

        // with supertest do not need to create mock body, etc?
        const { statusCode, body } = await supertest(app)
          // .post('api/users') // ! typo -> connect ECONNREFUSED 127.0.0.1:80
          .post('/api/users')
          .send(userInput)

        expect(statusCode).toBe(200)
        // expect(body).toBe(userPayload) // ! expected: {...} vs received: 'serializes to the same string'
        expect(body).toEqual(userPayload)
        expect(createUserServiceMock).toHaveBeenCalledWith(userInput)
      })
    })

    // verify that passswords must match
    describe('given the passwords do not match', () => {
      it('should return a 400', async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          // @ts-ignore
          .mockReturnValueOnce(userPayload)

        const { statusCode } = await supertest(app)
          .post('/api/users')
          // .set({ ...userInput, passwordConfirmation: 'doesnotmatch' })
          .send({ ...userInput, passwordConfirmation: 'doesnotmatch' })

        expect(statusCode).toBe(400)
        // expect(statusCode).toBe(404) // ! Expected: 400, Received: 404 // validateResource error number
        expect(createUserServiceMock).not.toHaveBeenCalled() // ! Expected number of calls: 0, Received number of calls: 1
        // need to clear mocks inbetween tests -> in jest config use clearMocks
      })
    })

    // verify that handles handles any errors
    describe('given that user service throws', () => {
      it('should return a 409 error', async () => {
        // spyOn(object: {}, method: never, accessType: never): never
        // Creates a mock function similar to jest.fn but also tracks calls to object[methodName]
        // Note: By default, jest.spyOn also calls the spied method. This is different behavior from most other test libraries.

        const createUserServiceMock = jest
          .spyOn(UserService, 'createUser')
          .mockRejectedValue('bad value? mock rejection')

        const { statusCode } = await supertest(app).post('/api/users').send(userInput)

        expect(statusCode).toBe(409) // ! Expected: 409, Received: 400 -> add send userInput...
        // ! Expected: 409, Received: 200 = jest is not reseting the mocks between tests (clearMocks only resets calls of a mock) -> add to config: resetMocks & restoreMocks(restore modules to initial state between tests)
        // pass - get error logged (can mock logger etc.) [18:22:25.000] ERROR: bad value? mock rejection
        expect(createUserServiceMock).toHaveBeenCalled()
      })
    })
  })

  // Creating user session
  describe('create user session', () => {
    // user can login with a valid email and password
    describe('given the username and passowrd are valid', () => {
      it('should return a signed accessToken & refresh token', async () => {
        // (session controller: call validate password from user service, and calling createSession = need to mock these values)
        jest
          .spyOn(UserService, 'validatePassword')
          // @ts-ignore
          .mockReturnValue(userPayload)
        jest
          .spyOn(SessionService, 'createSession')
          // @ts-ignore
          .mockReturnValue(sessionPayload)

        // mock requests object:
        // req.body in validatePassword
        // req.get(user agent) in createSession -> add get() function to req.
        const req = {
          get: () => {
            return 'a user agent'
          },
          body: {
            email: 'test@example.com',
            password: 'Password123',
          },
        }

        // mock response object:
        const send = jest.fn() // make assertion on this send func
        const res = {
          send,
        }

        // call session handler directly
        // @ts-ignore  // not meet express requirements
        await createUserSessionHandler(req, res)
        // ! Type '{ get: () => string; body: { email: string; password: string; }; }' is missing the following properties from type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>': header, accepts, acceptsCharsets, acceptsEncodings, and 79 more.

        expect(send).toHaveBeenCalledWith({
          // refresh and access token from session controller & different every time
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        })
      })
    })
  })
})
