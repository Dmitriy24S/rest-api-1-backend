import { NextFunction, Request, Response } from 'express'
import { get } from 'lodash'
import { verifyJwt } from '../utils/jwt.utils'

const deserializeUser = (req: Request, res: Response, next: NextFunction) => {
  // need to get access token from request headers
  // loadash get utility - safer way to access properity that we are unknown if it exists
  // (Gets the property value at path of object. If the resolved value is undefined the defaultValue is used in its place.)

  const accessToken = get(req, 'headers.authorization', '').replace(/^Bearer\s/, '') // get otherwise '', remove word bearer at start of authorization token
  console.log('deserializeUser - accessToken:', accessToken)

  if (!accessToken) {
    return next()
  }

  // verify accessToken
  const { decoded, expired } = verifyJwt(accessToken)
  console.log('deserializeUser - decoded:', decoded)
  // have decoded if valid jwt
  if (decoded) {
    res.locals.user = decoded // attach user to res.locals.user
    return next()
  }

  return next()
}

export default deserializeUser
