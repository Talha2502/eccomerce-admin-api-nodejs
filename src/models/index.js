// Import database connection
const { sequelize } = require("../database/connection");

// Import all models
const Product = require("./Product");
const Sale = require("./Sale");
const Inventory = require("./Inventory");

// Define model associations (relationships)

// Product has many Sales (one product can have multiple sales)
Product.hasMany(Sale, {
  foreignKey: "productId",
  as: "sales",
});

// Sale belongs to Product (each sale is for one product)
Sale.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// Product has one Inventory record
Product.hasOne(Inventory, {
  foreignKey: "productId",
  as: "inventory",
});

// Inventory belongs to Product
Inventory.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});
// Function to sync all models with database
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ All models synced successfully");

    if (force) {
      console.log("⚠️  Database tables recreated (all data lost)");
    }
  } catch (error) {
    console.error("❌ Error syncing models:", error.message);
    throw error;
  }
};
// Function to close database connection
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error.message);
  }
};

// Export models and utility functions
module.exports = {
  sequelize,
  Product,
  Sale,
  Inventory,
  syncModels,
  closeConnection,
};
