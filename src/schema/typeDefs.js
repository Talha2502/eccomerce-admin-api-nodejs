const { gql } = require("apollo-server-express");

// Define GraphQL schema
const typeDefs = gql`
  # Product type definition
  type Product {
    id: Int!
    name: String!
    description: String
    price: Float!
    category: String!
    brand: String
    sku: String!
    status: ProductStatus!
    createdAt: String!
    updatedAt: String!
    sales: [Sale!]!
    inventory: Inventory
  }

  # Enum for product status
  enum ProductStatus {
    ACTIVE
    INACTIVE
    DISCONTINUED
  }

  # Sale type definition
  type Sale {
    id: Int!
    productId: Int!
    quantity: Int!
    unitPrice: Float!
    totalAmount: Float!
    customerName: String
    customerEmail: String
    orderNumber: String!
    saleDate: String!
    platform: SalePlatform!
    status: SaleStatus!
    createdAt: String!
    product: Product!
  }

  # Enums for sales
  enum SalePlatform {
    AMAZON
    WALMART
    DIRECT
    OTHER
  }

  enum SaleStatus {
    PENDING
    COMPLETED
    CANCELLED
    REFUNDED
  }

  # Inventory type definition
  type Inventory {
    id: Int!
    productId: Int!
    currentStock: Int!
    minimumStock: Int!
    maximumStock: Int
    reorderPoint: Int!
    reorderQuantity: Int!
    warehouseLocation: String
    lastRestockedAt: String
    lastStockCount: String
    notes: String
    stockStatus: StockStatus!
    isLowStock: Boolean!
    needsReorder: Boolean!
    createdAt: String!
    updatedAt: String!
    product: Product!
  }

  # Enum for stock status
  enum StockStatus {
    OUT_OF_STOCK
    LOW_STOCK
    NORMAL
    OVERSTOCK
  }

  # Query definitions - what data we can fetch
  type Query {
    # Product queries
    products: [Product!]!
    product(id: Int!): Product
    productsByCategory(category: String!): [Product!]!
    productsByStatus(status: ProductStatus!): [Product!]!

    # Sales queries
    sales: [Sale!]!
    sale(id: Int!): Sale
    salesByProduct(productId: Int!): [Sale!]!
    salesByDateRange(startDate: String!, endDate: String!): [Sale!]!
    salesByPlatform(platform: SalePlatform!): [Sale!]!

    # Revenue analytics
    dailyRevenue(date: String!): Float!
    weeklyRevenue(startDate: String!): Float!
    monthlyRevenue(year: Int!, month: Int!): Float!
    annualRevenue(year: Int!): Float!

    # Inventory queries
    inventory: [Inventory!]!
    inventoryByProduct(productId: Int!): Inventory
    lowStockProducts: [Inventory!]!
    productsNeedingReorder: [Inventory!]!
  }

  # Input types for creating/updating data
  input ProductInput {
    name: String!
    description: String
    price: Float!
    category: String!
    brand: String
    sku: String!
    status: ProductStatus
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    category: String
    brand: String
    status: ProductStatus
  }

  input InventoryUpdateInput {
    currentStock: Int
    minimumStock: Int
    maximumStock: Int
    reorderPoint: Int
    reorderQuantity: Int
    warehouseLocation: String
    notes: String
  }

  # Mutation definitions - what data we can modify
  type Mutation {
    # Product mutations
    createProduct(input: ProductInput!): Product!
    updateProduct(id: Int!, input: UpdateProductInput!): Product!
    deleteProduct(id: Int!): Boolean!

    # Inventory mutations
    updateInventory(productId: Int!, input: InventoryUpdateInput!): Inventory!
    adjustStock(productId: Int!, adjustment: Int!, reason: String): Inventory!
    restockProduct(productId: Int!, quantity: Int!): Inventory!
  }
`;

module.exports = typeDefs;
