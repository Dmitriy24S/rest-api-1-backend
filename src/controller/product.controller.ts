import { Request, Response } from 'express'
import {
  createProduct,
  deleteProduct,
  findAndUpdateProduct,
  findProduct,
} from '../service/product.service'
import { CreateProductInput, UpdateProductInput } from './../schema/product.scema'

export async function createProductHandler(
  req: Request<{}, {}, CreateProductInput['body']>,
  // no ResBody, no ReqBody, ReqQuery
  res: Response
) {
  const userId = res.locals.user._id
  const body = req.body
  const product = await createProduct({ ...body, user: userId })
  return res.send(product)
  // todo try catch error handling
}

export async function updateProductHandler(
  req: Request<UpdateProductInput['params'], {}, CreateProductInput['body']>,
  res: Response
) {
  const userId = res.locals.user._id
  const productId = req.params.productId
  const update = req.body
  const product = await findProduct({ productId })
  // ! Expected 2 arguments, but got 1.ts(2554)
  // ! product.service.ts(12, 3): An argument for 'options' was not provided.

  if (!product) {
    return res.sendStatus(404) // Not Found
  }

  // if (product.user !== userId) {
  // ! mongoose object id / mongodb id // userId is string
  if (String(product.user) !== userId) {
    return res.sendStatus(403) // Forbidden
    // make sure user that made is same the that deleting
  }

  const updatedProduct = await findAndUpdateProduct({ productId }, update, { new: true })

  return res.send(updatedProduct)
}

export async function getProductHandler(
  req: Request<UpdateProductInput['params']>,
  res: Response
) {
  const productId = req.params.productId
  const product = await findProduct({ productId })

  if (!product) {
    return res.sendStatus(404) // Not Found
  }

  return res.send(product)
}

export async function deleteProductHandler(
  req: Request<UpdateProductInput['params']>,
  res: Response
) {
  const userId = res.locals.user._id
  const productId = req.params.productId

  const product = await findProduct({ productId })
  // ! Expected 2 arguments, but got 1.ts(2554)
  // ! product.service.ts(12, 3): An argument for 'options' was not provided.

  if (!product) {
    return res.sendStatus(404) // Not Found
  }

  // if (product.user !== userId) {
  // ! mongoose object id / mongodb id // userId is string
  if (String(product.user) !== userId) {
    return res.sendStatus(403) // Forbidden
    // make sure user that made is same the that deleting
  }

  const deletedProduct = await deleteProduct({ productId })

  // return res.send(deletedProduct)
  return res.sendStatus(200)
}
