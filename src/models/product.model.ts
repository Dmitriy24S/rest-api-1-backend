import mongoose from 'mongoose'
import { customAlphabet } from 'nanoid'
import { UserDocument } from './user.model'
// import bcrypt from 'bcrypt'
// import config from 'config'

const nanoid = customAlphabet('abcdefgjklmnopqestywzyx0123456789', 10) // Generate secure unique ID with custom alphabet. 10 char. length
// ! Error: require() of ES Module /.../rest-api/node_modules/nanoid/index.js from /.../rest-api/src/models/product.model.ts not supported.
// ! Instead change the require of index.js in /.../rest-api/src/models/product.model.ts to a dynamic import() which is available in all CommonJS modules.

// Integrate mongoose with typescript (possible multiple methods to do this)
export interface ProductDocument extends mongoose.Document {
  user: UserDocument['_id'] // user that created the product
  title: string
  description: string
  price: number
  image: string
  createdAt: Date
  updatedAt: Date
}

// Schema
const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      default: () => `product_${nanoid()}`,
      // id from our custom alphabet
      // can also use mongodb id
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Model
const ProductModel = mongoose.model<ProductDocument>('Product', productSchema)

export default ProductModel
