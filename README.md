# CodePulse

## Overview

CodePulse is a GitHub-based monitoring system designed to ensure fair and continuous development during hackathons by tracking repository push activity in real time. It provides organizers and judges with a reliable, automated, and scalable mechanism to monitor development discipline without interfering with participants’ workflows.

## Architecture Statement

CodePulse relies on GitHub repositories as the single source of truth and uses GitHub Webhooks to capture server-side push events whenever a team pushes code.

- Each push event is securely received by a centralized backend service built using Node.js and Express, where commit metadata and push timestamps are extracted and processed.
- The backend stores all push-related data in a structured database, enabling the construction of a chronological development timeline for every participating team.
- A rule-based analysis engine evaluates the time gaps between consecutive pushes and verifies compliance with predefined hackathon rules, such as maximum allowed inactivity intervals and grace periods.
- Based on this analysis, the system determines the real-time compliance status of each team and identifies any violations related to irregular or delayed development activity.
- The processed results are exposed through secure APIs and visualized on an organizer-only dashboard that displays commit timelines, activity frequency, and compliance indicators.
- By using GitHub’s server-generated timestamps instead of local commit times or network conditions, the system guarantees fairness, transparency, and resistance to manipulation.

## Features

- Real-time monitoring of GitHub push events
- Rule-based compliance engine for hackathon activity
- Secure webhook handling and data storage
- Visual dashboard for organizers and judges
- Chronological team activity timelines
- Violation detection and reporting

## Project Structure


```
CodePulse/
├── client/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── StatCard.jsx
│       │   ├── TimelineChart.jsx
│       │   └── ViolationBadge.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useTeams.js
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── TeamDetails.jsx
│       │   └── Violations.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           ├── constants.js
│           └── formatTime.js
├── server/
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── db.js
│       │   └── github.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── team.controller.js
│       │   └── webhook.controller.js
│       ├── middlewares/
│       │   ├── authMiddleware.js
│       │   └── verifyWebhook.js
│       ├── models/
│       │   ├── PushEvent.js
│       │   ├── Team.js
│       │   └── Violation.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── team.routes.js
│       │   └── webhook.routes.js
│       ├── services/
│       │   ├── githubService.js
│       │   ├── ruleEngine.js
│       │   └── timelineService.js
│       └── utils/
│           └── logger.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- GitHub account and repository admin access (for webhook setup)

### Backend Setup
1. Navigate to the `server` directory:
   ```sh
   cd server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables as needed (see `server/README.md`).
4. Start the backend server:
   ```sh
   npm start
   ```

### Frontend Setup
1. Navigate to the `client` directory:
   ```sh
   cd client
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```

### Webhook Configuration
- Set up a GitHub webhook on each participating repository to POST push events to your backend’s `/api/webhook` endpoint.
- See `server/README.md` for detailed instructions.

## Usage
- Organizers log in to the dashboard to view team activity, timelines, and compliance status.
- Violations and inactivity are flagged automatically based on configured rules.

## License
[MIT](LICENSE)

## Contact
For questions or support, please contact the project maintainer.
