// Import all resolver modules
const productResolvers = require('./productResolvers');
const salesResolvers = require('./salesResolvers');
const inventoryResolvers = require('./inventoryResolvers');

// Merge all resolvers into one object
const resolvers = {
  Query: {
    // Combine all Query resolvers
    ...productResolvers.Query,
    ...salesResolvers.Query,
    ...inventoryResolvers.Query
  },
  
  Mutation: {
    // Combine all Mutation resolvers
    ...productResolvers.Mutation,
    ...inventoryResolvers.Mutation
    // Note: salesResolvers doesn't have mutations since sales are typically created through external systems
  },

  // Field resolvers for computed fields
  Inventory: {
    ...inventoryResolvers.Inventory
  }
};

module.exports = resolvers;