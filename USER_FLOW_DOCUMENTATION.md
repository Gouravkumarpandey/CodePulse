# CodePulse User Flow - Complete Implementation

## Overview
This document outlines the complete user flow for CodePulse, from initial signup to the participant dashboard.

## User Flow Diagram

```
┌─────────────────┐
│   Home Page     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Login / Sign Up │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Connect GitHub  │ ← New page with trust-building elements
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Repo     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │
└─────────────────┘
```

## Detailed Flow

### 1. Home Page (`/`)
- Landing page with project information
- "Login" and "Sign Up" buttons

### 2. Login / Sign Up (`/login` or `/signup`)
**After successful authentication:**
- **First-time users** (no GitHub token) → Redirect to `/connect-github`
- **Returning users** (GitHub token exists) → Redirect to `/user` (dashboard)
- **Admin users** → Redirect to `/admin`

### 3. Connect GitHub Page (`/connect-github`) - NEW
**Purpose:** Build trust and explain GitHub OAuth

**Features:**
- Big "Connect GitHub" button
- GitHub logo
- Trust badges explaining:
  - ✓ Read-only access
  - ✓ Secure OAuth
  - ✓ Privacy first
- What we track:
  - Commit timestamps
  - Code additions/deletions
  - Commit messages
  - Repository metrics
- "Skip for now" option (goes to dashboard without repo)

**What Happens:**
- User clicks → GitHub OAuth popup
- Returns with token → Stored in sessionStorage
- Redirects to `/repo-selection`

### 4. Repository Selection Page (`/repo-selection`)
**Features:**
- List of user's GitHub repositories
- Search bar
- "Connect" button for each repo
- Shows which repos are already active

**What Happens:**
- User selects a repository
- System sets up webhooks automatically
- Redirects to `/user` (dashboard)

### 5. Participant Dashboard (`/user`) - REDESIGNED
**Goal:** User understands their status in 5-8 seconds

**Layout Components:**

#### A. Top Header
- Project logo (CodePulse)
- Repository dropdown with:
  - Current repo name
  - List of all repos
  - "Add Repository" button
  - "Manage Repositories" button
- Profile icon

#### B. Activity Status Card (MOST PROMINENT)
- Large colored card showing:
  - **Active** (green) - Last commit < 24 hours
  - **At Risk** (yellow) - Last commit 24-72 hours
  - **Inactive** (red) - Last commit > 72 hours
- Last commit time
- One-line status message

#### C. Consistency Score
- Circular progress indicator
- Score out of 100
- Label: Excellent / Good / Average / Low
- Color-coded badge

#### D. Last Commit Details
- Time ago
- Commit message
- Commit SHA
- Repository name

#### E. Quick Stats
- Total commits
- Average gap (hours)
- Burst commits

#### F. Commit Timeline Graph
- Last 7 days
- Visual line chart
- Shows commit gaps

#### G. Alerts / Warnings
- System notices:
  - "No commit today"
  - "Burst commits detected"
  - "Only README edits"
- Max 1-2 lines

#### H. Quick Tips Panel
- "Commit small changes frequently"
- "Avoid last-minute push"
- "Write meaningful commit messages"

#### I. Team Contribution (Optional - Commented Out)
- Your % contribution
- Team average
- Most active member

## How Users Change/Select Repository

### From Dashboard Header
1. Click repository dropdown (top-right)
2. See list of all connected repos
3. Click to switch
4. Or click "Add Repository" to connect new one
5. Or click "Manage Repositories" for settings

### From Settings Page
- Dashboard → Settings → "Connected Repositories"
- Add new repo
- Remove old repo
- Switch active repo

## Technical Implementation

### Session Storage Keys
- `token` - JWT authentication token
- `user` - User object
- `github_token` - GitHub OAuth access token
- `github_authenticated` - Flag for successful GitHub connection

### Routes
- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/connect-github` - GitHub connection page (NEW)
- `/github/callback` - GitHub OAuth callback
- `/repo-selection` - Repository selection
- `/user` - Participant dashboard
- `/user/activity` - Detailed activity page
- `/user/settings` - User settings

### Flow Logic

**Login/Signup:**
```typescript
if (user.role === 'ADMIN') {
  navigate('/admin');
} else {
  const githubToken = sessionStorage.getItem('github_token');
  if (!githubToken) {
    navigate('/connect-github'); // First time
  } else {
    navigate('/user'); // Returning user
  }
}
```

**Connect GitHub:**
```typescript
// Check if already connected
const githubToken = sessionStorage.getItem('github_token');
if (githubToken) {
  navigate('/repo-selection'); // Already connected
}
```

**Repository Selection:**
```typescript
// After selecting repo
sessionStorage.setItem('showDashboardToast', '1');
navigate('/user');
```

## UX Best Practices

### First-Time User
1. Force GitHub connect
2. Force repo selection
3. Show onboarding tooltips on dashboard

### Returning User
1. Auto-login
2. Direct to dashboard
3. Show last selected repo

### Repository Management
- Easy switching via dropdown
- Clear "Add Repository" flow
- Settings page for advanced control

## Design Principles

### Trust Building (Connect GitHub Page)
- Clear explanation of permissions
- Visual trust badges
- Transparent about what we track
- Industry-standard OAuth messaging

### Dashboard Design
- **5-8 second comprehension** - User should understand status immediately
- **Status-first** - Activity status is the most prominent element
- **Visual hierarchy** - Important info is larger and higher
- **Color coding** - Green (good), Yellow (warning), Red (danger)
- **Actionable** - Clear next steps and tips

### Responsive Design
- Mobile-friendly layouts
- Touch-friendly buttons
- Readable on all screen sizes

## Files Modified/Created

### New Files
- `Frontend/src/pages/ConnectGitHubPage.tsx` - GitHub connection page

### Modified Files
- `Frontend/src/App.tsx` - Added route for `/connect-github`
- `Frontend/src/pages/LoginPage.tsx` - Updated redirect logic
- `Frontend/src/pages/SignupPage.tsx` - Updated redirect logic
- `Frontend/src/pages/UserDashboardPage.tsx` - Complete redesign

## Next Steps

1. Test the complete flow end-to-end
2. Add analytics tracking for each step
3. Implement onboarding tooltips
4. Add team features (commented out in dashboard)
5. Create admin flow for managing participants
6. Add email notifications for status changes

## Notes

- GitHub token is stored in sessionStorage (per-tab, not persistent)
- User must be logged in before connecting GitHub
- Repository selection is required before accessing dashboard
- Dashboard shows placeholder when no repo is connected
- Users can skip GitHub connection but won't see data
