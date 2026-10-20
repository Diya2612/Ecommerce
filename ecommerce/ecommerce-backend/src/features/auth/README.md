# Auth Feature - Supabase Authentication

## Overview

The Auth feature integrates with **Supabase Auth** for user authentication. Authentication (sign up, sign in, sign out) is handled by the **frontend** using the Supabase client library. The backend provides token verification, password reset, and user sync functionality.

## Architecture

- **Frontend Responsibility**: All user authentication flows using `@supabase/supabase-js`
- **Backend Responsibility**: Token verification, password reset endpoints, user sync via middleware

## Structure

```
auth/
├── index.ts                      # Feature exports and routes
├── apis/                         # HTTP endpoints
│   ├── refresh-token.ts          # External Auth token refresh
│   ├── request-password-reset.ts # Send reset email
│   ├── reset-password.ts         # Finalize reset with token
│   └── sync-user.ts              # Sync Supabase profiles
├── services/                     # Business logic
│   ├── auth.service.ts           # Route handlers logic
│   └── supabase-auth.service.ts  # Supabase admin client utils
└── shared/                       # Shared resources
    ├── interface.ts              # TypeScript interfaces
    ├── queries.ts                # Database query logic
    └── validation.ts             # Zod validation schemas
```

## Base URL

```
/api/auth
```

## Authentication Requirements

| Endpoint                       | Authentication | Description                  |
| ------------------------------ | -------------- | ---------------------------- |
| `POST /request-password-reset` | ❌ Public      | Request password reset email |
| `POST /reset-password`         | ❌ Public      | Reset password with token    |
| `POST /refresh-token`          | ❌ Public      | Refresh access token         |

---

## Frontend Authentication Guide

### Installation

```bash
npm install @supabase/supabase-js
```

### Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### User Registration

```typescript
import { supabase } from '@/lib/supabase';

async function handleRegister(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name, // User metadata
      },
    },
  });

  if (error) {
    console.error('Registration error:', error.message);
    return;
  }

  // Store token for backend API calls
  if (data.session) {
    localStorage.setItem('access_token', data.session.access_token);
  }
}
```

### User Login

```typescript
import { supabase } from '@/lib/supabase';

async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return;
  }

  // Store token for backend API calls
  if (data.session) {
    localStorage.setItem('access_token', data.session.access_token);
  }
}
```

### User Logout

```typescript
import { supabase } from '@/lib/supabase';

async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error.message);
    return;
  }

  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
```

### Making Authenticated API Calls

```typescript
import { supabase } from '@/lib/supabase';

async function callBackendAPI(endpoint: string, method: string = 'GET', body?: any) {
  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.json();
}
```

---

## Backend Endpoints

The backend does not handle login or registration directly (the frontend libraries handle that). Instead, it exposes endpoints for token verification (syncing), refreshing, and password resets.

### 1. Sync User

Syncs a Supabase Auth user to the `public.users` table so they can interact with the backend Database. Triggered automatically on the first authenticated request.

**Endpoint:** `POST /api/auth/sync-user`

**Authentication:** ✅ Required (Bearer Token)

