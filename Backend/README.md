# CodePulse Backend

**GitHub Commit Consistency & Insight Platform - Backend API**

CodePulse analyzes GitHub repository commit activity to measure work consistency using rule-based time analysis combined with Google AI insights. It focuses on commit behavior, encouraging developers to make small, frequent commits instead of large, last-minute pushes.

## Project Structure

```
src/
├── app.js                      # Express app setup
├── server.js                   # Server entry point
├── config/                     # Configuration files
│   ├── db.js                  # MongoDB connection
│   ├── env.js                 # Environment validation
│   ├── github.js              # GitHub OAuth config
│   └── gemini.js              # Google Gemini AI config
├── models/                     # MongoDB models
│   ├── User.js                # User model
│   ├── Repo.js                # Repository model
│   ├── Commit.js              # Commit tracking model
│   ├── RepoAnalysis.js        # AI insights & metrics
│   └── AdminSettings.js       # Rule configuration
├── controllers/                # Route controllers
├── routes/                     # API routes
├── services/                   # Business logic services
│   ├── github.service.js      # GitHub API integration
│   ├── ruleEngine.service.js  # Inactivity gap detection
│   ├── consistency.service.js # Consistency scoring
│   ├── ai.service.js          # Google AI insights
│   └── activity.service.js    # Commit processing
├── middlewares/                # Custom middlewares
├── utils/                      # Utility functions
└── constants/                  # Constants
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/codepulse

# Server
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URL=http://localhost:5000/api/github/callback
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret

# Google Gemini AI (Required for AI insights)
GOOGLE_AI_API_KEY=your_google_gemini_api_key_here

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5174/auth/google/callback
```

**Note:** To get a Google Gemini API key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env` file

### 3. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### GitHub
- `GET /api/github/callback` - OAuth callback
- `GET /api/github/repositories` - Fetch user repositories
- `POST /api/github/connect-repo` - Connect repository

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/repositories` - Get user repositories
- `GET /api/user/activity/:repoId` - Get repository activity
- `GET /api/user/dashboard` - Get dashboard summary

### Admin
- `GET /api/admin/settings` - Get admin settings
- `PUT /api/admin/settings` - Update admin settings
- `GET /api/admin/users` - Get all users
- `GET /api/admin/violations` - Get activity violations

### Webhooks
- `POST /api/webhook/github/push` - GitHub push webhook

## Technologies Used

- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **External APIs:** 
  - GitHub API v3 (repository & commit data)
  - Google Gemini AI (insights generation)
- **Security:** Helmet, CORS

## Core Features

### 1. Commit Time Tracking
- Tracks every commit with timestamp, author, and message
- Analyzes commit activity chronologically
- Calculates gaps between commits

### 2. Rule-Based Consistency Analysis
- **Long inactivity gaps** detection (e.g., more than 3-6 hours)
- **Burst commit** detection (multiple commits in short time)
- **Last-minute pattern** detection (commits near deadlines)
- Generates warnings and violations
- Calculates consistency score (0-100)

### 3. AI-Powered Insights (Google Gemini)
- Explains commit behavior in natural language
- Provides personalized improvement suggestions
- Converts raw statistics into meaningful feedback
- Example: *"You were inactive for long periods and pushed most commits near the end. Try committing smaller changes every 2-3 hours for better consistency."*

### 4. Consistency Metrics
- **Consistency Score:** Overall measure of development consistency
- **Longest Gap:** Maximum time between commits
- **Average Gap:** Mean time between commits
- **Burst Commits:** Number of commits in rapid succession
- **Last-Minute Commits:** Commits in final 20% of timeline
- **Distribution Analysis:** How commits are spread across timeline

## Development

```bash
# Run with hot reload
npm run dev

# Run tests
npm test
```

## Environment Setup

### Prerequisites
- Node.js >= 14.0
- MongoDB
- GitHub OAuth App

### GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Add `http://localhost:5000/api/github/callback` as the callback URL
4. Copy Client ID and Client Secret to `.env`

## Error Handling

All endpoints return standardized responses:

**Success Response:**
```json
{
  "status": "SUCCESS",
  "message": "Operation successful",
  "data": {},
  "timestamp": "2024-01-03T10:00:00.000Z"
}
```

**Error Response:**
```json
{
  "status": "ERROR",
  "message": "Error description",
  "data": null,
  "timestamp": "2024-01-03T10:00:00.000Z"
}
```

## Contributing

Please follow the project structure and naming conventions when adding new features.

## License

MIT
