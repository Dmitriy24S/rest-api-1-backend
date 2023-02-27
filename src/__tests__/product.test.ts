import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import { createProduct } from '../service/product.service'
import { signJwt } from '../utils/jwt.utils'
import createServer from '../utils/server'

const app = createServer()

const userId = new mongoose.Types.ObjectId().toString()

export const productPayload = {
  user: userId,
  title: 'Canon EOS 1500D DSLR Camera with 18-55mm Lens',
  description:
    'Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.',
  price: 879.99,
  image: 'https://i.imgur.com/QlRphfQ.jpg',
  // productId: 'product-123',
}

export const userPayload = {
  _id: userId,
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
}

describe('product', () => {
  // ! rare not common use?
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create() // start instance of mongodb in memory, gives connection uri
    await mongoose.connect(mongoServer.getUri())
    // log.close()
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('get product route', () => {
    describe('given the product does not exist', () => {
      it('should return a 404', async () => {
        // expect(true).toBe(true)
        const productId = 'product-123'
        await supertest(app).get(`/api/products/${productId}`).expect(404)
        // ! The expected type comes from property 'refreshToken' which is declared here on type '{ refreshToken: string; }'
        // ! src/middleware/deserializeUser.ts:40:30 - error TS2345: Argument of type 'string | false' is not assignable to parameter of type 'string'.
        // ! Type 'boolean' is not assignable to type 'string
        // -> edit deserializeUser as string?
      })
    })

    describe('given the product exists', () => {
      it('should return a 200 status and the product', async () => {
        const product = await createProduct(productPayload) // create product // ! service edit? -> options?: otherwise An argument for 'options' was not provided?
        const { body, statusCode } = await supertest(app).get(
          `/api/products/${product.productId}`
        )
        // .expect(200) // supertest

        // console.log('createProduct body', body)
        // {
        //   _id: '63fc5539e6e8b6d212537396',
        //   productId: 'product-123',
        //   user: '63fc5539e6e8b6d212537392',
        //   title: 'Canon EOS 1500D DSLR Camera with 18-55mm Lens',
        //   description: 'Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.',
        //   price: 879.99,
        //   image: 'https://i.imgur.com/QlRphfQ.jpg',
        //   createdAt: '2023-02-27T07:01:13.777Z',
        //   updatedAt: '2023-02-27T07:01:13.777Z',
        //   __v: 0
        // }

        expect(statusCode).toBe(200) // jest
        expect(body.productId).toBe(product.productId) // jest
      })
    })
  })

  describe('create product route', () => {
    describe('given the user is not logged in', () => {
      it('should return a 403', async () => {
        const { statusCode } = await supertest(app).post('/api/products')
        expect(statusCode).toBe(403) // wihout jwt, going to hit require user middleware and not reach further
      })
    })
    describe('given the user is logged in', () => {
      it('should return a 200 and create the product', async () => {
        const jwt = signJwt(userPayload)
        const { statusCode, body } = await supertest(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload)

        expect(statusCode).toBe(200)
        // expect(body).toEqual({})
        // console.log('body', body)
        expect(body).toEqual({
          // user: '63fc5cd7c29d5e663cc92673',
          user: expect.any(String),
          title: 'Canon EOS 1500D DSLR Camera with 18-55mm Lens',
          description:
            'Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.',
          price: 879.99,
          image: 'https://i.imgur.com/QlRphfQ.jpg',
          // _id: '63fc5cd8c29d5e663cc9267a',
          _id: expect.any(String),
          // productId: 'product_2y7odw76e1',
          productId: expect.any(String),
          // createdAt: '2023-02-27T07:33:44.062Z',
          createdAt: expect.any(String),
          // updatedAt: '2023-02-27T07:33:44.062Z',
          updatedAt: expect.any(String),
          __v: 0,
        })
      })
    })
  })
})