#### Request Body
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890"  // Optional
}
```

#### Success Response (201 Created / 200 OK)

```json
{
  "success": true,
  "message": "New user created", // Or "User already exists", "Linked existing user"
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "synced": true,
    "message": "New user created"
  }
}
```

---

### 2. Request Password Reset

Request a password reset email via Supabase Auth.

**Endpoint:** `POST /api/auth/password-reset/request`

**Authentication:** ❌ Public

#### Request Body

```json
{
  "email": "john.doe@example.com"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent",
  "data": {
    "message": "If the email exists, a password reset link has been sent"
  }
}
```

---

### 3. Confirm Password Reset

Reset password using the secure token provided in the recovery email.

**Endpoint:** `POST /api/auth/password-reset/confirm`

**Authentication:** ❌ Public (token validates request)

#### Request Body

```json
{
  "access_token": "secure_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

### 4. Refresh Token

Exchanges a valid refresh token for a new access token via Supabase Auth.

**Endpoint:** `POST /api/auth/refresh-token`

**Authentication:** ❌ Public (Rate Limited)

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "auth_id": "supabase-uuid",
      "first_name": "John",
      "middle_name": null,
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone_number": "+1234567890",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

#### Common Error Responses (All Endpoints)

| Status | Error            | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| `400`  | Validation Error | Invalid request schema or missing fields     |
| `401`  | Unauthorized     | Invalid/expired refresh token or access token|
| `429`  | Too Many Req.    | Auth rate limit exceeded                     |
| `500`  | Server Error     | Backend sync fail or Supabase service error  |

---

## How Backend Syncs Users

When a user signs up via the frontend, their first authenticated API request triggers the auth middleware, which:

1. Verifies the Supabase JWT token
2. Checks if user exists in `public.users` table
3. If not, creates a new record with auth_id
4. Assigns default 'user' role via RBAC
5. Allows the request to proceed

This approach eliminates the need for webhooks while ensuring all authenticated users are synced.

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                  SUPABASE AUTH FLOW                                  │
└─────────────────────────────────────────────────────────────────────┘

1. REGISTRATION / LOGIN (Frontend)
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │  Frontend   │ ──────▶ │  Supabase   │ ──────▶ │   Frontend  │
   │  signUp()   │         │   Auth      │  JWT    │   Receives  │
   │  signIn()   │         │   Service   │  Token  │   Token     │
   └─────────────┘         └─────────────┘         └──────┬──────┘
                                                           │
2. STORE TOKEN                                             ▼
                                                   ┌─────────────┐
   Store in localStorage                           │  Frontend   │
                                                   │   Stores    │
                                                   │   Token     │
                                                   └──────┬──────┘
                                                          │
3. FIRST API REQUEST                                      ▼
   ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
   │  Frontend   │ ───────▶│   Backend   │        │   Backend   │
   │  API Call   │ Bearer  │   Verifies  │ ─────▶ │   Syncs     │
   │  + Token    │ Token   │   Token     │        │   User      │
   └─────────────┘         └──────┬──────┘        └──────┬──────┘
                                  │                      │
                                  ▼                      ▼
                          ┌─────────────┐        ┌─────────────┐
                          │  Supabase   │        │  public.    │
                          │   Verifies  │        │  users      │
                          │   JWT       │        │  Table      │
                          └─────────────┘        └─────────────┘

4. SUBSEQUENT REQUESTS
   ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
   │  Frontend   │ ───────▶│   Backend   │        │   API       │
   │  API Call   │ Bearer  │   Verifies  │ ─────▶ │   Response  │
   │  + Token    │ Token   │   Token     │        │             │
   └─────────────┘         └─────────────┘        └─────────────┘

5. LOGOUT (Frontend)
   ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
   │  Frontend   │ ───────▶│  Supabase   │        │   Token     │
   │  signOut()  │         │   Auth      │ ─────▶ │   Removed   │
   │             │         │   Service   │        │   Locally   │
   └─────────────┘         └─────────────┘        └─────────────┘
```

## Environment Variables

Required environment variables for Supabase Auth:

```bash
# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Frontend URL (for password reset redirects)
FRONTEND_URL=http://localhost:3001
```

---

## Security Best Practices

1. **Never expose service_role key** - Keep it server-side only
2. **Use HTTPS in production** - Protects tokens in transit
3. **Implement token refresh** - Reduces risk of token theft
4. **Enable RLS policies** - Row Level Security in Supabase
5. **Validate all inputs** - Use Zod schemas for validation
6. **Rate limit endpoints** - Prevent brute force attacks

---

## Troubleshooting

### Token Verification Fails

**Issue:** Backend returns 401 Unauthorized

**Solutions:**

- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` match frontend
- Ensure token is sent as `Bearer <token>` in Authorization header
- Check token hasn't expired (default: 1 hour)

### User Not Synced

**Issue:** User exists in Supabase Auth but not in public.users

**Solutions:**

- Make any authenticated API request to trigger sync
- Check auth middleware is properly configured
- Verify database migrations have run

### CORS Errors

**Issue:** Frontend can't reach backend API

**Solutions:**

- Add frontend origin to CORS allowlist
- Check CORS middleware configuration
- Ensure OPTIONS requests are handled

---

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [RBAC Feature](../rbac/README.md)
- [User Feature](../user/README.md)
