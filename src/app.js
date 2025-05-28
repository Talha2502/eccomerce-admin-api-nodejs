// Import required packages
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
require('dotenv').config();

// Import GraphQL schema and resolvers
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers');

// Import database connection
const { testConnection } = require('./database/connection');
const { syncModels } = require('./models');

// Create Express app
const app = express();

// Middleware setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your actual domain in production
    : ['http://localhost:3000', 'http://localhost:4000'], // Allow localhost for development
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create Apollo Server
async function createApolloServer() {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => {
        // You can add authentication context here later
        return {
          user: req.user || null,
          req
        };
      },
      // Enable GraphQL Playground in development
      introspection: process.env.NODE_ENV !== 'production',
      playground: process.env.NODE_ENV !== 'production'
    });
  
    await server.start();
    return server;
  }

  // Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'E-commerce Admin API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });

  // Initialize the application
async function initializeApp() {
    try {
      // Test database connection
      console.log('🔗 Testing database connection...');
      await testConnection();
      
      // Sync database models
      console.log('📊 Syncing database models...');
      await syncModels(false); // Set to true to recreate tables (WARNING: deletes data)
      
      // Create and apply Apollo Server
      console.log('🚀 Setting up GraphQL server...');
      const apolloServer = await createApolloServer();
      apolloServer.applyMiddleware({ app, path: '/graphql' });
      
      console.log('✅ Application initialized successfully');
      console.log(`🎯 GraphQL endpoint: /graphql`);
      console.log(`🎮 GraphQL Playground: /graphql (development only)`);
      
      return app;
    } catch (error) {
      console.error('❌ Failed to initialize application:', error.message);
      throw error;
    }
  }

  module.exports = { app, initializeApp };
  

