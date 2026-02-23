const mongoose = require('mongoose');
const logger = require('../utils/logger.util');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Don't exit process in local dev if we want fallbacks, 
        // but for migration we should probably know if it fails.
        // process.exit(1);
        throw error;
    }
};

module.exports = connectDB;
