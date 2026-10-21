import { cache } from 'react';
import type { BlogPost } from '@/types/blog';

/**
 * Fetches all public blog posts from the backend
 * Server-side only with React cache
 */
export const getAllBlogs = cache(async (): Promise<BlogPost[]> => {
    const apiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        console.warn('getAllBlogs: API URL not configured');
        return [];
    }

    try {
        const response = await fetch(`${apiUrl}/blogs?status=public&limit=50`, {
            next: {
                revalidate: 300, // Cache for 5 minutes
                tags: ['blogs', 'blog-list'],
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch blogs: ${response.status}`);
            return [];
        }

        const apiResponse = await response.json();
        const blogs = apiResponse.data || [];

        // Transform backend response to BlogPost type
        return blogs.map((blog: any): BlogPost => ({
            id: blog.id,
            slug: blog.slug,
            title: blog.title,
            excerpt: blog.description || '',
            image: blog.main_image_pc_url || 'https://images.unsplash.com/photo-1544198841-10f34f31f8dd?auto=format&fit=crop&q=80&w=800',
            category: blog.category || 'General',
            author: blog.author || 'Anant Team',
            date: formatDate(blog.published_at || blog.created_at),
            readTime: calculateReadTime(blog.content),
            featured: blogs.indexOf(blog) === 0, // First blog is featured
            tags: Array.isArray(blog.tags) ? blog.tags : [],
        }));
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return [];
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
    const minutes = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

    return `${minutes} min read`;
}
