import { cache } from 'react';
import type { BlogDetail } from '@/types/blog';

/**
 * Fetches a single blog post by slug from the backend
 * Server-side only with React cache
 */
export const getBlogBySlug = cache(async (slug: string): Promise<BlogDetail | null> => {
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        console.warn(`getBlogBySlug: API URL not configured for slug: ${slug}`);
        return null;
    }

    try {
        const response = await fetch(`${apiUrl}/blogs/slug/${slug}`, {
            next: {
                revalidate: 300, // Cache for 5 minutes
                tags: ['blogs', `blog-${slug}`],
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            console.error(`Failed to fetch blog by slug ${slug}: ${response.status}`);
            return null;
        }

        const apiResponse = await response.json();
        const blog = apiResponse.data;

        if (!blog) return null;

        // Transform backend response to BlogDetail type
        return {
            id: blog.id,
            slug: blog.slug,
            title: blog.title,
            excerpt: blog.description || '',
            content: blog.content || '',
            quote: blog.quote || null,
            image: blog.main_image_pc_url || 'https://images.unsplash.com/photo-1544198841-10f34f31f8dd?auto=format&fit=crop&q=80&w=800',
            category: blog.category || 'General',
            author: blog.author || 'Anant Team',
            date: blog.formattedDate || formatDate(blog.published_at || blog.created_at),
            readTime: blog.readTime || calculateReadTime(blog.content),
            tags: Array.isArray(blog.tags) ? blog.tags : [],
            metaTitle: blog.meta_title || blog.title,
            metaDescription: blog.meta_description || blog.description,
            viewsCount: blog.views_count || 0,
            subsections: blog.subsections?.map((sub: any) => ({
                id: sub.id,
                title: sub.title,
                description: sub.description,
                imageUrl: sub.image_url,
                sortOrder: sub.sort_order,
            })) || [],
        };
    } catch (error) {
        console.error(`Error fetching blog by slug ${slug}:`, error);
        return null;
    }
});

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
    if (!dateString) return 'Unknown date';

    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    } catch {
        return 'Unknown date';
    }
}

/**
 * Calculate read time based on content length
 */
function calculateReadTime(content: string | null): string {
    if (!content) return '1 min read';

    // Strip HTML tags and count words
    const text = content.replace(/<[^>]*>/g, ' ');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));

    return `${minutes} min read`;
}
