import { number, object, string, TypeOf } from 'zod'

/**
 * @openapi
 * components:
 *  schemas:
 *    Product:
 *      type: object
 *      required:
 *        - title
 *        - description
 *        - price
 *        - image
 *      properties:
 *        title::
 *          type: string
 *        description:
 *          type: string
 *        price:
 *          type: number
 *        image:
 *          type: string
 */

const payload = {
  body: object({
    title: string({
      required_error: 'Title is required',
    }),
    description: string({
      required_error: 'Description is required',
    }).min(120, 'Descriptioin should be at least 120 characters long'),
    price: number({
      required_error: 'Price is required',
    }),
    image: string({
      required_error: 'Image is required',
    }),
  }),
}

const params = {
  params: object({
    productId: string({
      required_error: 'productId is required',
    }),
  }),
}

export const createProductSchema = object({
  ...payload,
})

export const updateProductSchema = object({
  ...payload,
  ...params,
})

export const deleteProductSchema = object({
  ...params,
})

export const getProductSchema = object({
  ...params,
})

export type CreateProductInput = TypeOf<typeof createProductSchema>

export type UpdateProductInput = TypeOf<typeof updateProductSchema>

export type FeleteProductInput = TypeOf<typeof deleteProductSchema>

export type GetProductInput = TypeOf<typeof getProductSchema>
