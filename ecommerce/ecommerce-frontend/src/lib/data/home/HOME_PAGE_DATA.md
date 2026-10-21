# Home Page - Content Data Specification
**Status:** Live / Hardcoded Data
**Last Updated:** January 10, 2026
**Source:** `src/lib/data/home/*.ts`

This document details the exact text, images, and configuration currently implemented in the Home Page data layer.

---

## 1. Hero Carousel
**Source:** `getHeroSlides.ts`

| ID | Alt Text | CTA Text | Link | Image Note |
|----|----------|----------|------|------------|
| 1 | Premium water purifier in modern home kitchen | Book Service | `/services` | Modern Kitchen |
| 2 | Pure mineral water glass in sunlight | View Products | `/products` | Glass of Water |
| 3 | Happy family drinking healthy water | Contact Us | `/contact` | Family |

---

## 2. Partner Brands
**Source:** `getBrands.ts`

*   **Aquaguard:** Premium Protection
*   **Kent:** Mineral RO
*   **Livpure:** Smart Touch
*   **Blue Star:** Corporate Solutions
*   **A.O. Smith:** Hot & Cold
*   **Havells:** Family Care
*   **Pureit:** Advanced Filtration
*   **LG:** True Water

---

## 3. Product Categories
**Source:** `getCategoriesAndUsageTypes.ts`

### By Technology
| Title | Description | Gradient Theme |
|-------|-------------|----------------|
| **RO Purification** | Removes heavy metals & salts | Blue |
| **UV Protection** | Kills 99.9% bacteria | Purple |
| **UF Filtration** | Crystal clear clarity | Teal |
| **Alkaline** | pH Balanced Water | Indigo |
| **Copper Tech** | Infused with goodness | Orange |
| **Hot & Cold** | Instant temperature | Red |

### By Usage Type
| Title | Description | Target |
|-------|-------------|--------|
| **Domestic** | Perfect for modern kitchens & families | Home |
| **Industrial** | High-capacity plants for factories | Factory |
| **Office & Corporate** | Water dispensers for workplaces | Office |

---

## 4. Featured Products
**Source:** `getFeaturedProducts.ts`

| Product Name | Price | Rating | Tags |
|--------------|-------|--------|------|
| **Anant Pure X1** | ₹12,999 | 4.8 ★ | `RO`, `UV`, `UF`, `New` |
| **Copper Ionic Pro** | ₹16,499 | 4.9 ★ | `Alkaline`, `Copper` |
| **SlimFit Under Sink** | ₹14,999 | 4.7 ★ | `Space Saver` |
| **Industrial 50L** | ₹28,999 | 5.0 ★ | `Commercial`, `New` |

---

## 5. Deal of the Day
**Source:** `getCurrentDeal.ts`

**Offer:** Premium AMC Protection
**Description:** Experience zero downtime with our comprehensive maintenance plans. Genuine spares, priority support, and complete peace of mind.
**Price:** ₹5,100 (Orig: ₹8,500) | **Save:** 40% OFF
**Key Features:**
*   Comprehensive Filter Replacement
*   3 Free Preventive Maintenance Visits
*   24/7 Priority Breakdown Support

---

## 6. Testimonials
**Source:** `getTestimonials.ts`

> "The installation was flawless and the water quality is noticeably better. The team at Anant Enterprises is professional and courteous."
> — **Priya Sharma** (Mumbai) | *TDS reduced from 420 to 45*

> "I was looking for a premium RO system for my new apartment. Their product design is sleek and modern, perfect for my kitchen."
> — **Rahul Verma** (Delhi) | *Perfect installation in 24hrs*

> "Excellent after-sales service. The technician arrived on time for the first service and did a thorough job. Highly recommended."
> — **Anita Desai** (Bangalore) | *Zero maintenance issues*

> "Industrial grade quality for our office. We installed 3 units and they have been working perfectly for over a year now."
> — **Vikram Singh** (Hyderabad) | *30% cost savings*
