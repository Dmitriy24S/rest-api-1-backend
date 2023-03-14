// handler to create user
import { Request, Response } from 'express'
import { omit } from 'lodash'
import { CreateUserInput } from '../schema/user.schema'
import { createUser } from '../service/user.service'
import logger from '../utils/logger'

// no params {}, no response body {},
export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput['body']>,
  res: Response
) {
  try {
    const user = await createUser(req.body) // call create user service
    // ! after add CreateUserInput = error: missing the following properties from type 'DocumentDefinition<UserDocument>': createdAt, updatedAt, comparePassword => fix with: createUser service add Omit & CreaterUserInput add Omit
    // return user // !  express need to use res.
    return res.send(user)
    // return res.send(omit(user.toJSON(), 'password'))
    // ! user.toJSON is not a function
  } catch (error: any) {
    logger.error(error)
    return res.status(409).send(error.message) // conflict, i.e. email user already registered
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  return res.send(res.locals.user)
}
