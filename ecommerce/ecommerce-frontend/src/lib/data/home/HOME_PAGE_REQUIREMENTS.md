# Home Page - Functional Requirements & Specifications

## 1. Executive Summary
The Home Page is the face of Anant Enterprises, acting as the primary landing point for new and returning visitors. It is designed to act as a high-conversion funnel, guiding users quickly to their desired outcome (purchasing product, booking service, or learning about technology).

**Document Status:** Draft
**Target Audience:** Development Team, Marketing
**Last Updated:** January 10, 2026

---

## 2. Core Objectives
1.  **Brand Impact:** Immediately establish Anant Enterprises as a premium, trustworthy water solution provider through high-quality visual storytelling.
2.  **Navigation Routing:** Efficiently segment users into "Looking for Products" (Home/Office) vs. "Need Service" flows.
3.  **Social Proof:** Leverage partner brands and customer testimonials to build instant credibility.
4.  **Sales Velocity:** Create urgency with ample "Deal of the Day" zones and featured product showcases.

---

## 3. Page Structure & Section Requirements

### 3.1. Hero Carousel (`HeroSection`)
*   **Requirement:** High-impact visual entry.
*   **Behavior:** Auto-play carousel with user override controls.
*   **Content:**
    *   Slide 1: Brand Brandishing (Action: "Book Service").
    *   Slide 2: Product Showcase (Action: "View Products").
    *   Slide 3: Lifestyle/Trust (Action: "Contact Us").
*   **Performance:** First image must be eager loaded for LCP optimization.

### 3.2. Brand Trust Strip (`BrandsSection`)
*   **Requirement:** "We work with the best."
*   **Visual:** Auto-scrolling or grid marquee of partner logos (Aquaguard, Kent, etc.).
*   **Objective:** Authority by association.

### 3.3. Categorization (`CategoriesSection`)
*   **Requirement:** Segment users based on need.
*   **Two Dimensions:**
    1.  **By Usage:** Domestic, Industrial, Corporate (Image Cards).
    2.  **By Tech:** RO, UV, Copper, Alkaline (Icon Grid).
*   **UX:** Click-through leads to pre-filtered Collection pages.

### 3.4. Featured Collection (`FeaturedProductsSection`)
*   **Requirement:** Show, don't just tell.
*   **Content:** 4 top-selling or new products.
*   **Card Data:** Image, Title, Price (vs MRP), Rating, and "Add to Cart" quick action.

### 3.5. Deal of the Day (`DealSection`)
*   **Requirement:** Create urgency.
*   **Content:** A specific product or service package (e.g., AMC) at a significant discount.
*   **Visual Elements:** Countdown timer (optional), "Save X%" pill, High-converted Call to Action.

### 3.6. Social Proof (`TestimonialsSection`)
*   **Requirement:** Validation from real humans.
*   **Data Points:** Name, Location, Rating Stars, and "Verified" badge.
*   **Layout:** Horizontal scroll or grid.

### 3.7. Call to Action (`CallToActionSection`)
*   **Requirement:** Final catch-all for converting footer traffic.
*   **Content:** "Still confused? Let us help you."
*   **Action:** Direct link to Contact page or Phone dialer.

---

## 4. Technical Requirements

### 4.1. Architecture
*   **Framework:** Next.js 14+ (App Router).
*   **Pattern:** Server Components for structure + Client Islands (Carousel, Product Cards) for interactivity.
*   **Rendering:** SSR for all initial HTML.

### 4.2. Data Integration
*   **Source:** `src/lib/data/home/`
*   **Endpoints:**
    *   `getHeroSlides`: Carousel content.
    *   `getBrands`: Partner logos.
    *   `getCategories`: Tech definitions.
    *   `getUsageTypes`: User segmentation.
    *   `getFeaturedProducts`: Product inventory subset.
*   **Caching:**
    *   Static elements (Brands, Categories): High cache TTL (24h).
    *   Dynamic elements (Deals, Products): Lower cache TTL (1h) or on-demand revalidation.

### 4.3. Performance & SEO
*   **LCP:** Hero image 1 must use `priority` attribute.
*   **CLS:** All images must have explicit width/height ratios to prevent layout shifts.
*   **Metadata:** Rich meta title/description focusing on "Water Purifier Service & Sales".

---

## 5. Accessibility & UX
*   **Carousel:** Must support keyboard navigation (Left/Right arrows). Pause on hover.
*   **Color Contrast:** Text on image overlays must use scrims or heavy shadows for readability.
*   **Touch Targets:** All buttons must be >44px height for mobile tapping.

---

## 6. Future Roadmap
*   **Personalization:** Show different hero banners if user is returning vs new.
*   **Geo-Location:** "Technicians available near [User City]" dynamic banner.
*   **Live Sales:** Real-time "Someone in Mumbai just bought X" notifications.
