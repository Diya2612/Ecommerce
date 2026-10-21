# System Architecture Analysis - Anant Enterprises Frontend

## 1. High-Level Overview
This project is a modern **Next.js 15** application leveraging the **App Router** architecture. It is built with **TypeScript** for type safety and uses **Tailwind CSS** combined with **shadcn/ui** (Radix UI primitives) for a robust and accessible design system.

The application currently operates as a **client-heavy** frontend with static data sources, utilizing React Context for global state management (Cart, Chat, User Profile) and LocalStorage for persistence.

## 2. Technology Stack

| Layer | Technology | Details |
|-------|------------|---------|
| **Framework** | Next.js 15.5.9 | App Router directory structure |
| **Language** | TypeScript | Strict type checking enabled |
| **Styling** | Tailwind CSS | Utility-first CSS, configured with `tailwindcss-animate` |
| **UI Library** | shadcn/ui | Built on Radix UI primitives, using `cva` for variants |
| **State Management** | React Context | `CartContext`, `ChatContext`, `ProfileContext`, `ThemeContext` |
| **Icons** | Lucide React | Modern, outlined SVG icons |
| **Animation** | Motion (Framer Motion) | Complex UI transitions and entering animations |
| **Notifications** | Sonner | Toast notification system |
| **Carousels** | Embla Carousel / Slick | Product sliders and testimonials |
| **Forms** | React Hook Form | Form state management (dependency present) |

## 3. Directory Structure & Organization

The project follows a **Feature-Based** directory structure inside `src/`.

```
src/
├── app/                 # Next.js App Router
│   ├── (main)/          # Route Group for main layout pages
│   │   ├── page.tsx     # Homepage
│   │   └── ...          # Feature routes (about/cart/etc)
│   ├── layout.tsx       # Root Layout (Providers + HTML shell)
│   └── globals.css      # Component-independent global styles
├── components/          # React Components
│   ├── ui/              # Atomic primitives (Button, Badge, Dialog - shadcn)
│   ├── home/            # Homepage-specific widgets
│   ├── cart/            # Cart specific components
│   ├── common/          # Shared molecules (ScrollToTop, etc.)
│   └── layout/          # Layout blocks (Header, Footer, ClientLayout)
├── contexts/            # Global State Logic (Providers)
├── data/                # Static/Mock data files
├── hooks/               # Custom React hooks
└── lib/                 # Utilities (cn, utils)
```

### Key Structural Decisions:
*   **Route Groups `(main)`**: Used to organize routes without affecting the URL structure, likely to share specific layouts or middleware in the future.
*   **Feature Folders**: Components are not just dumped in one folder but organized by their domain (`home`, `cart`, `chat`), making the codebase scalable.
*   **Atomic UI**: The `components/ui` folder contains low-level, reusable "atoms" (Buttons, Inputs), while feature folders contain "molecules" and "organisms".

## 4. Component Architecture

### The `Providers` Pattern
A core `Providers.tsx` component wraps the entire application. This effectively implements the "Singleton" pattern for frontend state, ensuring contexts are available globally.

**Hierarchy:**
`Top Level`: `ThemeProvider` -> `ProfileProvider` -> `CartProvider` -> `ChatProvider` -> `Toaster` -> `Children` (App).

### Layout Pattern
*   **`RootLayout`**: Handles the generic HTML structure (fonts, metadata) and injects `Providers`.
*   **`ClientLayout`**: A client-side wrapper that manages the "shell" of the application:
    *   **Header & Footer**: Persistent navigation.
    *   **Global Drawers**: `CartDrawer` and `ChatDrawer` are placed here to be accessible from anywhere without traversing the DOM or remounting on navigation.
    *   **Floating Actions**: Floating buttons for Cart/Chat are positioned here relative to the viewport.

### UI Component Strategy
*   **Stateless UI**: Components in `components/ui` are largely stateless and controlled via props (Presentational Components).
*   **Smart Containers**: Feature components (e.g., `FeaturedProducts`) handle their own logic (animations, local interactions) and connect to global contexts (`useCart`).

## 5. Data Flow & State Management

### Global State (Context API)
Instead of a heavy library like Redux, simple React Contexts are used.
1.  **CartContext**:
    *   Manages `cartItems` array.
    *   **Persistence**: Automatically syncs to `localStorage` key `anant-cart` on every change.
    *   **Logic**: `addToCart`, `removeFromCart`, `updateQuantity`, `totalPrice` calculation.
2.  **ProfileContext**:
    *   Likely manages user authentication state and potential wishlist data (seen usage in `FeaturedProducts`).
3.  **ChatContext**:
    *   Controls the visibility state of the global Chat Drawer.

### Data Strategy
*   **Current State**: Static embedded data.
    *   Example: `FeaturedProducts.tsx` contains a `const PRODUCTS` array.
    *   This "Mock Data" pattern usually precedes API integration.
*   **Future Scalability**: To connect a backend, these internal `const` arrays would be replaced by `useEffect` fetching or Server Component data fetching (`await fetch(...)` in `page.tsx`).

## 6. Design System & Theming

*   **Tailwind CSS**: The engine for styling.
*   **CSS Variables**: Used for theme tokens (colors, radius). This allows for easy switching between Light/Dark modes (handled by `next-themes`).
*   **Typography**: Geist Sans/Mono configured in `layout.tsx`.
*   **Responsive Design**: Mobile-first patterns visible (e.g., Grid on desktop vs Carousel on mobile for `FeaturedProducts`).

## 7. Recommendations for scaling

1.  **Refactor Mock Data**: Move all `const PRODUCTS` arrays out of components and into strict Typescript files in `src/data` or distinct JSON files to mimic a database.
2.  **Server Components**: Move data fetching up to the `page.tsx` level (Server Components) and pass data down as props. This leverages Next.js caching and SEO benefits.
3.  **Type Centralization**: Move interfaces like `CartItem` and `Product` to a centralized `src/types` folder to avoid circular dependency issues and duplication.
