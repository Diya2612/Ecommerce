# Test Scenarios by Page

This document outlines the test cases grouped by each page of the Anant Enterprises frontend.

## 1. Home Page (`/`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Hero Navigation** | 1. Open Home Page.<br>2. Interact with Hero Carousel (Next/Prev). | Carousel slides should change smoothly. | |
| **Hero CTA Click** | 1. Click on the CTA button (e.g., "Explore Now") in a Hero slide. | User should be navigated to the link defined for that slide. | |
| **Brands Carousel** | 1. Locate the "Trusted Brands" section.<br>2. Use arrows to scroll through brand logos (Desktop).<br>3. Drag/Swipe the logos (Mobile). | Carousel should scroll to show more brand logos. | |
| **Technology Slider - Tab Change** | 1. Scroll to "Advanced Purification" section.<br>2. Click on a side card or a pagination dot. | The clicked technology should move to the center and become active. | |
| **Technology Slider - Explore** | 1. Click "Explore Technology" on the active (centered) tech card. | User should be redirected to the `/technology` page. | |
| **Usage Category Navigation** | 1. Scroll to "Solutions for Every Space".<br>2. Click on a usage card (e.g., "Home", "Office"). | User should be redirected to the products page filtered by that usage. | |
| **Compare Models - Add** | 1. Scroll to "Compare Models".<br>2. Click an empty "Add Product" slot.<br>3. Select a product from the modal. | Product should appear in the comparison table with full specs. | |
| **Compare Models - Highlight Diff** | 1. Add two different products to the comparison table.<br>2. Toggle "Highlight Differences". | Differing specifications should be visually highlighted (e.g., blue background). | |
| **Compare Models - Remove** | 1. Click the "Trash" icon on a compared product. | The product should be removed, and the slot should become empty again. | |
| **Featured Products - Quick View** | 1. Hover over a product in "Featured Collection".<br>2. Click "Quick View" (if available). | A modal/overlay should open with product details without leaving the home page. | |
| **Footer CTA** | 1. Scroll to the bottom "Call to Action" section.<br>2. Click the primary button (e.g., "Contact Us"). | User should be redirected to the appropriate contact or products page. | |

## 2. Product Listing Page (`/products`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Initial Load** | 1. Navigate to `/products`. | Product grid and filters sidebar should load correctly with "All Products" title. | |
| **Filter Accordions** | 1. Click on a filter section header (e.g., "Categories", "Price Range"). | The section should expand/collapse with a smooth animation. | |
| **Category Selection** | 1. Expand "Categories".<br>2. Click on a category checkbox (e.g., "Residential"). | Checkbox is ticked; Grid updates; "Categories" header shows active count (if implemented). | |
| **Price Slider** | 1. Drag the min or max handle of the "Price Range" slider.<br>2. Release the handle. | Grid updates to show products within the selected price range. Min/Max text updates. | |
| **Technology Filter** | 1. Expand "Technology".<br>2. Select multiple technologies (e.g., "RO" and "UV"). | Grid updates to show products matching ANY of the selected technologies. | |
| **Rating Filter** | 1. Expand "Rating".<br>2. Select "4 Star & Up". | Grid updates to show highly-rated products. | |
| **Clear All Filters** | 1. Apply multiple filters.<br>2. Click "Clear All" button in the filter header. | All filters reset; Grid reloads with all products. | |
| **Search Within Page** | 1. Use the search bar (if available in header/sidebar). | Grid filters dynamically based on product name match. | |
| **Sort Options** | 1. Click "Sort By" dropdown (Desktop) or "Sort" button (Mobile).<br>2. Select "Price: Low to High". | Grid reorders. Active sort option is highlighted. | |
| **Wishlist Toggle** | 1. Click the "Heart" icon on a product card. | Icon turns solid/red. Success toast appears. (Requires Auth check if strictly enforced). | |
| **Mobile: Filter Drawer** | 1. On mobile view, click "Filters" sticky button.<br>2. Apply filters and click "Show Results". | Drawer opens/closes. Filters are applied to the grid. Badge count updates. | |
| **Mobile: Sort Drawer** | 1. On mobile view, click "Sort" sticky button.<br>2. Select an option. | Drawer closes; Grid reorders. | |
| **Pagination** | 1. Scroll to bottom of grid.<br>2. Click "Next" or a specific page number. | Grid loads next set of products. "Showing X-Y of Z" text updates. | |

