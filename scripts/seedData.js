// Import required modules
const { syncModels, Product, Sale, Inventory } = require('../src/models');
const { testConnection } = require('../src/database/connection');
require('dotenv').config();

// Sample product data (Amazon/Walmart style products)
const sampleProducts = [
    {
      name: 'Apple iPhone 15 Pro Max 256GB',
      description: 'Latest flagship smartphone with A17 Pro chip, titanium design, and advanced camera system',
      price: 1199.99,
      category: 'Electronics',
      brand: 'Apple',
      sku: 'IPHONE15-PM-256',
      status: 'active'
    },
    {
      name: 'Samsung 65" QLED 4K Smart TV',
      description: 'Premium QLED display with Quantum Dot technology and smart features',
      price: 899.99,
      category: 'Electronics',
      brand: 'Samsung',
      sku: 'SAM-QLED65-4K',
      status: 'active'
    },
    {
      name: 'Nike Air Max 270 Sneakers',
      description: 'Comfortable running shoes with Max Air cushioning',
      price: 129.99,
      category: 'Clothing & Shoes',
      brand: 'Nike',
      sku: 'NIKE-AM270-BLK',
      status: 'active'
    },
    {
      name: 'KitchenAid Stand Mixer 5Qt',
      description: 'Professional-grade stand mixer for baking and cooking',
      price: 349.99,
      category: 'Home & Kitchen',
      brand: 'KitchenAid',
      sku: 'KA-MIXER-5QT',
      status: 'active'
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Premium noise-canceling wireless headphones',
      price: 399.99,
      category: 'Electronics',
      brand: 'Sony',
      sku: 'SONY-WH1000XM5',
      status: 'active'
    },
    {
      name: 'Dyson V15 Detect Vacuum',
      description: 'Cordless vacuum with laser dust detection',
      price: 649.99,
      category: 'Home & Kitchen',
      brand: 'Dyson',
      sku: 'DYSON-V15-DET',
      status: 'active'
    },
    {
      name: 'Levi\'s 501 Original Jeans',
      description: 'Classic straight-fit denim jeans',
      price: 89.99,
      category: 'Clothing & Shoes',
      brand: 'Levi\'s',
      sku: 'LEVIS-501-BLUE',
      status: 'active'
    },
    {
      name: 'Instant Pot Duo 8Qt',
      description: '7-in-1 electric pressure cooker',
      price: 119.99,
      category: 'Home & Kitchen',
      brand: 'Instant Pot',
      sku: 'IP-DUO-8QT',
      status: 'active'
    },
    {
      name: 'MacBook Air M2 13-inch',
      description: 'Lightweight laptop with Apple M2 chip',
      price: 1299.99,
      category: 'Electronics',
      brand: 'Apple',
      sku: 'MBA-M2-13-256',
      status: 'active'
    },
    {
      name: 'Adidas Ultraboost 22 Running Shoes',
      description: 'High-performance running shoes with Boost technology',
      price: 189.99,
      category: 'Clothing & Shoes',
      brand: 'Adidas',
      sku: 'ADIDAS-UB22-WHT',
      status: 'discontinued'
    }
  ];

  // Function to generate random sales data
const generateSalesData = (products) => {
    const sales = [];
    const platforms = ['amazon', 'walmart', 'direct', 'other'];
    const statuses = ['completed', 'pending', 'cancelled', 'refunded'];
    
    // Generate sales for the last 90 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);
    
    products.forEach(product => {
      // Generate 5-20 sales per product
      const salesCount = Math.floor(Math.random() * 16) + 5;
      
      for (let i = 0; i < salesCount; i++) {
        // Random date within the last 90 days
        const saleDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        
        // Random quantity (1-5 items)
        const quantity = Math.floor(Math.random() * 5) + 1;
        
        // Price with some variance (±10%)
        const variance = (Math.random() - 0.5) * 0.2;
        const unitPrice = parseFloat((product.price * (1 + variance)).toFixed(2));
        const totalAmount = parseFloat((unitPrice * quantity).toFixed(2));
        
        // Random platform and status
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const status = Math.random() > 0.1 ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)];
        
        sales.push({
          productId: product.id,
          quantity,
          unitPrice,
          totalAmount,
          customerName: `Customer ${Math.floor(Math.random() * 1000)}`,
          customerEmail: `customer${Math.floor(Math.random() * 1000)}@example.com`,
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          saleDate,
          platform,
          status
        });
      }
    });
    
    return sales;
  };

  // Function to generate inventory data
const generateInventoryData = (products) => {
    return products.map(product => {
      const currentStock = Math.floor(Math.random() * 200) + 10; // 10-210 items
      const minimumStock = Math.floor(Math.random() * 20) + 5;   // 5-25 items
      const reorderPoint = minimumStock + Math.floor(Math.random() * 15) + 5;
      
      return {
        productId: product.id,
        currentStock,
        minimumStock,
        maximumStock: currentStock + Math.floor(Math.random() * 100) + 50,
        reorderPoint,
        reorderQuantity: Math.floor(Math.random() * 100) + 50,
        warehouseLocation: `Warehouse-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 10) + 1}`,
        lastRestockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        lastStockCount: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),   // Last 7 days
        notes: 'Initial inventory setup'
      };
    });
  };

  // Main seeding function
async function seedDatabase() {
    try {
      console.log('🌱 Starting database seeding...');
      
      // Test connection
      await testConnection();
      
      // Sync models (recreate tables)
      console.log('📊 Recreating database tables...');
      await syncModels(true); // true = force recreate tables
      
      // Insert products
      console.log('📦 Creating products...');
      const createdProducts = await Product.bulkCreate(sampleProducts);
      console.log(`✅ Created ${createdProducts.length} products`);
      
      // Generate and insert inventory data
      console.log('📋 Creating inventory records...');
      const inventoryData = generateInventoryData(createdProducts);
      await Inventory.bulkCreate(inventoryData);
      console.log(`✅ Created ${inventoryData.length} inventory records`);
      
      // Generate and insert sales data
      console.log('💰 Creating sales records...');
      const salesData = generateSalesData(createdProducts);
      await Sale.bulkCreate(salesData);
      console.log(`✅ Created ${salesData.length} sales records`);
      
      // Display summary
      console.log('\n🎉 ================================');
      console.log('✅ DATABASE SEEDING COMPLETED!');
      console.log('🎉 ================================');
      console.log(`📦 Products: ${createdProducts.length}`);
      console.log(`📋 Inventory Records: ${inventoryData.length}`);
      console.log(`💰 Sales Records: ${salesData.length}`);
      console.log('🎉 ================================\n');
      
    } catch (error) {
      console.error('❌ Error seeding database:', error.message);
      console.error('Stack trace:', error.stack);
    } finally {
      process.exit(0);
    }
  }

  // Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
  }
  
  module.exports = { seedDatabase };

  