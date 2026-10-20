# Reviews Feature

## Overview

The Reviews feature handles user-generated product feedback, providing a robust moderation system to maintain platform integrity. It natively verifies purchases against the Orders feature to grant "Verified Purchase" badges, supports rich media uploads, and includes a helpfulness voting mechanism to surface the most valuable community feedback.

## Structure

```
reviews/
├── index.ts
├── apis/
│   ├── create-review.ts
│   ├── get-admin-reviews.ts
│   ├── get-user-reviews.ts
│   ├── moderate-review.ts
│   └── vote-helpful.ts
└── shared/
    ├── index.ts
    ├── interface.ts
    ├── product-questions.schema.ts
    └── reviews.schema.ts
```

## API Routes

The module splits into public reading/voting routes, authenticated user submission routes, and administrative moderation endpoints. Note that public fetching of approved reviews is actually mounted externally within the `Product` feature's read pipeline, keeping the domain boundary clean.

### Endpoints

**User & Public Routes**
- `POST /` - Submit a new rating and review (defaults to `pending` moderation state)
- `GET /me` - Retrieve all historical reviews written by the currently authenticated user
- `POST /:id/helpful` - Vote a specific approved review as helpful (prevents self-voting and duplicate votes)

**Admin Moderation Routes**
- `GET /admin/reviews` - Paginated list of all reviews (filters by `pending`, `approved`, `rejected`)
- `PUT /admin/reviews/:id` - Mutate the moderation status or affix an official `admin_reply`

## Authentication Requirements

| Action                            | Endpoint                  | Authorization                       |
| --------------------------------- | ------------------------- | ----------------------------------- |
| Read Own Reviews, Vote Helpful    | `GET /me`, `POST /*`      | Authenticated User Token            |
| Submit New Review                 | `POST /`                  | Authenticated User Token            |
| Filter All Reviews globally       | `GET /admin/reviews`      | `reviews:read` permission           |
| Moderate, Reject, Admin Reply     | `PUT /admin/reviews/:id`  | `reviews:update` permission         |

---

## Endpoints Data Formats

### 1. Submit Product Review

**Endpoint:** `POST /api/reviews`

Requires a payload matching the `createReviewSchema`. The system silently verifies past purchases in the background to affix the validation badge.

#### Request Body

```json
{
  "product_id": "uuid-product-123",
  "rating": 5,
  "title": "Excellent build quality",
  "comment": "Exceeded my expectations, the finish is perfect.",
  "media_urls": [
    "https://cdn.example.com/user_images/review_1.jpg",
    "https://cdn.example.com/user_images/review_2.mp4"
  ]
}
```

### 2. Moderate Review (Admin)

**Endpoint:** `PUT /api/admin/reviews/:id`

Allows administrators to approve a pending review to make it public, or reject spam. They can also add official company replies.

#### Request Body

```json
{
  "status": "approved",
  "admin_reply": "Thank you for the detailed feedback! We're glad you liked the finish."
}
```

---

## Architecture & Implementation

### Moderation Pipeline
Every single submitted review is forcefully inserted with the `status: 'pending'` enum. They remain strictly invisible from the public catalog API (handled by the Products module) until a staff member with `reviews:update` permissions formally mutates their state to `approved`.

### Automated Verified Purchase Detection
When a user submits a review via `create-review.ts`, the backend does **not** rely on the client to claim verified status. Instead, the backend physically joins the `Orders` and `OrderItems` tables:
```typescript
const purchaseResult = await db.select()
  .from(orderItems)
  .innerJoin(orders, eq(orderItems.order_id, orders.id))
  .where(
    and(
      eq(orderItems.product_id, body.product_id),
      eq(orders.user_id, userId),
      eq(orders.order_status, 'delivered') // Must physically be delivered
    )
  );
```
If a match exists, `is_verified_purchase` is permanently locked to `true`.

### Community Helpfulness Mechanism
Users can vote on reviews they find helpful via `vote-helpful.ts`. The implementation specifically blocks authors from artificially inflating their own review scores (`review.user_id === userId` check limit). 

*(Note: Currently, duplicate vote tracking utilizes an in-memory `Map` mechanism locally on the Node instance for speed, but this is flagged to migrate to a Redis Set or PostgreSQL associative table during production scaling.)*

## Dependencies

- **Products**: Requires a valid, non-deleted Product ID to attach the review to.
- **Orders**: Cross-references the `order_items` schema to validate if the user actually purchased the item prior to assigning the "Verified Purchase" badge.
