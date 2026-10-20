# User Feature

## Overview

The User feature is the primary Identity and Profile Management module for the platform. It serves as the central Postgres source of truth for all user metadata, bridging the gap between external identity providers (Supabase Auth) and the internal e-commerce/administrative engines. It includes multi-tiered profile data (Primary/Secondary contacts), role-based visibility, and native Email OTP verification workflows.

## Structure

```
user/
├── index.ts
├── apis/
│   ├── delete-user.ts
│   ├── get-all-users.ts
│   ├── get-current-user.ts
│   ├── get-user-by-id.ts
│   ├── send-email-otp.ts
│   ├── update-user.ts
│   └── verify-email-otp.ts
├── services/
│   ├── index.ts
│   ├── otp.service.ts
│   ├── user-cache.service.ts
│   └── user.service.ts
└── shared/
    ├── email-otp.schema.ts
    ├── index.ts
    ├── interface.ts
    ├── queries.ts
    ├── user.schema.ts
    └── validation.ts
```

## API Routes

The module natively splits into administrative CRUD management, personal profile management, and independent OTP verification pipelines. 

### Endpoints (User & Admin Scoped)

**Profile Management**
- `GET /me` - Convenience endpoint to retrieve the currently authenticated user's profile without knowing their UUID
- `GET /:id` - Retrieve public/authorized profile details for a specific user
- `PUT /:id` - Mutate profile metadata (Admins can update anyone; Users can only update their own `id`)
- `DELETE /:id` - Soft-delete a user account (Admin only)

**Administrative Operations**
- `GET /` - Paginated table view of all platform users (Admin only)

**Identity Verification (OTP)**
- `POST /send-email-otp` - Generates a 6-digit pin via `otp.service.ts` and actively dispatches it to the user's email through AWS SES / NodeMailer.
- `POST /verify-email-otp` - Validates the submitted pin against the database, instantly flagging `email_verified = true` upon success.

## Authentication Requirements

| Action                            | Endpoint Type           | Authorization                       |
| --------------------------------- | ----------------------- | ----------------------------------- |
| View/Update Own Profile           | `GET /me`, `PUT /:id`   | Authenticated User                  |
| OTP Verification Flow             | `POST /*-otp`           | Authenticated User                  |
| View Any Profile                  | `GET /:id`              | Admin / Internal Staff              |
| List All Users, Delete Users      | `GET /`, `DELETE /:id`  | Admin (`users:manage`)              |

*Note: Passwords and system-level audit flags (`is_deleted`, `deleted_by`) are strictly scrubbed from all API responses via `mapToUserResponse` sanitizers.*

---

## Architecture & Implementation

### 1. Hybrid Identity Model (`user.schema.ts`)
The `users` table is not a standalone authentication vault. It is designed as a hybrid metadata store. 
- **`id`**: Internal auto-generated UUIDv7 for high-performance indexing across e-commerce tables.
- **`auth_id`**: The strict mapping to Supreme Auth providers (e.g., Supabase, Auth0). When a user logs in via OAuth, the JWT token matches this `auth_id`, which the backend intercepts to pull the internal operational `id`.

### 2. OTP Verification Engine (`otp.service.ts`)
The module natively handles identity verification without relying purely on external magic links. 
- The `email_otps` table securely stores 6-digit codes hashed with a strict 5-minute `expires_at` window.
- It features brute-force protection natively: If a user fails the check 3 times (`attempts >= max_attempts`), the OTP is permanently burned, requiring a fresh request to prevent timing attacks.

### 3. Progressive Profiling
The schema is built for robust B2B and B2C operations, supporting secondary contact routing:
- Secondary emails (`secondary_email_type`) for business vs personal invoices.
- Secondary phones (`secondary_phone_type`) with independent verification flags.
- Deep metadata constraints like `preferred_language`, `preferred_currency` (default `INR`), and global `timezone` (default `Asia/Kolkata`).

### 4. High-Performance Redis Caching
Because the `users` table is the most frequently joined aggregate in the entire Database (every Order, Review, Payment, and Request references a `user_id`), the module employs `user-cache.service.ts`. Frequent lookups like `GET /me` or `GET /:id` intercept the Redis grid first, preventing continuous `SELECT * FROM users` hammering on the primary PostgreSQL writer.
