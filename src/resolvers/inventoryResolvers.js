const { Product, Inventory } = require('../models');

const inventoryResolvers = {
  Query: {
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

    inventoryByProduct: async (_, { productId }) => {
      try {
        const inventory = await Inventory.findOne({
          where: { productId },
          include: [{ model: Product, as: 'product' }]
        });
        
        if (!inventory) {
          throw new Error('Inventory record not found for this product');
        }
        
        return inventory;
      } catch (error) {
        throw new Error(`Failed to fetch inventory by product: ${error.message}`);
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

    productsNeedingReorder: async () => {
      try {
        const inventory = await Inventory.findAll({
          include: [{ model: Product, as: 'product' }],
          order: [['currentStock', 'ASC']]
        });
        
        // Filter products where current stock <= reorder point
        return inventory.filter(item => item.currentStock <= item.reorderPoint);
      } catch (error) {
        throw new Error(`Failed to fetch products needing reorder: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Inventory mutations
    updateInventory: async (_, { productId, input }) => {
      try {
        const inventory = await Inventory.findOne({ where: { productId } });
        
        if (!inventory) {
          throw new Error('Inventory record not found for this product');
        }
        
        await inventory.update(input);
        
        return await Inventory.findOne({
          where: { productId },
          include: [{ model: Product, as: 'product' }]
        });
      } catch (error) {
        throw new Error(`Failed to update inventory: ${error.message}`);
      }
    },

    adjustStock: async (_, { productId, adjustment, reason }) => {
      try {
        const inventory = await Inventory.findOne({ where: { productId } });
        
        if (!inventory) {
          throw new Error('Inventory record not found for this product');
        }
        
        const newStock = inventory.currentStock + adjustment;
        
        if (newStock < 0) {
          throw new Error('Cannot reduce stock below zero');
        }
        
        const currentNotes = inventory.notes || '';
        const timestamp = new Date().toISOString();
        const newNote = `${timestamp}: Stock adjusted by ${adjustment}${reason ? `. Reason: ${reason}` : ''}`;
        const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
        
        await inventory.update({
          currentStock: newStock,
          notes: updatedNotes
        });
        
        return await Inventory.findOne({
          where: { productId },
          include: [{ model: Product, as: 'product' }]
        });
      } catch (error) {
        throw new Error(`Failed to adjust stock: ${error.message}`);
      }
    },

    restockProduct: async (_, { productId, quantity }) => {
      try {
        const inventory = await Inventory.findOne({ where: { productId } });
        
        if (!inventory) {
          throw new Error('Inventory record not found for this product');
        }
        
        if (quantity <= 0) {
          throw new Error('Restock quantity must be greater than zero');
        }
        
        const currentNotes = inventory.notes || '';
        const timestamp = new Date().toISOString();
        const newNote = `${timestamp}: Restocked ${quantity} units`;
        const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
        
        await inventory.update({
          currentStock: inventory.currentStock + quantity,
          lastRestockedAt: new Date(),
          notes: updatedNotes
        });
        
        return await Inventory.findOne({
          where: { productId },
          include: [{ model: Product, as: 'product' }]
        });
      } catch (error) {
        throw new Error(`Failed to restock product: ${error.message}`);
      }
    }
  },

  // Field resolvers for computed values
  Inventory: {
    stockStatus: (inventory) => {
      if (inventory.currentStock === 0) return 'OUT_OF_STOCK';
      if (inventory.currentStock <= inventory.minimumStock) return 'LOW_STOCK';
      if (inventory.maximumStock && inventory.currentStock >= inventory.maximumStock) return 'OVERSTOCK';
      return 'NORMAL';
    },
    
    isLowStock: (inventory) => {
      return inventory.currentStock <= inventory.minimumStock;
    },
    
    needsReorder: (inventory) => {
      return inventory.currentStock <= inventory.reorderPoint;
    }
  }
};

module.exports = inventoryResolvers;