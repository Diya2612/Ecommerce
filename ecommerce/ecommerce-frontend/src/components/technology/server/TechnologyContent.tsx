import { getTechnologies } from '@/lib/data/technology';
import { TechnologyCard } from './TechnologyCard';

/**
 * TechnologyContent - Server Component
 * 
 * Main content area that fetches and renders all technology cards.
 * Uses server-side data fetching with React cache() for deduplication.
 */
export async function TechnologyContent() {
    const technologies = await getTechnologies();

    return (
        <section className="py-16 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-12">
                    {technologies.map((technology, index) => (
                        <TechnologyCard
                            key={technology.id}
                            technology={technology}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
