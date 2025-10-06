# Google OAuth Setup Guide

## Issue: redirect_uri_mismatch Error 400

This error occurs when the redirect URI configured in Google Console doesn't match what NextAuth is trying to use.

## 🔧 Steps to Fix

### 1. Google Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID (or create one if missing)
5. In **Authorized redirect URIs**, add these URIs:

**For Development:**
```
http://localhost:3000/api/auth/callback/google
```

**For Production (replace with your domain):**
```
https://your-production-domain.com/api/auth/callback/google
```

### 2. Environment Variables

Make sure these environment variables are set:

**Development (.env.local):**
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
google_clientId=your-google-client-id
google_clientSecret=your-google-client-secret
```

**Production:**
```bash
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here
google_clientId=your-google-client-id
google_clientSecret=your-google-client-secret
```

### 3. NextAuth Configuration

The current configuration in `/api/auth/[...nextauth]/route.ts` is correct:

```typescript
GoogleProvider({
  clientId: process.env.google_clientId!,
  clientSecret: process.env.google_clientSecret!,
}),
```

## 🔐 Authentication Flow for Google OAuth Users

1. **User clicks "Continue with Google"**
2. **Google redirects to** `/api/auth/callback/google`
3. **NextAuth processes the callback** and creates a session
4. **User gets redirected to** `/auth/post-oauth`
5. **Post-OAuth handler**:
   - Gets the NextAuth session
   - Calls backend `/user/oauth` endpoint
   - Backend creates/finds user and generates JWT token
   - JWT token is set in cookies (httpOnly)
6. **User redirects to** `/rooms`
7. **Canvas page authentication**:
   - Checks for NextAuth session (OAuth users)
   - Also checks for JWT token in cookies (manual + OAuth users)
   - Connects to WebSocket with JWT token

## ✅ What's Fixed

1. **JWT Token Creation**: OAuth users now get JWT tokens for WebSocket authentication
2. **Dual Authentication**: Canvas page supports both OAuth sessions and JWT tokens
3. **Better Error Handling**: Post-OAuth page shows clear status messages
4. **Cookie Verification**: Logs confirm JWT tokens are properly set

## 🧪 Testing

1. **Manual Login**: Should work with JWT tokens
2. **Google OAuth**: Should create JWT tokens and work with WebSocket
3. **Canvas Page**: Should accept both authentication methods
4. **WebSocket**: Should authenticate with JWT tokens from both login methods

## 🚨 Common Issues

1. **CORS Issues**: Make sure `withCredentials: true` is set for backend calls
2. **Cookie Settings**: Ensure `sameSite` and `secure` settings match your environment
3. **Environment Variables**: Double-check all OAuth environment variables
4. **Redirect URI**: Must match exactly in Google Console (including protocol)

## 📝 Verification Checklist

- [ ] Google Console redirect URIs configured
- [ ] Environment variables set correctly
- [ ] OAuth flow creates JWT tokens
- [ ] Canvas page accepts OAuth users
- [ ] WebSocket authentication works for OAuth users
- [ ] Manual login still works