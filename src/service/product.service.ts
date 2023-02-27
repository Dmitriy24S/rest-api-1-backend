import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import ProductModel, { ProductDocument, ProductInput } from '../models/product.model'

export async function createProduct(
  // input: DocumentDefinition<
  // Omit<ProductDocument, 'createdAt' | 'updatedAt' | 'productId'>
  // >
  // input: DocumentDefinition<Omit<ProductDocument, 'createdAt' | 'updatedAt'>>
  // input: Omit<ProductDocument, 'createdAt' | 'updatedAt'>
  // input: Omit<ProductInput, 'productId'> // ! (tests ts errors experiment)
  input: ProductInput
) {
  return ProductModel.create(input)
}

export async function findProduct(
  query: FilterQuery<ProductDocument>,
  // options: QueryOptions
  options?: QueryOptions
) {
  return ProductModel.findOne(query, {}, options)
  // (filter?: FilterQuery<ProductDocument> | undefined, projection?: ProjectionType<ProductDocument> | null | undefined, options?: QueryOptions<ProductDocument> | null | undefined,
}

export async function findAndUpdateProduct(
  query: FilterQuery<ProductDocument>,
  update: UpdateQuery<ProductDocument>,
  options: QueryOptions
) {
  return ProductModel.findOneAndUpdate(query, update, options)
}

export async function deleteProduct(query: FilterQuery<ProductDocument>) {
  return ProductModel.deleteOne(query)
}
