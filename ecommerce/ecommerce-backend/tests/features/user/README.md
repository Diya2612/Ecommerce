# User API Test Summary

This document provides a quick overview of the testing status for the User module.

✅ **Status**: **All Tests Passing**
- **Unit Tests**: 47/47 Passed
- **Integration Tests**: 19/19 Passed
- **Total Tests**: 66 Passed

## Tested APIs

The following User APIs and related services have been fully tested for both business logic (Unit) and HTTP/routing behavior (Integration).

### 1. Retrieve all users (`GET /api/users`)
- **Status**: ✅ Working
- **Coverage**: Successful retrieval, pagination, handling empty results, parsing metadata. Integration verifies that only users with the `admin` role can list all users.

### 2. Retrieve a single user (`GET /api/users/:id`)
- **Status**: ✅ Working
- **Coverage**: Proper response containing all required fields minus sensitive info. Integration validates that users can view their own profile, admins can view any profile, and 404s/403s are properly handled.

### 3. Update user profile (`PUT /api/users/:id`)
- **Status**: ✅ Working
- **Coverage**: Business logic successfully processes partial updates, hashes passwords if updated, and checks for email uniqueness constraints (409 Conflict). Integration validates that users can only update their own profile while admins can update any.

### 4. Delete user (`DELETE /api/users/:id`)
- **Status**: ✅ Working
- **Coverage**: Implements soft deletion successfully, changing `is_deleted`, `deleted_at`, and `deleted_by`. Also handles idempotency (deleting an already deleted user). Integration verifies strict RBAC checks (requires `admin` or specific permissions), ensuring non-existent users trigger 404s and preventing self-deletion.

### 5. internal caching (`UserCacheService`)
- **Status**: ✅ Working
- **Coverage**: Correctly hooks into Redis via `utils/database/redis`. Properly grabs data on cache hits and falls back efficiently on misses or Redis outages. Confirms memory and Redis-layer evictions process cleanly.

## Running the Tests

To run the User test suite locally, use the following commands from the root backend directory:

**Run Unit Tests:**
```bash
npm run test:unit -- --testPathPattern="tests/features/user"
```

**Run Integration Tests:**
```bash
npx jest --testPathPatterns="tests/features/user/integration" --forceExit --detectOpenHandles
```
