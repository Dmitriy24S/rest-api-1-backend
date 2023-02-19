import { NextFunction, Request, Response } from 'express'

const requireUser = (req: Request, res: Response, next: NextFunction) => {
  // this middleware is used on routes where we know we need to have user -> safe to return 403
  const user = res.locals.user
  console.log('requireUser - user:', user)

  if (!user) {
    return res.sendStatus(403) // Forbidden
  }

  return next()
}

export default requireUser
