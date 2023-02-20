import config from 'config'
import { Request, Response } from 'express'
import { createSession, findSessions, updateSession } from '../service/session.service'
import { validatePassword } from '../service/user.service'
import { signJwt } from '../utils/jwt.utils'

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
    { expiresIn: config.get('accessTokenTtl') } // 15 minutes
  )
  // Return access & refresh tokens
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
