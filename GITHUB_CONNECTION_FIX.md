# GitHub Connection Persistence Fix

## Problem
Users had to reconnect their GitHub account every time they logged in, even though they had already connected it previously. This was happening because:

1. **Backend was not returning `githubAccessToken` on login** - The login endpoint only returned user data without the GitHub access token
2. **Frontend was not storing the token** - Even when the token was available, it wasn't being stored in sessionStorage
3. **User profile endpoint removed the token** - The `getUserProfile` endpoint explicitly deleted the `githubAccessToken` before returning user data (for security)

## Solution

### Backend Changes

#### 1. Updated `auth.controller.js` - Login Endpoint
**File**: `Backend/src/controllers/auth.controller.js`

Modified the `login` function to include `githubAccessToken` in the response if the user has GitHub connected:

```javascript
// Include githubAccessToken in response if user has GitHub connected
const responseData = { user: userResponse, token };
if (user.githubAccessToken) {
  responseData.githubAccessToken = user.githubAccessToken;
}

response.success(res, responseData, 'Login successful');
```

#### 2. Updated `auth.controller.js` - Google OAuth Callback
**File**: `Backend/src/controllers/auth.controller.js`

Modified the `googleCallback` function to also include `githubAccessToken`:

```javascript
// Include githubAccessToken in response if user has GitHub connected
const responseData = {
  status: 'SUCCESS',
  user: userResponseData,
  token
};
if (user.githubAccessToken) {
  responseData.githubAccessToken = user.githubAccessToken;
}
```

### Frontend Changes

#### 1. Updated `LoginPage.tsx` - Email/Password Login
**File**: `Frontend/src/pages/LoginPage.tsx`

Modified the `handleEmailLogin` function to store the GitHub token when returned:

```typescript
// Store GitHub token if user has it connected
if (response.githubAccessToken) {
  sessionStorage.setItem('github_token', response.githubAccessToken);
  console.log('GitHub token restored from login');
}

// Check if user has GitHub connected
const githubToken = response.githubAccessToken || sessionStorage.getItem('github_token');
if (!githubToken) {
  navigate('/connect-github');
} else {
  navigate('/user');
}
```

#### 2. Updated `LoginPage.tsx` - Google Login
**File**: `Frontend/src/pages/LoginPage.tsx`

Modified the `handleGoogleLoginSuccess` function similarly:

```typescript
// Store GitHub token if user has it connected
if (data.data.githubAccessToken) {
  sessionStorage.setItem('github_token', data.data.githubAccessToken);
  console.log('GitHub token restored from Google login');
}

// Check if user has GitHub connected
const githubToken = data.data.githubAccessToken || sessionStorage.getItem('github_token');
```

## How It Works Now

### First Time User Flow
1. User signs up with email/password or Google
2. User is redirected to `/connect-github` page
3. User connects their GitHub account
4. `githubAccessToken` is saved to:
   - Firestore database (in user document)
   - sessionStorage (for current session)
5. User is redirected to `/user` dashboard

### Returning User Flow
1. User logs in with email/password or Google
2. Backend retrieves user from Firestore (which includes `githubAccessToken`)
3. Backend returns `githubAccessToken` in the login response
4. Frontend stores `githubAccessToken` in sessionStorage
5. User is redirected directly to `/user` dashboard (skipping `/connect-github`)

## Security Considerations

- The `githubAccessToken` is only returned during authentication (login/signup)
- The `getUserProfile` endpoint still removes the token for security (line 29 in `user.controller.js`)
- The token is stored in sessionStorage (cleared when browser is closed)
- The token is never exposed in URLs or logs (except for debugging console.log statements)

## Testing

To verify the fix works:

1. **New User Test**:
   - Sign up with a new email
   - Connect GitHub account
   - Logout
   - Login again with the same email
   - ✅ Should go directly to dashboard without reconnecting GitHub

2. **Existing User Test**:
   - Login with an account that has GitHub connected
   - ✅ Should go directly to dashboard
   - Check browser console for "GitHub token restored from login"

3. **User Without GitHub Test**:
   - Login with an account that has NOT connected GitHub
   - ✅ Should be redirected to `/connect-github` page

## Files Modified

### Backend
- `Backend/src/controllers/auth.controller.js` (2 changes)

### Frontend
- `Frontend/src/pages/LoginPage.tsx` (2 changes)

## Related Files (No Changes Needed)

- `Backend/src/controllers/user.controller.js` - Still removes token from profile endpoint (security)
- `Backend/src/controllers/github.controller.js` - Already saves token to database
- `Frontend/src/pages/ConnectGitHubPage.tsx` - Already checks for existing token
- `Frontend/src/pages/GitHubCallbackPage.tsx` - Already saves token to sessionStorage
