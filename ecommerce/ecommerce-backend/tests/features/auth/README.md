# Auth API Test Summary

This document provides a quick overview of the testing status for the Authentication module.

✅ **Status**: **All Tests Passing**
- **Unit Tests**: 32/32 Passed
- **Integration Tests**: 12/12 Passed
- **Total Tests**: 44 Passed

## Tested APIs

The following Auth APIs and related user endpoints have been fully tested for both business logic (Unit) and HTTP/routing behavior (Integration).

### 1. Refresh Token (`/api/auth/refresh-token`)
- **Status**: ✅ Working
- **Coverage**: Valid token refresh, invalid token rejection, missing token handling.

### 2. Request Password Reset (`/api/auth/password-reset/request`)
- **Status**: ✅ Working
- **Coverage**: Successful email dispatch, invalid email validation, and security against user enumeration.

### 3. Confirm Password Reset (`/api/auth/password-reset/confirm`)
- **Status**: ✅ Working
- **Coverage**: Successful password update with valid Supabase token, error handling for invalid or expired tokens, and validation for missing fields.

### 4. Sync User (`sync-user` internal API / service)
- **Status**: ✅ Working
- **Coverage**: New user creation via Supabase payload, syncing existing users, email verification updates, linking existing accounts, and extracting user metadata.

### 5. Authenticated Endpoints (`GET /api/users`, `GET /api/users/:id`)
- **Status**: ✅ Working
- **Coverage**: Properly enforced JWT `Bearer` token requirements, RBAC permissions (Admin checks), and proper 404/401/403 HTTP response codes.

## Running the Tests

To run the Auth test suite locally, use the following commands from the root backend directory:

**Run Unit Tests:**
```bash
npm run test:unit -- --testPathPattern="tests/features/auth"
```

**Run Integration Tests:**
```bash
npx jest --testPathPatterns="tests/features/auth/integration" --forceExit --detectOpenHandles
```
