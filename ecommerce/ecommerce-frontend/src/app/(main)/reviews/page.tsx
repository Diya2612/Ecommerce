import { getReviews } from '@/lib/data/reviews';
import { ReviewsGrid } from '@/components/reviews/ReviewsGrid';

// ============================================================================
// Reviews Page - Server Component
// ============================================================================
// Server-rendered customer reviews page with SEO optimization

export default async function ReviewsPage() {
  // Server-side data fetching
  const reviews = await getReviews();

  return (
    <main className="min-h-screen bg-[#F9FBFD] pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F51] mb-6">
            Customer Stories
          </h1>
          <p className="text-xl text-gray-600">
            See what our happy customers have to say about their journey to pure, healthy water.
          </p>
        </div>

        {/* Reviews Grid */}
        <ReviewsGrid reviews={reviews} />
      </div>
    </main>
  );
}
