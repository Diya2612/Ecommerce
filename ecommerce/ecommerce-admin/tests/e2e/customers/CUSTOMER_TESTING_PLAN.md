# Customer Section - Comprehensive Testing Plan

## Overview
The Customer section is a complex module with full CRUD operations, multiple pages, form sections, filtering, sorting, bulk operations, import/export functionality, and address management.

## Test File Structure
```
tests/e2e/customers/
├── CUSTOMER_TESTING_PLAN.md          # This file - testing strategy
├── customer-list.spec.ts              # List page tests
├── customer-create.spec.ts            # Create/Add customer tests
├── customer-edit.spec.ts              # Edit customer tests
├── customer-delete.spec.ts            # Delete operations tests
├── customer-filters-sorting.spec.ts   # Filters, search, and sorting
├── customer-bulk-operations.spec.ts   # Bulk delete, import, export
├── customer-addresses.spec.ts         # Address management tests
└── customer-navigation.spec.ts        # Navigation and routing tests
```

---

## 📋 Customer Pages & Routes

### 1. **Customer List Page** - `/customers`
**Components:** CustomerListPage, CustomerListTable, CustomerListFilters, CustomerMetrics
**Features:**
- Display paginated list of customers
- Search functionality
- Multiple filters (status, gender, date, orders, tags)
- Sorting by various columns
- Column visibility toggle
- Metrics display (Total, Active, Inactive, Deleted)
- Date range filter
- Bulk selection
- Action buttons (Create, Import, Export)
- Responsive table with mobile card view

### 2. **Add Customer Page** - `/customers/new`
**Components:** CustomerForm with multiple form sections
**Features:**
- Multi-section form:
  - Basic Information (First name, Last name, Display name)
  - Contact Information (Email, Phone, Secondary email, Secondary phone)
  - Email verification with OTP
  - Classification (Customer type, Segment, Tags)
  - Preferences (Currency, Payment terms, Language, Newsletter)
  - Addresses (Multiple addresses with CRUD)
- Form validation with Zod schema
- Image upload for customer avatar
- Discard changes dialog
- Success/error notifications
- Navigation to customer detail after creation

### 3. **Customer Detail/Edit Page** - `/customers/:id`
**Components:** CustomerForm (edit mode) with additional sections
**Features:**
- All features from Add page
- Pre-populated form data
- Order history display with pagination
- Payment history display with pagination
- Delete customer functionality
- Update customer functionality
- Address management (Create, Edit, Delete)
- Breadcrumb navigation

---

## 🧪 Test Files Breakdown

### **1. customer-list.spec.ts** (List Page Tests)
**Priority:** HIGH
**Estimated Tests:** ~20 tests

**Test Categories:**
- **Page Load & Structure**
  - Should load customers list page
  - Should display page header and title
  - Should show metrics cards
  - Should display customer table
  - Should show action buttons (Create, Import, Export)
  - Should display date range picker

- **Table Display**
  - Should display customer rows with all columns
  - Should show customer name, email, phone
  - Should display customer type badges
  - Should show status indicators
  - Should display join date
  - Should handle empty state

- **Pagination**
  - Should show pagination controls
  - Should navigate to next page
  - Should navigate to previous page
  - Should change rows per page
  - Should display correct page numbers

- **Metrics Display**
  - Should show total customers count
  - Should show active customers count
  - Should show inactive customers count
  - Should display metrics with icons

- **Loading States**
  - Should show loading spinner initially
  - Should transition from loading to content

---

### **2. customer-create.spec.ts** (Create Customer Tests)
**Priority:** HIGH
**Estimated Tests:** ~30 tests

**Test Categories:**
- **Page Load**
  - Should load add customer page
  - Should display form sections
  - Should show all form fields
  - Should display save and cancel buttons

- **Basic Information Section**
  - Should fill first name field
  - Should fill last name field
  - Should fill display name field
  - Should show validation errors for required fields
  - Should accept valid inputs

- **Contact Information Section**
  - Should fill email field
  - Should validate email format
  - Should fill phone number
  - Should validate phone format
  - Should fill secondary email (optional)
  - Should fill secondary phone (optional)

