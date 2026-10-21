# Terms & Conditions Page - Functional Requirements & Specifications

## 1. Executive Summary
The "Terms & Conditions" page is a legally binding document that defines the relationship between Anant Enterprises and its users. It establishes the rules for using the website, purchasing products, and subscribing to Annual Maintenance Contracts (AMC). The page is designed for readability and easy navigation to ensure users can quickly find relevant legal information.

**Document Status:** Draft
**Target Audience:** Legal Team, Development Team, Stakeholders
**Last Updated:** January 10, 2026

---

## 2. Core Objectives
1.  **Legal Protections:** clearly limit liability and define the scope of services provided.
2.  **Transparency:** Explain payment, refund, and cancellation policies in simple terms.
3.  **User Guidance:** Set expectations for account management and service delivery (AMC).
4.  **Accessibility/Navigation:** Use a Table of Contents (TOC) to make long-form legal text digestible.

---

## 3. Page Structure & Section Requirements

### 3.1. Hero Section (Banner)
*   **Requirement:** Simple, authoritative header.
*   **Content:** Title "Terms & Conditions" and a brief "Last Updated" date.
*   **Design:** Clean, distraction-free background.

### 3.2. Two-Column Layout
*   **Sidebar (Left/Top on Mobile):**
    *   **Component:** `TermsTableOfContents`
    *   **Behavior:** Sticky positioning on desktop for easy navigation.
    *   **Functionality:** Jump-links to specific sections (hash navigation).
*   **Main Content (Right):**
    *   **Component:** `TermsContent`
    *   **Structure:** Linear list of legal sections (1, 2, 3...) corresponding to the TOC.

### 3.3. Legal Sections
*   **Requirement:** Distinct blocks of text for each legal topic.
*   **Key Sections:**
    *   **Agreement:** General acceptance of terms.
    *   **Services & AMC:** Specific rules for maintenance contracts and service visits.
    *   **Accounts:** User responsibilities for password security.
    *   **Payments:** Accepted methods and refund policies.
    *   **Liability:** Legal disclaimers.
*   **Visual Enhancements:** Icons for each section header to improve scanability.

### 3.4. Footer Contact
*   **Requirement:** Direct line for legal inquiries.
*   **Content:** "Questions about these terms?" followed by Legal Email and Phone.

---

## 4. Technical Requirements

### 4.1. Framework & Architecture
*   **Framework:** Next.js 14+ (App Router).
*   **Rendering Strategy:** Server-Side Rendering (SSR).
*   **Components:**
    *   `TermsTableOfContents`: Client Component (for active state highlighting) or Server Component with simple anchors.
    *   `TermsContent`: Server Component (fetches terms text).

### 4.2. Data Integration
*   **Source:** `src/lib/data/terms/`
*   **Endpoints:**
    *   `getTermsSections`: Returns full text content.
    *   `getTableOfContents`: Returns list of {id, title} for the sidebar.
    *   `getTermsContactInfo`: Returns legal contact details.
*   **Caching:** Long-term caching (24h+). Legal text rarely changes.

### 4.3. SEO & Metadata
*   **Title:** "Terms & Conditions | Anant Enterprises"
*   **Description:** Summary of key policies (AMC, Refunds).
*   **Robots:** Indexable (important for trust signals), but typically low priority for ranking.

---

## 5. Accessibility & UX Requirements
*   **Navigation:**
    *   Sidebar links must be keyboard accessible.
    *   Active section highlighting (scroll spy) is recommended for better UX.
*   **Readability:**
    *   High contrast text.
    *   Well-spaced paragraphs.
    *   "Highlights" or "Important" boxes for critical info (like refund deadlines).

---

## 6. Future Roadmap
*   **PDF Download:** Button to download the Terms as a PDF file.
*   **Version History:** Archive of previous terms versions.
*   **Acceptance Tracking:** For logged-in users, tracking when they accepted the terms.
