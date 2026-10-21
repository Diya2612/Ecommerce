import { CollectionCTAClient } from "../client/CollectionCTAClient";


/**
 * CollectionCTASection - Server Component Shell
 * 
 * Renders the static structure and imports client island
 * for interactive content (motion animations, router, etc.)
 */
export function CollectionCTASection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <CollectionCTAClient />
            </div>
        </section>
    );
}
