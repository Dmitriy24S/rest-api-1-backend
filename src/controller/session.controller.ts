import config from 'config'
import { Request, Response } from 'express'
import { createSession } from '../service/session.service'
import { validatePassword } from '../service/user.service'
import { signJwt } from '../utils/jwt.utils'

export async function createUserSessionHandler(req: Request, res: Response) {
  //
  console.log(req.body)
  // { email: 'test@example.com', password: 'Password456!' } // ! recieve !user 401 msg

  // Validate users password
  const user = await validatePassword(req.body) // todo validate req body, schema

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
    },
    { expiresIn: config.get('accessTokenTtl') } // 15 minutes
  )

  // Create refresh token
  const refreshToken = signJwt(
    {
      ...user,
      session: session._id,
    },
    { expiresIn: config.get('accessTokenTtl') } // 15 minutes
  )
  // Return access & refresh tokens
  return res.send({ accessToken, refreshToken })
}
