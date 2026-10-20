# Complete API Integration Guide - Admin Dashboard

## Overview
This comprehensive guide provides everything needed to integrate all backend APIs with your **admin dashboard frontend**. Each feature has its own detailed integration guide with TypeScript types, service classes, React hooks, and component examples specifically designed for admin panel functionality.

> **Important**: This guide focuses **exclusively on admin dashboard APIs** that require proper authentication and admin permissions. Customer-facing public APIs are not included here.

## 🔐 Admin Authentication Requirements

All APIs in this guide require:
- **JWT Authentication**: Valid admin user session
- **Role-Based Permissions**: Specific admin permissions for each feature
- **Secure Headers**: Proper authorization headers in all requests

### Required Admin Permissions by Feature:
```typescript
// Core admin permissions needed
const ADMIN_PERMISSIONS = {
  'products:create': 'Create new products',
  'products:read': 'View all products (including drafts)',
  'products:update': 'Update existing products', 
  'products:delete': 'Delete products',
  
  'orders:read': 'View all customer orders',
  'orders:update': 'Update order status and details',
  
  'users:read': 'View all users/customers',
  'users:update': 'Update user profiles',
  'users:delete': 'Delete user accounts',
  
  'collections:read': 'View all collections',
  'collections:create': 'Create product collections',
  'collections:update': 'Update collections',
  
  'blogs:read': 'View all blog posts',
  'blogs:create': 'Create blog posts',
  'blogs:update': 'Update blog content',
  'blogs:delete': 'Delete blog posts'
};
```

## 🚀 Quick Start

### 1. Global Configuration
Create a base API configuration file:

```typescript
// src/lib/api/config.ts
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  
  getAuthHeaders: () => ({
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  })
};

// Common error handler
export const handleAPIError = (error: any): string => {
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in.';
  }
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  return error.response?.data?.message || 'An unexpected error occurred.';
};
```

### 2. Base Service Class
Create a reusable base service class:

```typescript
// src/lib/api/baseService.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, handleAPIError } from './config';

export abstract class BaseService {
  protected api: AxiosInstance;
  protected baseURL: string;

  constructor(endpoint: string) {
    this.baseURL = `${API_CONFIG.BASE_URL}/api/${endpoint}`;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
    });

    // Request interceptor for auth
    this.api.interceptors.request.use(
      (config) => {
        const headers = API_CONFIG.getAuthHeaders();
        config.headers = { ...config.headers, ...headers };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        throw new Error(handleAPIError(error));
      }
    );
  }
}
```

## 📚 Feature-Specific Integration Guides

### Core Business Features (Admin Management)

| Feature | Guide | Status | Description |
|---------|-------|--------|-------------|
| **Products** | [Products API Integration](./Products_API_Integration.md) | ✅ Complete | **Admin-only** product catalog management with CRUD operations, variants, pricing |
| **Orders** | [Orders API Integration](./Orders_API_Integration.md) | ✅ Complete | **Admin-only** order management via `/api/admin/orders`, status updates, fulfillment |
| **Customers** | [Customers API Integration](./Customers_API_Integration.md) | ✅ Complete | **Admin-only** customer management, user profiles, account administration |
| **Collections** | [Collections API Integration](./Collections_API_Integration.md) | ✅ Complete | **Admin-only** product collections management, rules-based grouping |

### Content & Marketing Features (Admin Management)

| Feature | Guide | Status | Description |
|---------|-------|--------|-------------|
| **Blogs** | [Blogs API Integration](./Blogs_API_Integration.md) | ✅ Complete | **Admin-only** blog content management, publishing workflow, SEO optimization |
| **Discounts** | [Discounts API Integration](./Discounts_API_Integration.md) | 🔄 Pending | **Admin-only** discount codes, promotional campaigns, pricing rules |
| **Bundles** | [Bundles API Integration](./Bundles_API_Integration.md) | 🔄 Pending | **Admin-only** product bundles, package deals, grouped pricing |
| **Gift Cards** | [Gift Cards API Integration](./Gift_Cards_API_Integration.md) | 🔄 Pending | **Admin-only** gift card management, redemption, balance tracking |

### Analytics & Management (Admin Dashboard)

| Feature | Guide | Status | Description |
|---------|-------|--------|-------------|
| **Dashboard Analytics** | [Dashboard Analytics Integration](./Dashboard_Analytics_Integration.md) | ✅ Complete | **Admin-only** comprehensive KPIs, charts, performance metrics from all features |
| **Settings** | [Settings API Integration](./Settings_API_Integration.md) | 🔄 Pending | **Admin-only** system settings, configurations, business preferences |
| **Notifications** | [Notifications API Integration](./Notifications_API_Integration.md) | 🔄 Pending | **Admin-only** system notifications, alerts, messaging |
| **RBAC** | [RBAC API Integration](./RBAC_API_Integration.md) | 🔄 Pending | **Admin-only** role-based access control, permissions, user roles |

### File & Data Management (Admin Tools)

