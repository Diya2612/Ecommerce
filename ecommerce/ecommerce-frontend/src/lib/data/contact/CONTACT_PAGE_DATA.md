# Contact Page - Content Data Specification
**Status:** Live / Hardcoded Data
**Last Updated:** January 10, 2026
**Source:** `src/lib/data/contact/*.ts`

This document details the exact text, content, and configuration data currently implemented in the Contact Page data layer.

---

## 1. Quick Info (Banner)
**Source File:** `getQuickContactInfo.ts`

| Type | Title | Value | Subtitle | Icon |
|------|-------|-------|----------|------|
| **Phone** | Call Us | `1800-XXX-XXXX` | Toll Free | Phone |
| **Email** | Email Us | `support@anant.com` | 24/7 Support | Mail |
| **Location** | Visit Us | `500+ Centers` | Nationwide | MapPin |
| **Hours** | Working Hours | `Mon-Sat 9-6` | Sunday 10-4 | Clock |

---

## 2. Booking Services
**Source File:** `getBookingServices.ts`

These are the options available in the "Book a Service" section.

| ID | Title | Description | Theme Color | Icon |
|----|-------|-------------|-------------|------|
| `installation` | **Installation** | Professional setup at your doorstep | Blue (`#0B1F51`) | Home |
| `amc` | **AMC Service** | Annual maintenance contract | Cyan (`#00C4CC`) | CheckCircle |
| `repair` | **Repair** | Quick fix for any issues | Amber (`#F5B012`) | Wrench |
| `filter` | **Filter Replacement** | Genuine parts & accessories | Purple (`#8B5CF6`) | Package |

---

## 3. Support Channels
**Source File:** `getContactChannels.ts`

| Channel | Primary Info | Secondary Info | Description | Action |
|---------|--------------|----------------|-------------|--------|
| **Phone** | `1800-XXX-XXXX` | Toll Free (24/7) | Speak directly with our support team | Call Now |
| **Live Chat** | `Available Now` | Average response: 2 min | Get instant help from our chat team | Start Chat |
| **Email** | `support@anant.com` | Response within 24 hours | Send us detailed queries anytime | Send Email |
| **WhatsApp** | `+91 XXXXX XXXXX` | Quick assistance | Chat with us on WhatsApp | Message Us |

---

## 4. Office Locations
**Source File:** `getOfficeLocations.ts`

| City | Address | Email |
|------|---------|-------|
| **Mumbai** | 123 Water Park, Andheri East, Mumbai - 400069 | `mumbai@anant.com` |
| **Delhi** | 456 Pure Street, Connaught Place, New Delhi - 110001 | `delhi@anant.com` |
| **Bangalore** | 789 Tech Avenue, Koramangala, Bangalore - 560034 | `bangalore@anant.com` |
| **Chennai** | 321 Marine Drive, T Nagar, Chennai - 600017 | `chennai@anant.com` |

---

## 5. Social Media Links
**Source File:** `getSocialLinks.ts`

*   **Facebook:** `https://facebook.com/anantenterprises`
*   **Twitter:** `https://twitter.com/anantenterprises`
*   **Instagram:** `https://instagram.com/anantenterprises`
*   **LinkedIn:** `https://linkedin.com/company/anantenterprises`
*   **YouTube:** `https://youtube.com/anantenterprises`

---

## 6. Business Hours
**Source File:** `getBusinessHours.ts`

*   **Weekday:** Monday - Saturday (9:00 AM - 6:00 PM)
*   **Sunday:** Sunday (10:00 AM - 4:00 PM)
*   **Emergency:** Emergency Support (24/7 Available)

---

## 7. Booking Time Slots
**Source File:** `getTimeSlots.ts`

*   9:00 AM - 11:00 AM
*   11:00 AM - 1:00 PM
*   2:00 PM - 4:00 PM
*   4:00 PM - 6:00 PM

---

## 8. Trust Indicators
**Source File:** `getTrustIndicators.ts`

*   🔒 **Secure & Private**
*   ⚡ **Quick Response**
*   ✓ **Verified Experts**
