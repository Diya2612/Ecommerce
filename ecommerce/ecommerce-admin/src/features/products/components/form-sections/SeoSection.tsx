import { SeoFormSection } from '@/components/forms';

interface SeoSectionProps {
  readOnlyUrl?: boolean;
}

export function SeoSection({ readOnlyUrl }: SeoSectionProps) {
  return (
    <SeoFormSection
      resourcePath="products"
      readOnlyUrl={readOnlyUrl}
      title="SEO & URL"
    />
  );
}