## 3. Product Detail Page (`/product/[id]` or `/products/[slug]`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Image Gallery Navigation** | 1. Click on different thumbnails in the gallery.<br>2. (Mobile) Swipe main image. | Main image updates to show the selected view. | |
| **Share Product** | 1. Click the "Share" icon (top right of image). | Share dialog opens (native) or link copied to clipboard toast appears. | |
| **Wishlist Toggle** | 1. Click the "Heart" icon (top right of image). | Icon turns red. Success toast "Added to Wishlist" appears. | |
| **Color Selection** | 1. Locate "Select Color" section.<br>2. Click a color swatch (e.g., Black). | Selection highlights. Color label updates. | |
| **Quantity Adjustment** | 1. Click "+" button.<br>2. Click "-" button. | Quantity increases (up to stock limit) and decreases (min 1). | |
| **Add to Cart** | 1. Select a quantity.<br>2. Click "Add to Cart". | Success toast appears. Cart count increases. Button text may briefly show loading state. | |
| **Buy Now** | 1. Click "Buy Now". | Product added to cart. User redirected to Checkout immediately. | |
| **Features Carousel (Mobile)** | 1. Scroll to "Key Product Features".<br>2. Swipe or use arrows. | Carousel slides through feature cards. | |
| **Reviews: Sorting** | 1. Scroll to "Customer Reviews".<br>2. Click sort dropdown.<br>3. Select "Newest". | Reviews list reorders by date. | |
| **Reviews: Helpful Vote** | 1. Click "Helpful" (thumbs up) on a review. | Count increments. (If not logged in, Login modal appears). | |
| **Reviews: Report** | 1. Click "Report" on a review.<br>2. Select reason and submit. | Success toast appears. | |
| **Reviews: Write Review** | 1. Click "Write a Review".<br>2. Fill rating, title, content.<br>3. (Optional) Upload image.<br>4. Submit. | Review is submitted (mock/real) and appears in list. Success toast shown. | |
| **Reviews: Load More** | 1. Scroll to bottom of reviews.<br>2. Click "Load More Reviews". | Spinner appears briefly. More reviews are appended to the list. | |

## 4. Shopping Cart Page (`/cart`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Initial Load** | 1. Navigate to `/cart` (with items in cart). | Cart items list, summary, and free shipping progress bar are visible. | |
| **Update Quantity** | 1. Click "+" button on an item.<br>2. Click "-" button on an item. | Quantity updates. Subtotal and Grand Total recalculate immediately. "-" disabled at qty 1. | |
| **Remove Item** | 1. Click the "Trash" / Remove icon on an item. | Item is removed from the list with an animation. Totals update. | |
| **Free Shipping Progress** | 1. Add items to cart below threshold (₹5000).<br>2. Add items to exceed threshold. | - Below: Bar shows progress and amount needed.<br>- Above: Bar full, success message "FREE Shipping Unlocked". | |
| **Apply Discount Code** | 1. Enter valid code in "Discount Code" input.<br>2. Click Apply. | Success toast. Discount row appears in summary. Grand Total decreases. | |
| **Invalid Discount Code** | 1. Enter invalid code.<br>2. Click Apply. | Error toast "Invalid discount code". | |
| **Upsell Add to Cart** | 1. Locate "Fancy Something Extra?".<br>2. Click "Add" on an upsell item. | Item added to main cart list. Upsell item disappears from suggestion list. | |
| **Proceed to Checkout** | 1. Click "Proceed to Checkout". | User redirected to `/checkout`. | |
| **Empty Cart** | 1. Remove all items from cart. | "Cart is empty" message appears with "Continue Shopping" button. | |

## 5. Login Page (`/login`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Tab Switching** | 1. Click on "Phone" tab.<br>2. Click back to "Email" tab. | Active tab highlights; form content switches between Email and Phone login. | |
| **Email: Toggle Password** | 1. Enter password.<br>2. Click the "Eye" icon. | Password visibility toggles between hidden (dots) and plain text. | |
| **Email: Form Validation** | 1. Leave fields empty.<br>2. Click "Sign In". | Error message "Please fill in all fields" appears. | |
| **Email: Login Success** | 1. Enter valid email and password.<br>2. Click "Sign In". | Button shows "Signing in..." loader. User redirected to Profile or previous page. | |
| **Email: Remember Me** | 1. Check "Remember me" box.<br>2. Login. | Session persists after browser restart (auth provider dependent). | |
| **Phone: Send OTP** | 1. Enter valid phone number (+91...).<br>2. Click "Send OTP". | Button shows "Sending OTP..." loader. UI moves to OTP entry step. | |
| **Phone: Change Number** | 1. On OTP step, click "Change phone number". | Form reverts to phone number input step. OTP is cleared. | |
| **Phone: Resend OTP Cooldown** | 1. Observe "Resend OTP" button on OTP step. | Shows countdown timer (e.g., "Resend OTP in 59s"). Button disabled until timer reaches 0. | |
| **Phone: Verify OTP Success** | 1. Enter valid 6-digit OTP.<br>2. Click "Verify & Login". | User authenticated and redirected. | |
| **Google Login** | 1. Click "Continue with Google". | Google OAuth popup/redirect initiates. | |
| **Redirect After Login** | 1. Access `/checkout` as guest.<br>2. Redirected to `/login?redirect=/checkout`.<br>3. Login successfully. | User is redirected back to `/checkout` instead of default `/profile`. | |

