# Contact Page - Functional Requirements & Specifications

## 1. Executive Summary
The "Contact Us" page is the primary conversion point for service bookings, inquiries, and customer support. It is designed to facilitate immediate user action through a streamlined interface for booking services (Installation, AMC, Repair) and providing clear access to support channels.

**Document Status:** Draft
**Target Audience:** Development Team, Stakeholders
**Last Updated:** January 10, 2026

---

## 2. Core Objectives
1.  **Lead Generation:** Simplify the process for users to book essential services (Installation, AMC, Repair).
2.  **Customer Support:** Provide instant access to support channels (Phone, Chat, Email, WhatsApp).
3.  **Trust & Verification:** reassuring users with secure booking indicators and official office locations.
4.  **Local SEO:** Highlight regional presence with office addresses and service centers.

---

## 3. Page Structure & Section Requirements

### 3.1. Hero Section (Banner)
*   **Requirement:** Instant visibility of critical contact points.
*   **Content:**
    *   Headline: "We're here to help"
    *   Subtext: "Get in touch with Anant Enterprises"
    *   Quick Info Cards: Phone, Email, Location, Hours.
*   **Functionality:** Server-rendered for immediate LCP.

### 3.2. Book Service Section (`BookNowSection`)
*   **Requirement:** Self-service booking for customers.
*   **Services Offered:**
    *   Installation
    *   AMC Service
    *   Repair
    *   Filter Replacement
*   **UI/UX:** Card-based selection with distinct iconography and color coding.

### 3.3. Booking Form (`EnterDetailsSection`)
*   **Requirement:** Capture user details for service requests.
*   **Fields:** Name, Phone, Service Type, Preferred Time Slot.
*   **Trust Indicators:** "Secure & Private", "Quick Response", "Verified Experts".
*   **Validation:** Client-side validation for phone numbers and required fields.

### 3.4. Contact Channels (`ContactUsSection`)
*   **Requirement:** Alternative communication methods for non-booking inquiries.
*   **Channels:**
    *   Phone (Toll-Free)
    *   Live Chat
    *   Email Support
    *   WhatsApp Business
*   **Actions:** Direct links (`tel:`, `mailto:`, `wa.me`).

### 3.5. Regional Presence
*   **Requirement:** Demonstrate physical presence and scale.
*   **Content:** List of regional offices (Mumbai, Delhi, Bangalore, Chennai).
*   **Data:** Address, Phone, Email for each location.

---

## 4. Technical Requirements

### 4.1. Framework & Architecture
*   **Framework:** Next.js 14+ (App Router).
*   **Rendering Strategy:** Server-Side Rendering (SSR) for initial load, Client Islands for interactivity.
*   **Components:**
    *   Server: `ContactBannerSection`, `BookNowSection`, `ContactUsSection` (wrapping client islands).
    *   Client: Interactive form elements (`EnterDetailsClient`), Map/Carousel interactions.

### 4.2. Data Integration
*   **Source:** `src/lib/data/contact/`
*   **Endpoints:**
    *   `getBookingServices`: Service types.
    *   `getTimeSlots`: Booking availability.
    *   `getContactChannels`: Support methods.
    *   `getOfficeLocations`: Address data.
*   **Caching:** High cache duration (24h+) for static contact info; dynamic fetching for time slots (future scope).

### 4.3. SEO & Metadata
*   **Title:** "Contact Us | Anant Enterprises - Water Purifier Support & Services"
*   **Keywords:** water purifier service, RO repair, AMC, customer care number.
*   **Structured Data (JSON-LD):**
    *   `LocalBusiness`: For office locations.
    *   `ContactPoint`: For customer support numbers.

---

## 5. Accessibility & UX Requirements
*   **Forms:**
    *   Clear labels and error messages.
    *   Keyboard navigation support (Tab ordering).
    *   Mobile-optimized input fields (`type="tel"`, `type="email"`).
*   **Responsiveness:**
    *   Stackable layouts for mobile.
    *   Touch-friendly buttons (>44px).
*   **Loading States:**
    *   Skeleton loaders for form and service grids to prevent CLS.

---

## 6. Future Roadmap
*   **Real-time Scheduling:** Integration with backend CRM for live slot availability.
*   **Map Integration:** Interactive Google Maps for office locator.
*   **Chatbot:** AI-driven text support overlay.
