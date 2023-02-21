import config from 'config'
import { get } from 'lodash'
import { FilterQuery, UpdateQuery } from 'mongoose'
import SessionModel, { SessionDocument } from '../models/session.model'
import { signJwt, verifyJwt } from '../utils/jwt.utils'
import { findUser } from './user.service'

export async function createSession(userId: string, userAgent: string) {
  const session = await SessionModel.create({ user: userId, userAgent })

  return session.toJSON()
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
  return SessionModel.find(query).lean() // not going to return all functions on the object, only plain object like toJSON()
}

export async function updateSession(
  query: FilterQuery<SessionDocument>,
  update: UpdateQuery<SessionDocument>
) {
  return SessionModel.updateOne(query, update)
}

export async function reIssueAccessToken({ refreshToken }: { refreshToken: string }) {
  const { decoded } = verifyJwt(refreshToken)

  console.log('reIssueAccessToken decoded:', decoded)

  // before issue access token make sure session is valid
  // if (!decoded || !get(decoded, '_id')) return false
  if (!decoded || !get(decoded, 'session')) return false

  // const session = await SessionModel.findById(get(decoded, '_id')) // ! forbidden on get session
  const session = await SessionModel.findById(get(decoded, 'session'))

  // if (!session || !session.isValid) return false
  if (!session || !session.valid) return false

  // create find user service
  const user = await findUser({ _id: session.user })

  if (!user) return false

  // If have user create new access token
  // Create an access token (copy from session controller)
  const accessToken = signJwt(
    {
      ...user,
      session: session._id,
    },
    { expiresIn: config.get('accessTokenTtl') } // 15 minutes
  )

  return accessToken
}
