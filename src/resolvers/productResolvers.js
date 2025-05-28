const { Product, Sale, Inventory } = require('../models');

const productResolvers = {
  Query: {
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

    productsByStatus: async (_, { status }) => {
      try {
        return await Product.findAll({
          where: { status: status.toLowerCase() },
          include: [
            { model: Sale, as: 'sales' },
            { model: Inventory, as: 'inventory' }
          ]
        });
      } catch (error) {
        throw new Error(`Failed to fetch products by status: ${error.message}`);
      }
    }
  },

  Mutation: {
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
        throw new Error(`Failed to delete product: ${error.message}`);
      }
    }
  }
};

module.exports = productResolvers;