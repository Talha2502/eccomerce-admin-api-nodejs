// Import the app initialization function
const { initializeApp } = require("./app");
require("dotenv").config();

// Server configuration
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "localhost";

// Graceful shutdown function
const gracefulShutdown = (server) => {
  return (signal) => {
    console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

    server.close((err) => {
      if (err) {
        console.error("❌ Error during server shutdown:", err);
        process.exit(1);
      }

      console.log("✅ Server closed successfully");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.log("⚠️  Forced shutdown due to timeout");
      process.exit(1);
    }, 10000);
  };
};

// Start the server
async function startServer() {
  try {
    console.log("🌟 Starting E-commerce Admin API Server...");
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);

    // Initialize the application
    const app = await initializeApp();

    // Start the HTTP server
    const server = app.listen(PORT, HOST, () => {
      console.log("\n🎉 ================================");
      console.log("🚀 SERVER STARTED SUCCESSFULLY!");
      console.log("🎉 ================================");
      console.log(`📍 Server running at: http://${HOST}:${PORT}`);
      console.log(`🎯 GraphQL endpoint: http://${HOST}:${PORT}/graphql`);
      console.log(`🔍 Health check: http://${HOST}:${PORT}/health`);

      if (process.env.NODE_ENV !== "production") {
        console.log(`🎮 GraphQL Playground: http://${HOST}:${PORT}/graphql`);
      }

      console.log("🎉 ================================\n");
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Please use a different port.`
        );
      } else {
        console.error("❌ Server error:", error.message);
      }
      process.exit(1);
    });

    // Setup graceful shutdown
    const shutdown = gracefulShutdown(server);
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
    process.on("SIGUSR2", shutdown); // For nodemon restarts
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
