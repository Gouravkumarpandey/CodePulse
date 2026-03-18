/**
 * Server entry point
 * Initializes database connection and starts Express server
 */

require('dotenv').config(); 
const app = require('./app');


const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');

// Start server
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log('📦 Database: MongoDB Atlas');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Global error handlers to diagnose crashes
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
  // Log more details if possible
  if (err.stack) console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});


