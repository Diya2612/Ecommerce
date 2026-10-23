import { Suspense } from 'react';
import { Metadata } from 'next';
import { CollectionsClient } from './CollectionsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collections | Ecommerce Store',
  description: 'Browse our full collection of custom merchandise, apparel, corporate gifts, visiting cards, drinkware, and packaging.',
};

function CollectionsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-pulse">
      <div className="h-20 bg-slate-100 border-b border-slate-200" />
      <div className="h-64 bg-slate-900" />
      <div className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-80 bg-slate-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<CollectionsLoading />}>
      <CollectionsClient />
    </Suspense>
  );
}
