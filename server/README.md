# CodePulse Server

This is the backend server for CodePulse. It is built with Node.js, Express, and MongoDB.

## Structure

- **src/config/**: Configuration files (database, GitHub API)
- **src/routes/**: Express route definitions
- **src/controllers/**: Route handler logic
- **src/services/**: Business logic and integrations
- **src/models/**: Mongoose models
- **src/middlewares/**: Express middlewares
- **src/utils/**: Utility functions (logger)
- **src/app.js**: Express app setup
- **src/server.js**: Server entry point

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with your environment variables (e.g., `MONGO_URI`, `PORT`, `GITHUB_WEBHOOK_SECRET`).
3. Start the server:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev`: Start server with nodemon
- `npm start`: Start server normally

## License
MIT
