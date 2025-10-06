# 🔐 Complete Authentication Architecture Guide

## 📋 **Current Status: OPTIMIZED**

**✅ Single Authentication Method:** JWT Tokens  
**❌ Removed:** NextAuth `useSession` (unnecessary complexity)  
**✅ Supports:** Both Google OAuth AND Manual Login/Register  
**✅ Works with:** WebSocket server authentication  

---

## 🏗️ **Architecture Overview**

### **Single Source of Truth: JWT Tokens in Cookies**

Both authentication methods (OAuth and manual) result in the same outcome:
- JWT token stored in `httpOnly` cookies
- Token contains `{ email, userId }`  
- All protected routes check for this token
- WebSocket server authenticates using this token

---

## 🔄 **Authentication Flows**

### **1. Manual Login/Register Flow**

```
User Form → Backend API → JWT Token → Cookies → Protected Routes
```

**Step by step:**
1. User fills login/register form
2. Frontend calls `/user/signin` or `/user/signup` 
3. Backend validates credentials
4. Backend creates JWT token
5. Backend sets token in `httpOnly` cookie
6. User redirected to `/rooms`
7. All subsequent requests include token via cookies

### **2. Google OAuth Flow**

```
Google OAuth → NextAuth → Post-OAuth Handler → Backend API → JWT Token → Cookies → Protected Routes
```

**Step by step:**
1. User clicks "Continue with Google"
2. NextAuth handles Google OAuth flow
3. User redirected to `/auth/post-oauth`
4. Frontend gets NextAuth session (temporary)
5. Frontend calls `/user/oauth` with user info
6. Backend creates/finds user + creates JWT token
7. Backend sets token in `httpOnly` cookie
8. User redirected to `/rooms`
9. **NextAuth session is discarded** - only JWT token matters

---

## 🎯 **Key Insight: Why `useSession` is NOT Needed**

### **Before (Complex):**
```typescript
// ❌ Unnecessary complexity
const { data: session, status } = useSession();

// Check OAuth session OR JWT token
if (status === "authenticated" && session) {
  // OAuth user
} else if (getTokenFromCookies()) {
  // Manual user  
}
```

### **After (Simplified):**
```typescript
// ✅ Simple and unified
const token = getTokenFromCookies();
if (token) {
  // User is authenticated (OAuth OR manual)
}
```

**Why this works:**
- Both OAuth and manual login create JWT tokens
- JWT tokens contain all needed user info
- WebSocket server only understands JWT tokens
- No need to differentiate between auth methods

---

## 🚀 **Current Implementation**

### **Canvas Page Authentication** (`/canvas/[roomId]/page.tsx`)
```typescript
// ✅ Unified authentication check
const token = getTokenFromCookies();
if (token) {
  setAuthStatus("authenticated");
  // Connect to WebSocket with token
}
```

### **WebSocket Authentication** (`ws-backend`)
```typescript
// ✅ Expects JWT tokens only
const token = cookies.token || queryParams.token;
const userId = jwt.verify(token, JWT_SECRET);
```

### **Backend Authentication** (`/user/oauth` & `/user/signin`)
```typescript
// ✅ Both endpoints create identical JWT tokens
const token = jwt.sign({ email, userId }, JWT_SECRET);
res.cookie("token", token, { httpOnly: true });
```

---

## 🔧 **Files Modified**

### **Removed NextAuth Dependencies:**
- ❌ `import { useSession } from "next-auth/react"`
- ❌ Complex OAuth vs Manual logic
- ❌ Dual authentication state management

### **Simplified Components:**
- ✅ `/canvas/[roomId]/page.tsx` - Unified token-based auth
- ✅ `/auth/post-oauth/page.tsx` - Better error handling
- ✅ WebSocket connection - Token-only authentication

---

## 🧪 **Testing Scenarios**

### **✅ Manual Login**
1. User signs up/in with email/password
2. JWT token set in cookies
3. Can access `/rooms` and `/canvas/[roomId]`
4. WebSocket connects successfully

### **✅ Google OAuth**  
1. User clicks "Continue with Google"
2. OAuth flow → post-OAuth → JWT token set
3. Can access `/rooms` and `/canvas/[roomId]`
4. WebSocket connects successfully

### **✅ WebSocket Authentication**
1. Both manual and OAuth users have JWT tokens
2. Canvas page extracts token from cookies
3. WebSocket receives token via query param
4. WebSocket validates token and authorizes user

---

## 🎯 **Benefits of This Approach**

### **1. Simplified Code**
- Single authentication check
- No complex OAuth vs Manual logic
- Easier to maintain and debug

### **2. Better Performance**
- No unnecessary NextAuth session calls
- Faster authentication checks
- Reduced client-side complexity

### **3. Unified Security**
- Single JWT token standard
- Consistent across all endpoints
- WebSocket-compatible authentication

### **4. Better User Experience**
- Seamless transition between auth methods
- No authentication method confusion
- Consistent behavior regardless of login type

---

## 🚨 **Important Notes**

### **NextAuth is Still Used For:**
- ✅ Google OAuth flow handling (redirect, token exchange)
- ✅ `/auth/post-oauth` to get user info temporarily

### **NextAuth is NOT Used For:**
- ❌ Session management in protected routes
- ❌ Authentication state in canvas/rooms pages  
- ❌ WebSocket authentication
- ❌ API authentication

### **JWT Tokens Handle:**
- ✅ All authentication after initial OAuth/manual login
- ✅ WebSocket authentication  
- ✅ Protected route access
- ✅ API authorization

---

## 🔍 **Quick Verification**

To verify everything works:

1. **Manual Login Test:**
   ```bash
   # Check cookies after manual login
   document.cookie // Should contain 'token=...'
   ```

2. **OAuth Login Test:**
   ```bash  
   # Check cookies after Google OAuth
   document.cookie // Should contain 'token=...'
   ```

3. **WebSocket Test:**
   ```bash
   # Should connect successfully for both auth methods
   # Check browser network tab for WebSocket connection
   ```

**✨ Result: Simplified, unified, and more maintainable authentication system!**