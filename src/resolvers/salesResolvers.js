const { Product, Sale } = require('../models');
const { Op } = require('sequelize');

const salesResolvers = {
  Query: {
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

    sale: async (_, { id }) => {
      try {
        const sale = await Sale.findByPk(id, {
          include: [{ model: Product, as: 'product' }]
        });
        
        if (!sale) {
          throw new Error('Sale not found');
        }
        
        return sale;
      } catch (error) {
        throw new Error(`Failed to fetch sale: ${error.message}`);
      }
    },

    salesByProduct: async (_, { productId }) => {
      try {
        return await Sale.findAll({
          where: { productId },
          include: [{ model: Product, as: 'product' }],
          order: [['saleDate', 'DESC']]
        });
      } catch (error) {
        throw new Error(`Failed to fetch sales by product: ${error.message}`);
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

    salesByPlatform: async (_, { platform }) => {
      try {
        return await Sale.findAll({
          where: { platform: platform.toLowerCase() },
          include: [{ model: Product, as: 'product' }],
          order: [['saleDate', 'DESC']]
        });
      } catch (error) {
        throw new Error(`Failed to fetch sales by platform: ${error.message}`);
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

    weeklyRevenue: async (_, { startDate }) => {
      try {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        const sales = await Sale.findAll({
          where: {
            saleDate: {
              [Op.between]: [start, end]
            },
            status: 'completed'
          }
        });

        return sales.reduce((total, sale) => total + parseFloat(sale.totalAmount), 0);
      } catch (error) {
        throw new Error(`Failed to calculate weekly revenue: ${error.message}`);
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

    annualRevenue: async (_, { year }) => {
      try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

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
        throw new Error(`Failed to calculate annual revenue: ${error.message}`);
      }
    }
  }
};

module.exports = salesResolvers;