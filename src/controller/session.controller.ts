import config from 'config'
import { CookieOptions, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { createSession, findSessions, updateSession } from '../service/session.service'
import {
  findAndUpdateUser,
  getGoogleOAuthTokens,
  getGoogleUser,
  validatePassword,
} from '../service/user.service'
import { signJwt } from '../utils/jwt.utils'
import log from '../utils/logger'

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000, // 15 mins
  httpOnly: true,
  // domain: 'localhost',
  domain: config.get('domain') as string,
  path: '/',
  sameSite: 'strict', // lax?
  secure: false, // ! production https vs http
}

const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10, // 1 year
}

export async function createUserSessionHandler(req: Request, res: Response) {
  console.log(req.body) // { email: '...', password: '....' }

  // Validate users password
  const user = await validatePassword(req.body)

  if (!user) {
    return res.status(401).send('Invalid email or password')
  }

  // Create a session
  const session = await createSession(user._id, req.get('user-agent') || '')

  // Create an access token
  const accessToken = signJwt(
    {
      ...user,
      session: session._id,
      // ! Property '_id' does not exist on type 'FlattenMaps<LeanDocument<{ createdAt: ...
    },
    { expiresIn: config.get('accessTokenTtl') } // 15 minutes
  )

  // Create refresh token
  const refreshToken = signJwt(
    {
      ...user,
      session: session._id,
      // ! Property '_id' does not exist on type 'FlattenMaps<LeanDocument<{ createdAt: ...
    },
    { expiresIn: config.get('refreshTokenTtl') } // 1y
  )

  // Return access & refresh tokens

  // !
  res.cookie('accessToken', accessToken, {
    maxAge: 900000, // 15 mins
    httpOnly: true,
    // domain: 'localhost',
    domain: config.get('domain'),
    path: '/',
    sameSite: 'strict',
    secure: false, // ! production https vs http
  })
  // !
  res.cookie('refreshToken', refreshToken, {
    maxAge: 3.154e10, // 1 year
    httpOnly: true,
    // domain: 'localhost',
    domain: config.get('domain'),
    path: '/',
    sameSite: 'strict',
    secure: false, // ! production https vs http
  })

  return res.send({ accessToken, refreshToken })
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  // service for getting these sessions
  // middleware to add user to req object
  const userId = res.locals.user._id
  // ! TypeError: Cannot read properties of undefined (reading '_id') on request attempt -> need middleware to validate that user exists for given request
  console.log('userId', userId)

  const sessions = await findSessions({ user: userId, valid: true }) // get only valid sessions, not need expired sessions
  console.log('sessions:', sessions)

  return res.send(sessions)
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session // safe to access this if have requireUser middleware is infront of this handler

  await updateSession(
    {
      _id: sessionId,
    },
    { valid: false }
  )

  return res.send({
    accessToken: null,
    refreshToken: null,
  })
}

export async function googleOAuthHandler(req: Request, res: Response) {
  try {
    // get the code out of query string
    const code = req.query.code as string // !

    // get id and access token with the code
    const { id_token, access_token } = await getGoogleOAuthTokens({ code })
    console.log('googleOAuthHandler id_token:', id_token)
    console.log('googleOAuthHandler access_token:', access_token)

    // get user with tokens
    // v1?
    // const googleUser = jwt.decode(id_token) // use jwt decode, no verify -> because know it is signed by Google
    // v2 get use via network request - user service
    const googleUser = await getGoogleUser({ id_token, access_token })
    console.log('googleOAuthHandler googleUser:', googleUser)

    if (!googleUser.verified_email) {
      return res.status(403).send('Google account is not verified')
    }

    // upsert the user
    const user = await findAndUpdateUser(
      {
        email: googleUser.email,
      },
      {
        email: googleUser.email, // if user does not exist update email / create
        name: googleUser.name,
        picture: googleUser.picture,
      },
      {
        upsert: true,
        new: true, // return new document, given it updated this user
      }
    ) // discord doesn't verify email addresses -> could login into system with that user, need to make sure use provider that valides email if doing this way, other way save googleId -> verify by id, but can lead to duplicate accounts

    // create a session (re-use from previous session controller code - createUserSessionHandler)
    // Create a session
    const session = await createSession(user._id, req.get('user-agent') || '') // ! 'user' is possibly 'null'.ts(18047)

    // create access and refresh tokens
    // Create an access token
    const accessToken = signJwt(
      {
        // ...user,
        ...user.toJSON(),
        session: session._id,
      },
      { expiresIn: config.get('accessTokenTtl') } // 15 minutes
    ) // ! Argument of type '{ session: any; constructor: FlattenMaps<Function>; toString: FlattenMaps<() ...

    // Create refresh token
    const refreshToken = signJwt(
      {
        // ...user,
        ...user.toJSON(),
        session: session._id,
      },
      { expiresIn: config.get('refreshTokenTtl') } // 1y
    ) // ! Argument of type '{ session: any; constructor: FlattenMaps<Function>; toString: FlattenMaps<() ...

    // set cookies
    // Return access & refresh tokens
    // res.cookie('accessToken', accessToken, {
    //   maxAge: 900000, // 15 mins
    //   httpOnly: true,
    //   domain: config.get('domain'),
    //   path: '/',
    //   sameSite: 'strict',
    //   secure: false,
    // })
    res.cookie('accessToken', accessToken, accessTokenCookieOptions) // ! No overload matches this call. -> fix add type CookieOptions

    // res.cookie('refreshToken', refreshToken, {
    //   maxAge: 3.154e10, // 1 year
    //   httpOnly: true,
    //   domain: config.get('domain'),
    //   path: '/',
    //   sameSite: 'strict',
    //   secure: false,
    // })
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions) // ! No overload matches this call. -> fix add type CookieOptions

    // return res.send({ accessToken, refreshToken })

    // redirect back to client
    res.redirect(config.get('origin'))
  } catch (error) {
    console.log('googleOAuthHandler error:', error)
    log.error('Failed to authorize Google user:', error)
    return res.redirect(`${config.get('origin')}/oauth/error`)
  }
}

// {"$__":{"activePaths":{"paths":{"password":"require","name":"init","email":"init","_id":"init","__v":"init","createdAt":"init","picture":"init","updatedAt":"init"},"states":{"require":{"password":true},"init":{"_id":true,"email":true,"__v":true,"createdAt":true,"name":true,"picture":true,"updatedAt":true}}},"skipId":true},"$isNew":false,"_doc":{"_id":"6410729d4804f4e3cfa0f8d1","email":"dev24ins@gmail.com","__v":0,"createdAt":"2023-03-14T13:11:57.305Z","name":"Dave Pasta","picture":"https://lh3.googleusercontent.com/a/AGNmyxbNZHqO9iRfQ9BDBv4pp68efnJUrOetgolyvT9j=s96-c","updatedAt":"2023-03-14T13:11:57.305Z"},"session":"6410729df48611ee42d90261","iat":1678799517,"exp":1678800417}

// after user.toJSON()
// {"_id":"6410729d4804f4e3cfa0f8d1","email":"dev24ins@gmail.com","__v":0,"createdAt":"2023-03-14T13:11:57.305Z","name":"Dave Pasta","picture":"https://lh3.googleusercontent.com/a/AGNmyxbNZHqO9iRfQ9BDBv4pp68efnJUrOetgolyvT9j=s96-c","updatedAt":"2023-03-14T13:17:53.701Z","session":"6410740119a9d03920fc64a6","iat":1678799873,"exp":1678800773}
