// Validate request against a schema

import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'

const validate =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error: any) {
      return res.status(404).send(error.errors)
    }
  }

export default validate