## 6. Registration Page (`/register`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Form Validation: Empty** | 1. Click "Create Account" without filling fields. | Error "Please fill in all fields" displayed. | |
| **Form Validation: Pass Match** | 1. Fill Name, Email.<br>2. Enter different Password and Confirm Password.<br>3. Submit. | Error "Passwords do not match" displayed. | |
| **Form Validation: Pass Length** | 1. Enter password shorter than 8 chars.<br>2. Submit. | Error "Password must be at least 8 characters" displayed. | |
| **Form Validation: Terms** | 1. Fill all valid details.<br>2. Uncheck Terms checkbox.<br>3. Submit. | Error "Please accept the terms and conditions" displayed. | |
| **Existing User** | 1. Register with an already used email address. | Error "This email is already registered" displayed. | |
| **Success: Email Confirm** | 1. Register with new email (if config requires confirmation). | Redirect to `/confirm-email`. | |
| **Success: Direct Login** | 1. Register with new email (if no confirmation needed). | Account created; User logged in and redirected to Profile. | |
| **Navigation: Login** | 1. Click "Sign in" link at bottom. | Redirected to `/login` page. | |

## 7. Checkout Page (`/checkout`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Auth Guard** | 1. Access `/checkout` as guest. | User redirected to `/login` with redirect param. | |
| **Address: Default Selection** | 1. Load checkout as logged-in user with addresses. | Default address is pre-selected. If no default, the first one is selected. | |
| **Address: Select Address** | 1. Click on a non-selected address card. | Card expands (if previously collapsed); selection indicator (check) moves to this card. | |
| **Address: Add New** | 1. Click "Add New Address".<br>2. Fill modal form.<br>3. Save. | New address appears in the list and is automatically selected. | |
| **Address: Edit Address** | 1. Click "Edit" on an address card.<br>2. Update details.<br>3. Save. | Details update in the list. | |
| **Address: Delete Address** | 1. Click "Delete" on an address card.<br>2. Confirm. | Address is removed. If it was selected, a new one is auto-selected. | |
| **Payment: Method Selection** | 1. Click "Pay Online".<br>2. Click "Cash on Delivery". | Selection highlights with blue border/background. Context message updates (Blue for Online, Amber for COD). | |
| **Upsell: Add to Order** | 1. Click "Add" on a recommended add-on. | Item appears in "Cart Items" section of checkout. Totals update. Suggestion is replaced with next item from pool. | |
| **Order Summary: Price Review** | 1. Check Subtotal, Discounts, Shipping, and Grand Total. | Calculations are accurate based on cart items and selected method (if fee applied). | |
| **Place Order: Online** | 1. Select "Pay Online".<br>2. Click "Place Order". | User is redirected to Razorpay payment gateway. | |
| **Place Order: COD** | 1. Select "Cash on Delivery".<br>2. Click "Place Order". | Order is confirmed; redirected to Success page. | |

## 8. Order Success Page (`/checkout/success`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Order ID Display** | 1. Arrive on page (via redirect or URL). | Order ID is displayed clearly (e.g., #ORD-12345). | |
| **Copy Order ID** | 1. Click copy icon next to Order ID. | "Order number copied!" toast appears. | |
| **Timeline Status** | 1. Check "Order Timeline" section. | "Order Placed" is checked/green. "Processing" is active. | |
| **Order Details Review** | 1. Check "Order Summary" sidebar. | Items list, shipping address, and final total match the placed order. | |
| **Track Order** | 1. Click "Track Order" button. | User redirected to `/profile/orders/[id]`. | |
| **Share Order** | 1. Click "Share" icon/button. | Native share dialog opens (mobile) or link copied (desktop). | |
| **Continue Shopping** | 1. Click "Back to Home" or "Browse Collection". | User redirected to Home or Products page. | |

## 9. User Profile (`/profile`)

| Scenario | Steps | Expected Result | Result |
|qs---|---|---|---|
| **Nav: Switch Tabs** | 1. Click "My Orders", "Addresses", or "Account" in sidebar. | URL updates; Main content area changes to reflect selected tab. | |
| **Orders: List View** | 1. Navigate to "My Orders". | List of past orders is displayed with status badges and totals. | |
| **Orders: View Details** | 1. Click "View Details" on an order. | Redirected to `/profile/orders/[id]` with full timeline and item breakdown. | |
| **Orders: Pull to Refresh (Mobile)** | 1. On mobile, pull down on the orders list. | Spinner appears; list refreshes. | |
| **Addresses: List View** | 1. Navigate to "Addresses". | Saved addresses are listed with "Default" badge where applicable. | |
| **Addresses: Add New** | 1. Click "Add New" button. | Modal opens. After saving, new address appears in list. | |
| **Addresses: Set Default** | 1. Click "Set Default" on an address. | "Default" badge moves to this address. Success toast appears. | |
| **Account: Update Profile** | 1. Navigate to "Account".<br>2. Edit Name or Phone.<br>3. Click "Save Changes". | Profile updates. Success toast appears. | |
| **Account: Delete Account** | 1. Click "Delete Account".<br>2. Confirm in dialog. | Account deletion process starts (or mock toast appears). | |
| **Sign Out** | 1. Click "Sign Out" in sidebar. | User is logged out and redirected to Home/Login. | |
