# E-commerce Admin API

A comprehensive GraphQL-based API for e-commerce admin dashboards, providing detailed insights into sales, revenue, and inventory management.

## 🚀 Features

- **Sales Analytics**: Daily, weekly, monthly, and annual revenue tracking
- **Inventory Management**: Real-time stock levels, low stock alerts, and reorder management
- **Product Management**: Complete CRUD operations for products
- **GraphQL API**: Modern, flexible API with introspection and playground
- **Database Integration**: PostgreSQL with Sequelize ORM
- **Demo Data**: Pre-populated sample data for testing

## 🛠️ Technology Stack

- **Backend Framework**: Node.js with Express.js
- **API**: GraphQL (Apollo Server Express)
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (Ready for implementation)
- **Environment**: Configurable for development/production

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14.0 or higher)
- PostgreSQL (v12.0 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/talha2502/ecommerce-admin-api.git
cd ecommerce-admin-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_admin
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
```

### 4. Database Setup
Create a PostgreSQL database:
```sql
CREATE DATABASE ecommerce_admin;
```

### 5. Run Database Migrations & Seed Data
```bash
npm run seed
```

### 6. Start the Server
For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## 📊 Database Schema

### Products Table
- `id`: Primary key (auto-increment)
- `name`: Product name (required, max 255 chars)
- `description`: Product description (text)
- `price`: Product price (decimal 10,2)
- `category`: Product category (required, max 100 chars)
- `brand`: Product brand (max 100 chars)
- `sku`: Stock Keeping Unit (unique, max 50 chars)
- `status`: Product status (enum: active/inactive/discontinued)
- `createdAt`, `updatedAt`, `deletedAt`: Timestamps (soft delete enabled)

### Sales Table
- `id`: Primary key (auto-increment)
- `productId`: Foreign key to Products (required)
- `quantity`: Number of items sold (integer, min 1)
- `unitPrice`: Price per unit at time of sale (decimal 10,2)
- `totalAmount`: Total sale amount (decimal 10,2)
- `customerName`: Customer name (max 255 chars)
- `customerEmail`: Customer email (valid email format)
- `orderNumber`: Unique order identifier (max 100 chars, unique)
- `saleDate`: Date of sale (default: current timestamp)
- `platform`: Sales platform (enum: amazon/walmart/direct/other)
- `status`: Sale status (enum: pending/completed/cancelled/refunded)
- `createdAt`, `updatedAt`: Timestamps

### Inventory Table
- `id`: Primary key (auto-increment)
- `productId`: Foreign key to Products (unique, one-to-one)
- `currentStock`: Current stock level (integer, min 0)
- `minimumStock`: Minimum stock threshold (integer, min 0, default 10)
- `maximumStock`: Maximum stock capacity (integer, min 0, optional)
- `reorderPoint`: Reorder trigger point (integer, min 0, default 20)
- `reorderQuantity`: Suggested reorder amount (integer, min 1, default 50)
- `warehouseLocation`: Storage location (max 100 chars)
- `lastRestockedAt`: Last restock date
- `lastStockCount`: Last inventory count date
- `notes`: Additional notes (text)
- `createdAt`, `updatedAt`: Timestamps

## 🔍 API Endpoints

### GraphQL Endpoint
- **URL**: `http://localhost:4000/graphql`
- **Playground**: Available in development mode at the same URL

### Health Check
- **URL**: `http://localhost:4000/health`
- **Method**: GET
- **Response**: Server status and information

## 📝 GraphQL Schema Overview

### Types
- **Product**: Complete product information with sales and inventory
- **Sale**: Individual sale records with product relationships
- **Inventory**: Stock management with computed fields
- **Enums**: ProductStatus, SalePlatform, SaleStatus, StockStatus

### Computed Fields
- `Inventory.stockStatus`: Automatically calculated stock status
- `Inventory.isLowStock`: Boolean indicating if stock is below minimum
- `Inventory.needsReorder`: Boolean indicating if reorder is needed

## 📝 GraphQL Queries Examples

### Get All Products with Inventory
```graphql
query GetProducts {
  products {
    id
    name
    price
    category
    brand
    sku
    status
    inventory {
      currentStock
      minimumStock
      stockStatus
      isLowStock
      needsReorder
    }
    sales {
      id
      totalAmount
      saleDate
    }
  }
}
```

### Get Product by ID
```graphql
query GetProduct($id: Int!) {
  product(id: $id) {
    id
    name
    description
    price
    category
    brand
    sku
    status
    createdAt
    inventory {
      currentStock
      minimumStock
      maximumStock
      reorderPoint
      stockStatus
      warehouseLocation
    }
  }
}
```

### Get Sales by Date Range
```graphql
query GetSalesByDateRange($startDate: String!, $endDate: String!) {
  salesByDateRange(startDate: $startDate, endDate: $endDate) {
    id
    quantity
    unitPrice
    totalAmount
    customerName
    orderNumber
    saleDate
    platform
    status
    product {
      name
      sku
      category
    }
  }
}
```

### Revenue Analytics
```graphql
query GetRevenueAnalytics {
  dailyRevenue(date: "2024-05-28")
  weeklyRevenue(startDate: "2024-05-20")
  monthlyRevenue(year: 2024, month: 5)
  annualRevenue(year: 2024)
}
```

### Inventory Management Queries
```graphql
query GetInventoryStatus {
  lowStockProducts {
    currentStock
    minimumStock
    product {
      name
      sku
      category
    }
  }
  
  productsNeedingReorder {
    currentStock
    reorderPoint
    reorderQuantity
    product {
      name
      sku
    }
  }
}
```

### Sales by Platform
```graphql
query GetSalesByPlatform($platform: SalePlatform!) {
  salesByPlatform(platform: $platform) {
    id
    quantity
    totalAmount
    customerName
    orderNumber
    saleDate
    product {
      name
      category
    }
  }
}
```

## 🔄 GraphQL Mutations Examples

### Create New Product
```graphql
mutation CreateProduct($input: ProductInput!) {
  createProduct(input: $input) {
    id
    name
    price
    category
    sku
    status
    inventory {
      currentStock
      minimumStock
      reorderPoint
    }
  }
}

# Variables:
{
  "input": {
    "name": "New Smartphone",
    "description": "Latest model with advanced features",
    "price": 799.99,
    "category": "Electronics",
    "brand": "TechBrand",
    "sku": "PHONE-2024-001",
    "status": "ACTIVE"
  }
}
```

### Update Product
```graphql
mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {
  updateProduct(id: $id, input: $input) {
    id
    name
    price
    status
    updatedAt
  }
}

# Variables:
{
  "id": 1,
  "input": {
    "price": 899.99,
    "status": "ACTIVE"
  }
}
```

### Update Inventory
```graphql
mutation UpdateInventory($productId: Int!, $input: InventoryUpdateInput!) {
  updateInventory(productId: $productId, input: $input) {
    currentStock
    minimumStock
    stockStatus
    isLowStock
    product {
      name
    }
  }
}

# Variables:
{
  "productId": 1,
  "input": {
    "currentStock": 150,
    "minimumStock": 20,
    "reorderPoint": 30,
    "warehouseLocation": "Warehouse-A1"
  }
}
```

### Adjust Stock (Increase/Decrease)
```graphql
mutation AdjustStock($productId: Int!, $adjustment: Int!, $reason: String) {
  adjustStock(productId: $productId, adjustment: $adjustment, reason: $reason) {
    currentStock
    notes
    stockStatus
    product {
      name
      sku
    }
  }
}

# Variables (to decrease stock):
{
  "productId": 1,
  "adjustment": -10,
  "reason": "Sale completed - 10 units sold"
}

# Variables (to increase stock):
{
  "productId": 1,
  "adjustment": 50,
  "reason": "New shipment received"
}
```

### Restock Product
```graphql
mutation RestockProduct($productId: Int!, $quantity: Int!) {
  restockProduct(productId: $productId, quantity: $quantity) {
    currentStock
    lastRestockedAt
    notes
    stockStatus
    product {
      name
    }
  }
}

# Variables:
{
  "productId": 1,
  "quantity": 100
}
```

### Delete Product
```graphql
mutation DeleteProduct($id: Int!) {
  deleteProduct(id: $id)
}

# Variables:
{
  "id": 1
}
```

## 📱 Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed database with demo data (WARNING: This will recreate all tables)
npm run seed

# Run tests (to be implemented)
npm test
```

## 🏗️ Project Structure
```
ecommerce-admin-api/
├── src/
│   ├── database/
│   │   ├── config.js              # Database configuration for different environments
│   │   └── connection.js          # Sequelize connection setup and testing
│   ├── models/
│   │   ├── index.js               # Model relationships and sync functions
│   │   ├── Product.js             # Product model with validations
│   │   ├── Sale.js                # Sale model with foreign keys
│   │   └── Inventory.js           # Inventory model with computed methods
│   ├── resolvers/
│   │   ├── index.js               # Combined resolvers export
│   │   ├── productResolvers.js    # Product CRUD operations
│   │   ├── salesResolvers.js      # Sales queries and analytics
│   │   └── inventoryResolvers.js  # Inventory management operations
│   ├── schema/
│   │   └── typeDefs.js            # Complete GraphQL schema definitions
│   ├── app.js                     # Express app setup with Apollo Server
│   └── server.js                  # Server startup with graceful shutdown
├── scripts/
│   └── seedData.js                # Database seeding with realistic demo data
├── .env                           # Environment variables (not in git)
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
└── README.md                      # This documentation
```

## 🎯 Demo Data Overview

The seeding script creates realistic e-commerce data:

### Products (10 items)
- Electronics: iPhone, Samsung TV, Sony Headphones, MacBook Air
- Home & Kitchen: KitchenAid Mixer, Dyson Vacuum, Instant Pot
- Clothing & Shoes: Nike Air Max, Levi's Jeans, Adidas Ultraboost

### Sales (50-200 records)
- Random sales over the last 90 days
- Multiple platforms (Amazon, Walmart, Direct, Other)
- Various quantities and price variations
- Realistic customer data

### Inventory
- Random stock levels (10-210 items)
- Proper reorder points and minimum stock levels
- Warehouse locations (A1-E10)
- Recent restock and count dates

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=ecommerce_admin
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_very_long_and_complex_production_secret
PORT=4000
```

### Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASSWORD=password
      - DB_NAME=ecommerce_admin
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=ecommerce_admin
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔒 Security Considerations

- Environment variables for sensitive data
- Input validation on all GraphQL inputs
- SQL injection prevention through Sequelize ORM
- Error handling without exposing sensitive information
- Ready for JWT authentication implementation

## 🧪 Testing the API

### Using GraphQL Playground
1. Start the server: `npm run dev`
2. Open browser: `http://localhost:4000/graphql`
3. Use the interactive playground to test queries

### Example Test Sequence
1. **Get all products**: Test the products query
2. **Check inventory**: Look for low stock products
3. **Analyze sales**: Get revenue for current month
4. **Create product**: Add a new product
5. **Update stock**: Adjust inventory levels
6. **Generate reports**: Use date range queries

## 📈 Performance Considerations

- Database indexes on frequently queried fields
- Connection pooling for database efficiency
- GraphQL query depth limiting (can be implemented)
- Pagination for large datasets (can be added)
- Caching strategies for repeated queries

## 🛠️ Future Enhancements

- [ ] JWT Authentication & Authorization
- [ ] Role-based access control
- [ ] Real-time subscriptions for stock updates
- [ ] File upload for product images
- [ ] Pagination for large datasets
- [ ] Query complexity analysis
- [ ] Rate limiting
- [ ] Comprehensive test suite
- [ ] API documentation generation
- [ ] Monitoring and logging

## 🤝 Contributing

1. Fork the repository: `https://github.com/talha2502/ecommerce-admin-api`
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support & Contact

**Developer**: Syed Talha Ejaz
- **Email**: tsyed225@gmail.com
- **GitHub**: [@talha2502](https://github.com/talha2502)
- **Issues**: [GitHub Issues](https://github.com/talha2502/ecommerce-admin-api/issues)

For questions, bug reports, or feature requests, please use GitHub Issues or contact via email.
