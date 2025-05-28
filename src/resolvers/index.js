// Import database models
const { Product, Sale, Inventory } = require('../models');
const { Op } = require('sequelize');

// GraphQL resolvers
const resolvers = {
  Query: {
    // Product queries
    products: async () => {
      try {
        return await Product.findAll({
          include: [
            { model: Sale, as: 'sales' },
            { model: Inventory, as: 'inventory' }
          ],
          order: [['createdAt', 'DESC']]
        });
      } catch (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
    },
    product: async (_, { id }) => {
      try {
        const product = await Product.findByPk(id, {
          include: [
            { model: Sale, as: 'sales' },
            { model: Inventory, as: 'inventory' }
          ]
        });
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        return product;
      } catch (error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
    },

    productsByCategory: async (_, { category }) => {
      try {
        return await Product.findAll({
          where: { category },
          include: [
            { model: Sale, as: 'sales' },
            { model: Inventory, as: 'inventory' }
          ]
        });
      } catch (error) {
        throw new Error(`Failed to fetch products by category: ${error.message}`);
      }
    },

    // Sales queries
    sales: async () => {
      try {
        return await Sale.findAll({
          include: [{ model: Product, as: 'product' }],
          order: [['saleDate', 'DESC']]
        });
      } catch (error) {
        throw new Error(`Failed to fetch sales: ${error.message}`);
      }
    },

    salesByDateRange: async (_, { startDate, endDate }) => {
      try {
        return await Sale.findAll({
          where: {
            saleDate: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          },
          include: [{ model: Product, as: 'product' }],
          order: [['saleDate', 'DESC']]
        });
      } catch (error) {
        throw new Error(`Failed to fetch sales by date range: ${error.message}`);
      }
    },
    // Revenue analytics
    dailyRevenue: async (_, { date }) => {
      try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const sales = await Sale.findAll({
          where: {
            saleDate: {
              [Op.between]: [startOfDay, endOfDay]
            },
            status: 'completed'
          }
        });

        return sales.reduce((total, sale) => total + parseFloat(sale.totalAmount), 0);
      } catch (error) {
        throw new Error(`Failed to calculate daily revenue: ${error.message}`);
      }
    },

    monthlyRevenue: async (_, { year, month }) => {
      try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const sales = await Sale.findAll({
          where: {
            saleDate: {
              [Op.between]: [startDate, endDate]
            },
            status: 'completed'
          }
        });

        return sales.reduce((total, sale) => total + parseFloat(sale.totalAmount), 0);
      } catch (error) {
        throw new Error(`Failed to calculate monthly revenue: ${error.message}`);
      }
    },
    // Inventory queries
    inventory: async () => {
      try {
        return await Inventory.findAll({
          include: [{ model: Product, as: 'product' }],
          order: [['updatedAt', 'DESC']]
        });
      } catch (error) {
        throw new Error(`Failed to fetch inventory: ${error.message}`);
      }
    },

    lowStockProducts: async () => {
      try {
        const inventory = await Inventory.findAll({
          include: [{ model: Product, as: 'product' }],
          order: [['currentStock', 'ASC']]
        });
        
        // Filter products where current stock <= minimum stock
        return inventory.filter(item => item.currentStock <= item.minimumStock);
      } catch (error) {
        throw new Error(`Failed to fetch low stock products: ${error.message}`);
      }
    },
  },
  // Mutations for creating/updating data
  Mutation: {
    // Product mutations
    createProduct: async (_, { input }) => {
      try {
        const product = await Product.create(input);
        
        // Create initial inventory record for the new product
        await Inventory.create({
          productId: product.id,
          currentStock: 0,
          minimumStock: 10,
          reorderPoint: 20,
          reorderQuantity: 50
        });
        
        return await Product.findByPk(product.id, {
          include: [{ model: Inventory, as: 'inventory' }]
        });
      } catch (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }
    },
    updateProduct: async (_, { id, input }) => {
      try {
        const product = await Product.findByPk(id);
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        await product.update(input);
        
        return await Product.findByPk(id, {
          include: [
            { model: Sale, as: 'sales' },
            { model: Inventory, as: 'inventory' }
          ]
        });
      } catch (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }
    },

    deleteProduct: async (_, { id }) => {
      try {
        const product = await Product.findByPk(id);
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        // Check if product has sales history
        const salesCount = await Sale.count({ where: { productId: id } });
        
        if (salesCount > 0) {
          // Soft delete - just mark as discontinued
          await product.update({ status: 'discontinued' });
        } else {
          // Hard delete if no sales history
          await product.destroy();
        }
        
        return true;
      } catch (error) {
        throw new Error(`Failed to delete product: ${error.message