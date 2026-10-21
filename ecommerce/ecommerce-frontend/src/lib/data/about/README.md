# About Page Data Layer

This directory contains server-side data fetching functions for the About page.
Each function is designed to be called from Server Components only.

## Architecture

```
about/
├── index.ts              # Barrel file - exports all fetchers
├── getMilestones.ts      # Our Story section timeline
├── getMissionItems.ts    # Mission, Vision, Philosophy
├── getValues.ts          # Core values (6 items)
├── getTeamMembers.ts     # Leadership team (4 members)
├── getTestimonials.ts    # Customer testimonials (6 reviews)
├── getFeaturedProducts.ts # Featured products (4 products)
├── getContactInfo.ts     # Quick info + Contact methods
└── README.md             # This file
```

## Usage

```tsx
import { getMilestones, getTeamMembers } from '@/lib/data/about';

export async function OurStorySection() {
  const milestones = await getMilestones();
  
  return (
    <section>
      {milestones.map(milestone => (
        <div key={milestone.year}>{milestone.title}</div>
      ))}
    </section>
  );
}
```

## Features

- **React cache()**: All functions use `cache()` for request deduplication
- **Type Safety**: Full TypeScript support via `@/types/about`
- **API Ready**: Commented code for backend integration when available
- **Error Handling**: Graceful fallbacks to empty arrays on errors


## Data Sources

| Fetcher | Original Component | Records |
|---------|-------------------|---------|
| `getMilestones` | OurStory.tsx | 4 milestones |
| `getMissionItems` | OurMission.tsx | 3 items |
| `getValues` | OurValues.tsx | 6 values |
| `getTeamMembers` | OurTeam.tsx | 4 members |
| `getAboutTestimonials` | AboutTestimonials.tsx | 6 reviews |
| `getAboutFeaturedProducts` | AboutFeaturedProducts.tsx | 4 products |
| `getQuickContactInfo` | AboutCTA.tsx | 3 items |
| `getContactMethods` | AboutCTA.tsx | 3 methods |

## Backend Integration

Each fetcher includes commented code for API integration:

```tsx
// When backend is ready, uncomment:
const response = await fetch(
  `${process.env.API_BASE_URL}/about/milestones`,
  {
    next: {
      revalidate: 86400, // Cache for 24 hours
      tags: ['about-milestones'],
    },
  }
);
```

## Cache Strategies

| Data Type | Suggested Revalidation |
|-----------|----------------------|
| Team Members | 24 hours (static) |
| Milestones | 24 hours (static) |
| Values | 7 days (rarely changes) |
| Testimonials | 1 hour (occasionally updated) |
| Products | 1 hour (inventory changes) |
| Contact Info | 24 hours (static) |

## Related Files

- **Types**: `src/types/about.ts`
- **Server Components**: `src/components/about/server/`
- **Client Islands**: `src/components/about/client/`