- **Email Verification**
  - Should show "Verify Email" button
  - Should send OTP when clicked
  - Should display OTP input field
  - Should verify OTP code
  - Should show verification success
  - Should handle invalid OTP

- **Classification Section**
  - Should select customer type (Retail/Distributor)
  - Should select segment
  - Should add tags
  - Should remove tags

- **Preferences Section**
  - Should select currency
  - Should select payment terms
  - Should select language
  - Should toggle newsletter subscription

- **Addresses Section**
  - Should display "Add Address" button
  - Should show address form when clicked
  - Should fill address fields
  - Should set default billing address
  - Should set default shipping address
  - Should save address

- **Image Upload**
  - Should display image upload area
  - Should upload customer avatar
  - Should preview uploaded image

- **Form Submission**
  - Should enable save button when form is valid
  - Should create customer successfully
  - Should show success notification
  - Should navigate to customer detail page
  - Should handle API errors
  - Should show validation errors

- **Discard Changes**
  - Should show discard dialog when navigating away
  - Should discard changes when confirmed
  - Should stay on page when cancelled

---

### **3. customer-edit.spec.ts** (Edit Customer Tests)
**Priority:** HIGH
**Estimated Tests:** ~25 tests

**Test Categories:**
- **Page Load**
  - Should load customer detail page with ID
  - Should display pre-filled form
  - Should show customer name in header
  - Should display breadcrumb navigation
  - Should show delete button

- **Edit Operations**
  - Should edit first name
  - Should edit last name
  - Should edit email
  - Should edit phone number
  - Should change customer type
  - Should update tags
  - Should update preferences
  - Should save changes successfully
  - Should show success notification
  - Should handle update errors

- **Additional Sections (Edit Mode Only)**
  - Should display order history section
  - Should show order list
  - Should paginate through orders
  - Should display payment history section
  - Should show payment transactions
  - Should paginate through payments

- **Address Management in Edit Mode**
  - Should display existing addresses
  - Should add new address
  - Should edit existing address
  - Should delete address
  - Should update default addresses

---

### **4. customer-delete.spec.ts** (Delete Operations)
**Priority:** HIGH
**Estimated Tests:** ~10 tests

**Test Categories:**
- **Single Delete**
  - Should show delete button on detail page
  - Should open confirmation dialog
  - Should delete customer when confirmed
  - Should show success notification
  - Should navigate to list page after delete
  - Should handle delete errors

- **Bulk Delete**
  - Should select multiple customers from list
  - Should show bulk delete button
  - Should display confirmation dialog with count
  - Should delete all selected customers
  - Should show success message with count
  - Should refresh list after bulk delete
  - Should handle partial delete failures

---

### **5. customer-filters-sorting.spec.ts** (Filters & Search)
**Priority:** MEDIUM
**Estimated Tests:** ~25 tests

**Test Categories:**
- **Search Functionality**
  - Should display search input
  - Should search by customer name
  - Should search by email
  - Should search by phone number
  - Should show filtered results
  - Should clear search
  - Should reset pagination on search

- **Status Filter**
  - Should display status filter dropdown
  - Should filter by Active status
  - Should filter by Inactive status
  - Should filter by Deleted status
  - Should show filtered count

- **Gender Filter**
  - Should display gender filter
  - Should filter by Male
  - Should filter by Female
  - Should filter by Other

- **Date Range Filter**
  - Should display date range picker
  - Should filter by date range
  - Should show customers within range
  - Should clear date range

- **Orders Filter**
  - Should filter by order count ranges
  - Should show customers with specific order counts

- **Tags Filter**
  - Should display tags filter
  - Should filter by specific tags
  - Should support multiple tag selection

- **Sorting**
  - Should sort by name (A-Z, Z-A)
  - Should sort by email
  - Should sort by join date (newest, oldest)
  - Should sort by order count
  - Should maintain sort while paginating

- **Column Visibility**
  - Should toggle column visibility
  - Should hide columns
  - Should show hidden columns
  - Should persist column preferences

- **Clear Filters**
  - Should display "Clear Filters" button
  - Should reset all filters
  - Should show all customers after clear

---

### **6. customer-bulk-operations.spec.ts** (Import/Export)
**Priority:** MEDIUM
**Estimated Tests:** ~15 tests

