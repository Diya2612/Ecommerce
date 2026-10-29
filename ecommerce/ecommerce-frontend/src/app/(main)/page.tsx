'use client';

import dynamic from 'next/dynamic';

const SuvarnaStorefront = dynamic(
  () => import('@/components/suvarna/SuvarnaStorefront'),
  { ssr: false }
);

export default function EcommerceHomePage() {
  return <SuvarnaStorefront />;
}
