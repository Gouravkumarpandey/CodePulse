# Troubleshooting Guide - CORS and OAuth Issues

## Issues Fixed

### 1. ✅ CORS Error (FIXED)
**Problem:** Frontend running on port 5174 but backend only allowed port 5173

**Solution:** Updated `Backend/src/app.js` to allow both ports:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);
```

**Action Required:** Restart the backend server
```bash
# Stop the current backend server (Ctrl+C)
# Then restart it
cd "c:\Personal Project\CodePulse\Backend"
npm run dev
```

### 2. ⚠️ Google OAuth Error
**Problem:** "The given origin is not allowed for the given client ID"

**Root Cause:** Google OAuth is configured for `http://localhost:5173` but frontend is on `5174`

**Solutions:**

#### Option A: Use Port 5173 (Recommended)
Stop the current frontend server and restart on port 5173:
```bash
# In Frontend terminal, stop current server (Ctrl+C)
# Then restart
npm run dev
```

#### Option B: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:5174`
6. Under "Authorized redirect URIs", add:
   - `http://localhost:5174/auth/google/callback`
7. Save changes

### 3. ℹ️ MetaMask Error (Can be Ignored)
**Problem:** "Failed to connect to MetaMask"

**Explanation:** This error is not relevant to CodePulse. It appears to be from a browser extension or cached code. You can safely ignore it.

## Current Configuration

### Backend (.env)
- PORT: 5000
- CORS: Allows localhost:5173 and localhost:5174
- Google Client ID: `212353601504-ltpv0mfknp7eh27occgo27pnk3ft3orf.apps.googleusercontent.com`

### Frontend (.env)
- API URL: http://localhost:5000/api
- GitHub Client ID: `Ov23li4CIJ8ocjZkYyFd`
- Google Client ID: `212353601504-ltpv0mfknp7eh27occgo27pnk3ft3orf.apps.googleusercontent.com`

## Quick Fix Steps

1. **Restart Backend** (to apply CORS fix):
   ```bash
   # Stop current backend (Ctrl+C in backend terminal)
   cd "c:\Personal Project\CodePulse\Backend"
   npm run dev
   ```

2. **Stop Extra Frontend Instances**:
   - You have 2 frontend servers running
   - Keep only one on port 5173
   - Stop the others with Ctrl+C

3. **Clear Browser Cache**:
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Reload the page

4. **Test the Flow**:
   - Go to http://localhost:5173
   - Try signing up with email
   - Should now work without CORS errors

## Verification

After restarting, verify:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173 (only one instance)
- ✅ No CORS errors in console
- ✅ Signup/Login works

## Notes

- The CORS fix allows both 5173 and 5174, so either port will work
- For Google OAuth to work on 5174, you need to update Google Cloud Console
- It's recommended to standardize on port 5173 for consistency