**Test Categories:**
- **Import Customers**
  - Should show import button
  - Should open import dialog
  - Should display file upload area
  - Should download template CSV
  - Should select import mode (Create/Update/Upsert)
  - Should upload CSV file
  - Should preview import data
  - Should validate import data
  - Should import customers successfully
  - Should show import summary (success/failed counts)
  - Should handle import errors

- **Export Customers**
  - Should show export button
  - Should open export dialog
  - Should select export scope (All/Selected)
  - Should select export format (CSV/XLSX)
  - Should select columns to export
  - Should apply date range to export
  - Should download exported file
  - Should show export success message

---

### **7. customer-addresses.spec.ts** (Address Management)
**Priority:** MEDIUM
**Estimated Tests:** ~20 tests

**Test Categories:**
- **Add Address (in Create Mode)**
  - Should show "Add Address" button
  - Should open address form
  - Should fill address type (Home/Office/Other)
  - Should fill name field
  - Should fill phone field
  - Should fill address line 1
  - Should fill address line 2 (optional)
  - Should fill city
  - Should fill state
  - Should fill pincode
  - Should fill country
  - Should set as default billing
  - Should set as default shipping
  - Should add multiple addresses
  - Should validate required fields

- **Address Management (in Edit Mode)**
  - Should display list of existing addresses
  - Should show address details
  - Should highlight default addresses
  - Should edit address
  - Should update address successfully
  - Should delete address
  - Should show confirmation before delete
  - Should handle address API errors

---

### **8. customer-navigation.spec.ts** (Navigation & Routing)
**Priority:** LOW
**Estimated Tests:** ~10 tests

**Test Categories:**
- **Navigation from List**
  - Should navigate to create page via button
  - Should navigate to detail page when clicking row
  - Should navigate to edit page from detail

- **Breadcrumb Navigation**
  - Should show breadcrumbs on detail page
  - Should navigate to list via breadcrumb
  - Should show current page in breadcrumb

- **Back Navigation**
  - Should show back button
  - Should navigate back from create page
  - Should navigate back from detail page
  - Should show unsaved changes dialog

- **URL Handling**
  - Should load customer by ID from URL
  - Should handle invalid customer ID
  - Should show 404 or error for non-existent customer

---

## 📊 Testing Priorities

### **MUST HAVE (Phase 1)**
1. ✅ customer-list.spec.ts - Basic list functionality
2. ✅ customer-create.spec.ts - Create customer with core fields
3. ✅ customer-edit.spec.ts - Edit existing customer
4. ✅ customer-delete.spec.ts - Delete operations

### **SHOULD HAVE (Phase 2)**
5. ✅ customer-filters-sorting.spec.ts - Search, filters, and sorting
6. ✅ customer-addresses.spec.ts - Address CRUD operations

### **NICE TO HAVE (Phase 3)**
7. ✅ customer-bulk-operations.spec.ts - Import/Export
8. ✅ customer-navigation.spec.ts - Navigation flows

---

## 🔧 Test Data Requirements

### Test Credentials
- Use existing admin credentials from `tests/utils/credentials.ts`

### Mock Customer Data
- First Name: "Test", "John", "Jane", "Alice", "Bob"
- Last Name: "Customer", "Doe", "Smith", "Johnson", "Williams"
- Email: "test.customer@example.com", "john.doe@test.com"
- Phone: "+919876543210", "9123456789"
- Customer Types: "Retail", "Distributor"
- Tags: ["VIP", "Premium", "Regular", "New"]

### Test File Upload
- Valid CSV for import
- Invalid CSV for error handling

---

## 🎯 Success Criteria

- All critical CRUD operations work end-to-end
- Form validations catch errors properly
- API integrations are tested (success & error cases)
- Loading states display correctly
- Success/error notifications appear
- Navigation flows work as expected
- Bulk operations complete successfully
- Import/Export functionality works
- Address management is fully functional

---

## 📝 Notes

- Each test file should be independent and can run standalone
- Use beforeEach to login before each test
- Use afterEach to clean up test data if needed
- Use proper waits for API responses
- Test both success and error scenarios
- Include responsive design tests where applicable
- Add accessibility tests for forms
