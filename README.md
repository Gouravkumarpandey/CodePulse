<img width="1908" height="905" alt="image" src="https://github.com/user-attachments/assets/a10d942d-9248-4e4a-a27a-8e88e3bfb2ac" />


# CodePulse - GitHub Commit Consistency & Insight Platform

![CodePulse Banner](https://img.shields.io/badge/CodePulse-Commit%20Consistency-blue?style=for-the-badge&logo=github)

> **Measure how you work, not just how much you work**

CodePulse is a web-based platform that analyzes GitHub commit activity to measure development consistency. It combines rule-based time analysis with Google AI insights to provide meaningful feedback on work behavior, encouraging developers to make small, frequent commits instead of large, last-minute pushes.

---

## 🎯 Problem Statement

In hackathons, academic projects, and collaborative development:
- ❌ Hard to verify if developers worked consistently over time
- ❌ Difficult to detect last-minute bulk commits
- ❌ Traditional GitHub stats show *what* was done, not *how* it was done
- ❌ No clear insight into work behavior patterns

## 💡 Solution

CodePulse provides:
- ✅ Real-time commit activity tracking
- ✅ Inactivity gap detection
- ✅ Last-minute rush pattern identification
- ✅ AI-powered human-readable insights
- ✅ Consistency scoring and grading
- ✅ Actionable improvement suggestions

---

## 🌟 Core Features

### 1. **GitHub Authentication**
- Secure OAuth integration
- Repository access with user permission
- Single-user focused model

### 2. **Repository Selection & Tracking**
- Search and select repositories
- Automatic metadata fetching
- Commit history analysis

### 3. **Commit Time Tracking**
- **Timestamp tracking** for every commit
- **Author and committer** information
- **Commit message** analysis
- **Chronological activity** monitoring

### 4. **Rule-Based Consistency Analysis**

The system applies logical rules to detect:

| Rule | Threshold | Result |
|------|-----------|--------|
| Long inactivity gaps | > 3-6 hours | Warning |
| Very long gaps | > 24-72 hours | Violation |
| Burst commits | Multiple in < 1 hour | Detected |
| Last-minute pattern | > 50% in final 20% | Flagged |

**Generates:**
- ⚠️ Warnings
- 🚫 Violations  
- 📊 Consistency Score (0-100)
- 📈 Grade (A, B, C, D, F)

### 5. **AI-Powered Insights** 🤖

Using **Google Gemini AI** to:
- Explain commit behavior in natural language
- Provide personalized suggestions
- Convert statistics into meaningful feedback

**Example Insight:**
> "You were inactive for long periods and pushed most commits near the end. Try committing smaller changes every 2-3 hours for better consistency."

### 6. **Developer Dashboard**
Visual analytics including:
- 📅 Commit timeline visualization
- ⏱️ Time gap highlights
- ⚡ Burst pattern detection
- 🎯 Consistency score & grade
- 🤖 AI-generated insights
- 📊 Distribution charts

### 7. **AI Chat Assistant (Sidebar Panel)** 🤖
- Accessible from any dashboard view
- Backed by Anthropic Claude configurations via OpenRouter
- Quick reference setup regarding **Admin Rules Guidelines**
- Guided walkthroughs for resolving Git/Merge Conflict scenarios
- Analytical breakdowns for problematic design statements responsibly!

---

## 🏗️ System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │◄────────┤    Backend   │────────►│   MongoDB   │
│ React + TS  │         │  Express.js  │         │   Database  │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │
       │                        ▼
       │                ┌──────────────┐
       │                │  GitHub API  │
       │                └──────────────┘
       │                        │
       │                        ▼
       │                ┌──────────────┐
       └───────────────►│  Gemini AI   │
                        └──────────────┘
```

---

## 🔄 System Flow

1. **User logs in** using GitHub OAuth
2. **User selects** a repository to monitor
3. **CodePulse fetches** commit data from GitHub API
4. **Commit timestamps** are analyzed using rule engine
5. **Consistency metrics** are calculated
6. **Google AI** converts statistics into insights
7. **Results displayed** on interactive dashboard

---

## 👥 Roles & Governance

| Role | Responsibility & Features |
|------|---------------------------|
| **🧑‍💻 Developer (User)** | Connect GitHub repositories, track real-time score parameters, leverage visual chart overviews, access **AI Sidebar Panel** node support frameworks, use personalized avatar sets with background customizations. |
| **🛡️ Administrator (Admin)** | Define Hackathon global rules (inactivity hours thresholds, scoring equations multipliers), evaluate global streams dashboard, manage rule-based setups node triggers securely. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Charts:** Recharts
- **State:** Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + GitHub OAuth
- **AI:** Google Gemini API

### APIs & Services
- GitHub REST API v3
- Google Generative AI (Gemini)

---

## 📦 Project Structure

```
CodePulse/
├── Backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── gemini.js   # Google AI setup
│   │   │   └── github.js   # GitHub OAuth
│   │   ├── models/         # Database models
│   │   │   ├── Commit.js
│   │   │   ├── Repo.js
│   │   │   └── RepoAnalysis.js
│   │   ├── services/
│   │   │   ├── ai.service.js           # AI insights
│   │   │   ├── consistency.service.js  # Scoring
│   │   │   ├── ruleEngine.service.js   # Rules
│   │   │   └── github.service.js       # GitHub API
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── user/
    │   │   │   ├── AIInsights.tsx
    │   │   │   ├── ConsistencyMetrics.tsx
    │   │   │   └── DistributionChart.tsx
    │   │   └── common/
    │   ├── pages/
    │   │   ├── UserDashboardPage.tsx
    │   │   └── UserActivityPage.tsx
    │   ├── services/
    │   └── types/
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 14.0
- MongoDB
- GitHub OAuth App
- Google Gemini API Key

### Backend Setup

```bash
cd Backend
npm install

# Configure .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/codepulse
JWT_SECRET=your_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_AI_API_KEY=your_gemini_api_key
EOF

# Start server
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

### Get API Keys

**GitHub OAuth:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Callback URL: `http://localhost:5000/api/github/callback`

**Google Gemini AI:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to backend `.env`

---

## 📊 Key Metrics Explained

### Consistency Score (0-100)

Calculated based on:
- **Gap Penalty:** Long inactivity periods reduce score
- **Burst Penalty:** Too many rapid commits reduce score
- **Distribution Penalty:** Uneven timeline distribution
- **Last-Minute Penalty:** Heavy end-loading reduces score

### Grading Scale

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A | Excellent consistency |
| 80-89 | B | Good habits |
| 70-79 | C | Room for improvement |
| 60-69 | D | Needs attention |
| 0-59 | F | Poor consistency |

---

## 🎯 Uniqueness of CodePulse

1. **Behavioral Focus:** Analyzes *how* work is done, not just *how much*
2. **Ethical Development:** Encourages consistent, sustainable coding practices
3. **Lightweight AI:** Uses AI for explanation, not over-engineering
4. **Simple Model:** Single-user focus makes it easy to build and scale
5. **Fair Evaluation:** Suitable for hackathons, academics, and self-analysis

---

## 🔮 Future Enhancements

- [ ] Pull request and merge analysis
- [ ] Weekly AI-generated progress summaries
- [ ] Integration with Slack/Discord
- [ ] Mobile application
- [ ] Chrome extension for quick insights

---

## 📸 Screenshots

*(Add screenshots of your dashboard, insights, and analytics here)*

---

## 🤝 Contributing

Contributions are welcome! Please follow the project structure and coding conventions.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 👥 Authors

**Team CodePulse**

---

## 🙏 Acknowledgments

- GitHub API for repository data
- Google Gemini AI for insights generation
- Open source community for amazing tools

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review FAQ section

---

**Built with vision for better development practices**

*Encouraging consistent, sustainable coding habits one commit at a time.*
