# AMC Page - Functional Requirements & Specifications

## 1. Executive Summary
The "Annual Maintenance Contract" (AMC) page is a product comparison page designed to upsell maintenance packages for water purifiers. Its primary goal is to clearly differentiate between the service tiers (Basic, Gold, Platinum) and drive users towards the "Gold Protection" plan using behavioral design patterns (anchoring, distinct visual hierarchy).

**Document Status:** Draft
**Target Audience:** Development Team, Marketing Team
**Last Updated:** January 10, 2026

---

## 2. Core Objectives
1.  **Upselling:** Encourage existing product owners to subscribe to recurring maintenance revenue streams.
2.  **Comparison:** Provide a clear, "at-a-glance" comparison of what is and isn't included in each tier (especially spares and membranes).
3.  **Clarity:** Eliminate confusion regarding hidden costs (e.g., "Are filters included?").
4.  **Conversion:** Drive traffic to the Contact/Booking flow to finalize the contract.

---

## 3. Page Structure & Section Requirements

### 3.1. Hero Section
*   **Requirement:** Emotional hook and clear value proposition.
*   **Content:**
    *   Badge: "ANNUAL MAINTENANCE CONTRACTS"
    *   Headline: "Protect Your Purity."
    *   Subtext: "Guarantees clean water all year round. Expert service, genuine parts, and zero stress."
*   **Animation:** Smooth fade-in (`motion.div`) for entry.

### 3.2. Plans Comparison Grid
*   **Requirement:** Side-by-side card layout.
*   **Responsive Behavior:** Stacked single column on mobile, 3-column comparing grid on tablet/desktop.
*   **Card Components:**
    *   **Header:** Plan Name, Price (large font), Period ("/ year"), Short Description.
    *   **Features List:** Green checkmarks for included items.
    *   **Exclusions List:** Red cross/Grayed text for explicitly excluded items (crucial for expectation management).
    *   **CTA Button:** Deep link to contact form with pre-selected subject.
*   **"Popular" Highlight:**
    *   The "Gold Protection" plan must be visually distinct (scaled up, shadow, distinct border color, "Most Popular" badge).

### 3.3. FAQ Call-to-Action
*   **Requirement:** Address lingering doubts without cluttering the main pricing view.
*   **Content:** "Have questions about AMC?"
*   **Actions:**
    *   Primary: "View FAQs" (Internal Link).
    *   Secondary: "Contact Sales" (Internal Link).

---

## 4. Technical Requirements

### 4.1. Framework & Architecture
*   **Framework:** Next.js 14+ (App Router).
*   **Rendering Strategy:** Server-Side Rendering (SSR) for initial paint.
*   **Interactivity:** `framer-motion` for entry animations on cards.

### 4.2. Data Integration
*   **Source:** `src/lib/data/amc/getAMCPlans.ts`
*   **Data Model:** `AMCPlan` interface.
    *   `popular: boolean` flag determines visual emphasis.
    *   `notIncluded: string[]` array triggers the "Not Included" section in the card.
*   **Caching:** Static content should be cached heavily (24h+).

### 4.3. UI/Theming
*   **Colors:**
    *   Basic: Blue (`bg-blue-50`)
    *   Gold (Popular): Cyan/Teal (`border-[#31CDD4]`, `bg-[#31CDD4]/10`)
    *   Platinum: Purple (`bg-purple-50`)
*   **Dark Mode:** All cards must have explicit dark mode variants (`dark:bg-slate-950`).

---

## 5. Accessibility & UX Requirements
*   **Contrast:** Ensure pricing text meets WCAG AA standards against card backgrounds.
*   **Focus Management:** "Choose Plan" buttons must be keyboard navigable.
*   **Visual Logic:** "Not Included" items should be clearly visually separated from "Included" items to prevent reading errors.

---

## 6. Future Roadmap
*   **Purchase Integration:** Direct checkout for AMC plans via Razorpay.
*   **Plan Selector:** Toggle for 1-year vs 3-year pricing (discounted).
*   **Compare Table:** Detailed feature matrix below the cards for power users.
