/**
 * Server entry point
 * Initializes database connection and starts Express server
 */

require('dotenv').config();
const app = require('./app');


const PORT = process.env.PORT || 5000;


// Start server (no DB connection needed)
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
