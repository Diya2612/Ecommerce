# Services Page - Functional Requirements & Specifications

## 1. Executive Summary
The "Services" page acts as a comprehensive catalog of all technical support and maintenance offerings provided by Anant Enterprises. It serves both residential users (home installations, repairs) and commercial clients (corporate RO plants), aiming to position the brand as a full-lifecycle water solutions partner, not just a product seller.

**Document Status:** Draft
**Target Audience:** Development Team, Operations, Sales
**Last Updated:** January 10, 2026

---

## 2. Core Objectives
1.  **Service Discovery:** Allow users to quickly identify their needed service (Installation, Repair, AMC, Filter Change).
2.  **Trust Building:** Highlight certified technicians, genuine parts, and transparent pricing to improved trust.
3.  **Lead Generation:** Capture bookings for on-site visits with clear CTAs for each service type.
4.  **B2B Outreach:** Showcase commercial capabilities to attract bulk orders (offices, hotels).

---

## 3. Page Structure & Section Requirements

### 3.1. Hero Section (`ServiceHero`)
*   **Requirement:** Clear value proposition.
*   **Content:** Headline focusing on "Expert Care" and "24/7 Support".
*   **Visual:** High-quality image of valid service personnel or happy customers.

### 3.2. Service Categories Grid (`ServiceCategories`)
*   **Requirement:** Rapid navigation.
*   **Layout:** 6-card grid with icons.
*   **Categories:**
    1.  Installation
    2.  AMC Plans
    3.  Repair Service
    4.  Filter Replacement
    5.  Commercial RO
    6.  Emergency Support

### 3.3. Installation Services (`InstallationServices`)
*   **Requirement:** Explain the setup process.
*   **Key Features:** same-day service, 1-year warranty.
*   **Process Visual:** 4-step timeline (Site Assessment -> Custom Planning -> Setup -> Quality Testing).

### 3.4. Repair Services (`RepairServices`)
*   **Requirement:** Troubleshoot common issues.
*   **Content:** List of common problems (Low flow, leakage, bad taste) with estimated repair times.
*   **Trust Signals:** "Transparent pricing", "90-day warranty on repairs".

### 3.5. AMC Plans Preview (`AMCServices`)
*   **Requirement:** Tease the full AMC offering.
*   **Structure:** 3-tier pricing cards (Basic, Premium, Elite).
*   **Strategy:** Highlight "Premium Plan" as the value choice with 40% OFF.

### 3.6. Filter Replacement (`FilterReplacement`)
*   **Requirement:** Educate on consumable lifecycles.
*   **Data:** Table or list of filters (Sediment, Carbon, Membrane) with their lifespan and price.
*   **Warning Signs:** Checklist of when to change filters (Bad taste, verify flow).

### 3.7. Commercial Solutions (`CommercialServices`)
*   **Requirement:** Demonstrate B2B scale.
*   **Segments:** Office Buildings, Hotels, Manufacturing, Healthcare.
*   **Proof:** Case Study highlights (Client Name, Type, Capacity, Savings).

### 3.8. Trust/Why Us (`WhyChooseUs`)
*   **Requirement:** Final persuasion block.
*   **Stats:** 50k+ Customers, 15+ Years Exp.
*   **Reasons:** Certified Technicians, Genuine Parts, Transparent Pricing.

---

## 4. Technical Requirements

### 4.1. Framework & Architecture
*   **Framework:** Next.js 14+ (App Router).
*   **Rendering:** Server Components for static content structure.
*   **Interactive Elements:** Client components for any potential booking forms or interactive pricing toggles.

### 4.2. Data Integration
*   **Source:** `src/lib/data/services-data.tsx`
*   **Exports:**
    *   `SERVICE_CATEGORIES`
    *   `INSTALLATION_FEATURES` & `STEPS`
    *   `REPAIR_COMMON_ISSUES`
    *   `AMC_PLANS`
    *   `FILTER_TYPES`
    *   `COMMERCIAL_SOLUTIONS`
    *   `SERVICE_STATS` & `REASONS`
*   **Caching:** Static content is highly cacheable.

### 4.3. Design & UX
*   **Icons:** Extensive use of `lucide-react` icons (Wrench, Shield, Clock) for visual scanning.
*   **Color Coding:** Use specific colors for service types (Teal for Installation, Amber for AMC, Navy for Commercial) to maintain visual distinctiveness.

---

## 5. Accessibility & UX Requirements
*   **Readability:** Tables for filter prices and repair times must be legible on mobile.
*   **CTAs:** Every section should have a specific call to action (e.g., "Book Repair", "Get Quote").
*   **Alt Text:** All descriptive icons and images must have text alternatives.

---

## 6. Future Roadmap
*   **Online Booking:** Real-time calendar slot selection for repairs.
*   **AMC Dashboard:** Login area for users to track their service history.
*   **Video Guides:** DIY troubleshooting videos for minor issues.
