// Import required modules
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

// Define Sale model
const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  orderNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  saleDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  platform: {
    type: DataTypes.ENUM('amazon', 'walmart', 'direct', 'other'),
    defaultValue: 'direct'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'completed'
  }
}, {
  tableName: 'sales',
  timestamps: true,
  indexes: [
    {
      fields: ['saleDate'] // Index for date-based queries
    },
    {
      fields: ['productId'] // Index for product-based queries
    }
  ]
});

module.exports = Sale;
  