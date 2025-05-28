// Import required modules
const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/connection");

// Define Inventory model
const Inventory = sequelize.define(
  "Inventory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, 
      references: {
        model: "products",
        key: "id",
      },
    },
    currentStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    minimumStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 0,
      },
    },
    maximumStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    reorderPoint: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
      validate: {
        min: 0,
      },
    },
    reorderQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: 1,
      },
    },
    warehouseLocation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastRestockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastStockCount: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "inventory",
    timestamps: true,
    indexes: [
      {
        fields: ["currentStock"], 
      },
    ],
    instanceMethods: {
      isLowStock() {
        return this.currentStock <= this.minimumStock;
      },
      needsReorder() {
        return this.currentStock <= this.reorderPoint;
      },
    },
  }
);

Inventory.prototype.getStockStatus = function () {
  if (this.currentStock === 0) return "OUT_OF_STOCK";
  if (this.currentStock <= this.minimumStock) return "LOW_STOCK";
  if (this.maximumStock && this.currentStock >= this.maximumStock)
    return "OVERSTOCK";
  return "NORMAL";
};

module.exports = Inventory;
