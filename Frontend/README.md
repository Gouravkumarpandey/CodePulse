# CodePulse Frontend

A React + TypeScript + Vite application for monitoring GitHub commit activity with role-based dashboards.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Custom components with Tailwind
- **Animations**: Framer Motion

## Project Structure

```
src/
├── App.tsx                    # Main app with routing
├── main.tsx                   # App entry point
├── index.css                  # Global styles
│
├── pages/                     # Page components
│   ├── HomePage.tsx          # Landing page
│   ├── LoginPage.tsx         # Login page
│   ├── SignupPage.tsx        # Signup page
│   ├── GitHubCallbackPage.tsx # OAuth callback
│   ├── RepositorySelectionPage.tsx
│   │
│   ├── UserDashboardPage.tsx  # User dashboard
│   ├── UserActivityPage.tsx   # Commit timeline
│   ├── UserWarningsPage.tsx   # Warnings & violations
│   ├── UserSettingsPage.tsx   # Repository settings
│   │
│   ├── AdminDashboardPage.tsx # Admin dashboard
│   ├── AdminUsersPage.tsx     # User management
│   ├── AdminUserDetailPage.tsx # User detail view
│   └── AdminSettingsPage.tsx  # Global rules
│
├── components/                # Reusable components
│   ├── common/               # Common UI components
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Loader.tsx
│   │
│   ├── layout/               # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   │
│   ├── user/                 # User-specific components
│   │   ├── RepoCard.tsx
│   │   ├── CommitTimeline.tsx
│   │   ├── StatusBanner.tsx
│   │   └── WarningList.tsx
│   │
│   └── admin/                # Admin-specific components
│       ├── UsersTable.tsx
│       ├── UserDetail.tsx
│       └── RulesForm.tsx
│
├── context/                  # React Context
│   └── AuthContext.tsx       # Authentication context
│
├── hooks/                    # Custom hooks
│   └── useAuth.ts           # Authentication hook
│
├── services/                 # API services
│   └── api.ts               # Axios API client
│
├── types/                    # TypeScript definitions
│   ├── user.ts
│   ├── commit.ts
│   ├── repository.ts
│   └── rule.ts
│
└── utils/                    # Utilities
    ├── formatTime.ts        # Time formatting
    ├── statusColor.ts       # Status helpers
    ├── constants.ts         # App constants
    └── github-auth.ts       # GitHub OAuth helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

### Development

```bash
# Run development server with hot reload
npm run dev

# Type checking
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit [http://localhost:5173](http://localhost:5173)

## Features

### User Dashboard
- ✅ Overview with commit statistics
- ✅ Commit activity timeline
- ✅ Warnings and violations tracking
- ✅ Repository connection management
- ✅ Real-time status banner

### Admin Dashboard
- ✅ System-wide analytics
- ✅ User management
- ✅ Individual user activity viewing
- ✅ Global rule configuration
- ✅ Violation monitoring

### Authentication
- GitHub OAuth integration
- JWT token management
- Role-based access control (USER/ADMIN)
- Protected routes with redirects

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in `src/services/api.ts` with automatic token injection and error handling.

### Example API Usage

```typescript
import { api } from '@/services/api';

// Fetch user dashboard
const response = await api.get('/user/dashboard');

// Update admin settings
await api.put('/admin/settings', settings);
```

## Component Usage

### Button

```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

### Badge

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Violation</Badge>
```

### Modal

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Title">
  <p>Modal content</p>
</Modal>
```

## Routing

- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/auth/callback` - GitHub OAuth callback
- `/repo-selection` - Repository selection
- `/user` - User dashboard (protected)
- `/user/activity` - Commit timeline (protected)
- `/user/warnings` - Warnings list (protected)
- `/user/settings` - Repository settings (protected)
- `/admin` - Admin dashboard (admin only)
- `/admin/users` - User management (admin only)
- `/admin/users/:id` - User detail (admin only)
- `/admin/settings` - Global settings (admin only)

## Authentication Flow

1. User clicks "Sign in with GitHub"
2. Redirects to GitHub OAuth
3. GitHub redirects back to `/auth/callback`
4. Backend exchanges code for token
5. Frontend stores token and user in localStorage
6. User redirected to appropriate dashboard based on role

## Path Aliases

The project uses the `@/` alias for cleaner imports:

```typescript
import { api } from '@/services/api';
import Button from '@/components/common/Button';
```

This is configured in both `vite.config.ts` and `tsconfig.app.json`.

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory, ready to be deployed to any static hosting service.

## License

MIT
