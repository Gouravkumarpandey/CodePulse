# Clerk Authentication Backend Integration

## Overview
Your frontend now uses Clerk authentication. After a user signs in/up with Clerk, the frontend automatically:
1. Gets a Clerk token
2. Calls your backend's `/auth/clerk` endpoint
3. Backend verifies the user with Clerk and creates/updates them in the database
4. Backend returns user role and GitHub connection status
5. Frontend redirects based on role and GitHub status

## Required Backend Implementation

### 1. POST `/auth/clerk` Endpoint

Add this endpoint to your backend to handle Clerk authentication:

```javascript
// Backend Route Handler (Express example)
router.post('/clerk', async (req, res) => {
  try {
    const { clerkId, email, username, avatar, clerkToken } = req.body;

    // Verify Clerk token with Clerk API (optional but recommended)
    // Requires CLERK_SECRET_KEY environment variable
    
    // Find or create user in database
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Assign admin role if email matches
      const isAdmin = email === 'kumarpandeygourav@gmail.com';
      
      user = new User({
        clerkId,
        email,
        username,
        avatar,
        role: isAdmin ? 'ADMIN' : 'USER',
      });
      await user.save();
    } else {
      // Update existing user
      user.email = email;
      user.username = username;
      user.avatar = avatar;
      await user.save();
    }

    // Generate JWT token for your app
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get user's GitHub token if connected
    const githubAccessToken = user.githubAccessToken || null;

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          githubId: user.githubId,
          githubAccessToken: user.githubAccessToken,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        githubAccessToken,
      },
    });
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(400).json({
      success: false,
      message: 'Clerk authentication failed',
    });
  }
});
```

### 2. Update User Model

Ensure your User model includes the `clerkId` field:

```javascript
const userSchema = new Schema({
  clerkId: { type: String, unique: true, sparse: true }, // Add this
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  avatar: String,
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  githubId: String,
  githubAccessToken: String,
  // ... other fields
});
```

### 3. Environment Variables

You may need to add Clerk keys to your backend if verifying tokens:

```env
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Authentication Flow

```
User Signs In/Up via Clerk Modal
   ↓
AuthContext detects clerkUser
   ↓
Calls authService.clerkAuth({...})
   ↓
POST /auth/clerk request
   ↓
Backend creates/updates user and returns role + GitHub status
   ↓
Frontend stores user data and token
   ↓
Frontend redirects:
  - ADMIN → /admin
  - USER with GitHub → /user
  - USER without GitHub → /connect-github
```

## Testing the Integration

1. Open `http://localhost:5174` in your browser
2. Click "Log in" or "Get Started" in the navbar
3. Complete Clerk sign-up/sign-in
4. Check browser console for any errors
5. Verify redirect to correct page

## Notes

- The frontend continues to work even without the backend endpoint (user data will be incomplete)
- Always include `clerkId` in your User model going forward
- The `/auth/clerk` endpoint should be the primary auth method now
- Remove old Google OAuth and custom email/password routes from your API if no longer needed