| Feature | Guide | Status | Description |
|---------|-------|--------|-------------|
| **Uploads** | [Uploads API Integration](./Uploads_API_Integration.md) | 🔄 Pending | **Admin-only** file upload management, image handling, media library |
| **Inventory** | [Inventory API Integration](./Inventory_API_Integration.md) | 🔄 Pending | **Admin-only** stock management, low stock alerts, inventory tracking |

## ⚠️ Important: Admin-Only Context

**This guide is exclusively for admin dashboard development**. The APIs documented here:

- ✅ **Require admin authentication and permissions**
- ✅ **Provide full CRUD access to all data**
- ✅ **Include admin-specific endpoints like `/api/admin/orders`**
- ✅ **Support business management operations**

**Not included** (customer-facing APIs):
- ❌ Public product browsing APIs
- ❌ Customer cart/checkout APIs
- ❌ Customer profile management APIs
- ❌ Public blog/content APIs

## 🛠️ Implementation Steps

### Step 1: Set Up Base Configuration
1. Create the global API configuration
2. Set up error handling utilities
3. Create base service class
4. Configure authentication interceptors

### Step 2: Implement Feature Services
For each feature you want to integrate:
1. Follow the specific integration guide
2. Create the service class extending BaseService
3. Implement the required TypeScript interfaces
4. Create React hooks for data fetching

### Step 3: Build Components
1. Create list/table components for data display
2. Build form components for data entry
3. Add modal/dialog components for actions
4. Implement detail/view components

### Step 4: Add to Routing
1. Create page components
2. Add routes to your routing system
3. Implement navigation links
4. Add breadcrumbs and page structure

## 📋 Common Patterns

### Service Class Pattern
Each feature follows this service class pattern:
```typescript
export class FeatureService extends BaseService {
  constructor() {
    super('feature-endpoint');
  }

  async getAll(params?) { /* implementation */ }
  async getById(id) { /* implementation */ }
  async create(data) { /* implementation */ }
  async update(id, data) { /* implementation */ }
  async delete(id) { /* implementation */ }
}
```

### React Hook Pattern
Each feature provides these hooks:
```typescript
// Data fetching
export const useFeatures = (params?) => { /* implementation */ }
export const useFeature = (id) => { /* implementation */ }

// Mutations
export const useFeatureMutations = () => {
  return {
    create: async (data) => { /* implementation */ },
    update: async (id, data) => { /* implementation */ },
    delete: async (id) => { /* implementation */ },
    loading
  };
};
```

### Component Pattern
Standard component structure:
```typescript
// List Component
export const FeatureList = () => {
  const { items, loading, error } = useFeatures();
  const { delete: deleteItem } = useFeatureMutations();
  // Implementation...
};

// Form Component
export const FeatureForm = ({ onSuccess, initialData, isEdit }) => {
  const { create, update, loading } = useFeatureMutations();
  // Implementation...
};
```

## 🔧 Development Tools

### Recommended VS Code Extensions
- REST Client (for API testing)
- Auto Rename Tag
- Bracket Pair Colorizer
- ES7+ React/Redux/React-Native snippets

### API Testing
Use the REST Client extension with these examples:
```http
### Get Products
GET {{baseUrl}}/api/products
Authorization: Bearer {{authToken}}

### Create Product
POST {{baseUrl}}/api/products
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "title": "Test Product",
  "sku": "TEST-001",
  "selling_price": "99.99"
}
```

## 📊 Integration Checklist

For each feature integration:

- [ ] Service class implemented
- [ ] TypeScript interfaces defined
- [ ] React hooks created
- [ ] List/table component built
- [ ] Form component implemented
- [ ] Detail/view component added
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Success notifications added
- [ ] Routing configured
- [ ] Navigation links added

## 🚨 Important Notes

### Authentication
All API endpoints require authentication. Ensure your auth token is:
- Stored securely (localStorage/sessionStorage)
- Included in all requests
- Refreshed when expired
- Cleared on logout

### Error Handling
Implement comprehensive error handling for:
- Network errors (connection issues)
- HTTP errors (4xx, 5xx status codes)
- Validation errors (400 with details)
- Authentication errors (401)
- Authorization errors (403)

### Performance Optimization
Consider implementing:
- Request caching (React Query/SWR)
- Pagination for large datasets
- Virtual scrolling for long lists
- Debounced search inputs
- Optimistic updates

### Security Best Practices
- Validate all inputs on frontend
- Sanitize displayed data
- Use HTTPS in production
- Implement proper CORS
- Store sensitive data securely

## 🤝 Support & Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS configuration includes your frontend domain
2. **Auth Token Expiry**: Implement token refresh logic
3. **Type Errors**: Ensure TypeScript interfaces match API responses
4. **Network Timeouts**: Increase timeout or implement retry logic

### Getting Help
1. Check the specific feature integration guide
2. Review TypeScript interfaces for data structures
3. Test API endpoints directly using REST Client
4. Verify authentication headers and tokens

## 🎯 Next Steps
1. Choose the features you need for your admin panel
2. Follow the integration guides in order of priority
3. Implement authentication first
4. Start with core features (Products, Orders, Customers)
5. Add dashboard analytics for insights
6. Extend with marketing and content features as needed

Each integration guide provides complete, production-ready code that you can copy-paste and adapt to your specific needs.