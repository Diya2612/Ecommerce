/**
 * Blog TypeScript Interfaces
 *
 * Type definitions for blog data fetched from the backend.
 */

// ============================================
// BLOG POST (List View)
// ============================================

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    featured?: boolean;
    tags: string[];
}

// ============================================
// BLOG DETAIL (Full Content)
// ============================================

export interface BlogDetail extends BlogPost {
    content: string;
    quote?: string;
    metaTitle?: string;
    metaDescription?: string;
    viewsCount: number;
    subsections?: BlogSubsection[];
}

// ============================================
// BLOG SUBSECTION
// ============================================

export interface BlogSubsection {
    id: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    sortOrder: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface BlogListResponse {
    data: BlogPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BlogDetailResponse {
    data: BlogDetail;
    message: string;
}
