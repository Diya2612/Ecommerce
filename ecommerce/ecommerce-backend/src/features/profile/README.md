# Profile Feature

## Overview

The Profile feature serves as the self-service security and account management gateway for authenticated users. Unlike other modules that utilize extensive internal `services` layers, the Profile module operates as a direct integration bridge between the application's user interface and the core identity providers: Supabase Auth (for MFA/Passwords) and Redis (for live multi-device session tracking).

## Structure

```
profile/
├── index.ts
├── apis/
│   ├── change-password.ts
│   ├── disable-mfa.ts
│   ├── enroll-mfa.ts
│   ├── get-notification-preferences.ts
│   ├── get-profile-settings.ts
│   ├── get-security-settings.ts
│   ├── logout-session.ts
│   ├── update-notification-preferences.ts
│   ├── update-profile-settings.ts
│   └── verify-mfa.ts
└── shared/
    ├── index.ts
    └── interface.ts
```

## API Routes

All routes are mounted under `/api/profile`. This module is entirely user-facing; there are no admin-specific routes present here, as administrative overrides are handled within the `User` feature.

### Endpoints

**Account Details**
- `GET /` - Retrieve the user's generic profile data
- `PUT /` - Update the user's name, avatar, or generic profile descriptors
- `GET /notifications` - Retrieve the mapped notification channels
- `PUT /notifications` - Update global notification preferences

**Security & Sessions**
- `GET /security` - Fetches active Redis sessions, login histories, and MFA status
- `POST /change-password` - Request a secure password mutation via Supabase Auth
- `POST /sessions/logout` - Selectively destroy active JWT sessions across devices

**Multi-Factor Authentication (MFA)**
- `POST /mfa/enroll` - Initialize a TOTP QR code request via Supabase Auth
- `POST /mfa/verify` - Confirm the TOTP code to permanently activate MFA
- `POST /mfa/disable` - Strip the MFA requirement from the user's account

## Authentication Requirements

| Action                            | Endpoint Type           | Authorization                       |
| --------------------------------- | ----------------------- | ----------------------------------- |
| View/Update Profile & Settings    | `GET /`, `PUT /`        | Authenticated User Token            |
| Destroy Sessions, Change Password | `POST /sessions/logout` | Authenticated User Token            |
| Enroll/Verify/Disable MFA         | `POST /mfa/*`           | Authenticated User Token            |

*Note: The Profile feature operates exclusively on the `req.userId` context extracted from the JWT. Users cannot pass a target ID to these endpoints to modify other accounts.*

---

## Endpoints Data Formats

### 1. View Security Settings (Session Tracking)

**Endpoint:** `GET /api/profile/security`

Dynamically scans the Redis cache to construct a list of devices currently holding an active JWT for the user.

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "activeSessions": [
      {
        "id": "current-session",
        "device": "Chrome on Desktop",
        "location": "192.168.1.100",
        "lastActive": "Now",
        "isCurrent": true
      },
      {
        "id": "sess-hash-9999",
        "device": "Safari on Mobile",
        "location": "10.0.0.5",
        "lastActive": "10/25/2026, 2:30:00 PM",
        "isCurrent": false
      }
    ],
    "loginHistory": [
      {
        "timestamp": "2026-10-25T14:30:00.000Z",
        "ip_address": "192.168.1.100",
        "location": "Unknown",
        "device_type": "Desktop",
        "browser": "Chrome"
      }
    ],
    "passwordLastChanged": "Not available",
    "twoFactorEnabled": true,
    "twoFactorMethod": "Authenticator App",
    "twoFactorId": "uuid-factor-1234"
  }
}
```

### 2. Multi-Device Logout

**Endpoint:** `POST /api/profile/sessions/logout`

Allows a user to remotely destroy a compromised session on a different device by purging its hash from the Redis cache and invoking Supabase's `signOut`.

#### Request Body

```json
{
  "scope": "single",
  "sessionId": "sess-hash-9999"
}
```
*(Valid scopes: `current`, `all`, `others`, `single`)*

### 3. Initialize MFA Enrollment

**Endpoint:** `POST /api/profile/mfa/enroll`

Pings the Identity Provider (Supabase) to generate a secure TOTP seed physically tied to the user's `auth_id`.

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid-factor-1234",
    "type": "totp",
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code": "svg-string-data...",
    "uri": "otpauth://totp/Platform:user@email.com?secret=JBSWY3DPEHPK3PXP&issuer=Platform"
  }
}
```

---

## Features

- **Direct Identity Provider Mapping**: Because authentication logic should never be heavily reinvented, the Profile apis purposefully lack a deep `services/` layer. They act as secure proxies directly calling the Supabase Node.js SDK (`supabase.auth.admin.mfa`).
- **Redis Session Management**: Session management is decoupled from the Postgres database for extreme speed. The `logout-session` route searches for keys matching `session:{userId}:*` in Redis and selectively purges them based on the provided `scope` (e.g., logging out of all *other* devices while keeping the current device active).
- **Enforced Self-Containment**: These routes strictly derive the target user from the `req.userId` attached by the authentication middleware. It is impossible to pass an arbitrary `user_id` into the body to spoof an update on another account.

## Dependencies

- **Supabase Auth**: The entire MFA lifecycle (`enroll`, `verifyFactors`, `unenroll`) implicitly relies on a valid mapping between the Postgres `users.auth_id` column and the external Supabase Identity table.
- **Redis**: The active sessions UI directly reads from the Redis instance where generic rate-limiting and session cookies are stored. 
- **Notifications Feature**: The `/notifications` routes act as a proxy passing the user's generic requests directly into the `preference.service.ts` logic maintained natively by the active Notifications feature.
