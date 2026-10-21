import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getAllBlogs } from '@/lib/data/blog';
import type { BlogPost } from '@/types/blog';

export default async function BlogsPage() {
  const blogPosts = await getAllBlogs();

  const featuredPost = blogPosts.find(post => post.featured);
  const otherPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <Badge variant="outline" className="border-[#00C4CC] text-[#00C4CC] px-4 py-1.5 text-sm uppercase tracking-wider font-semibold">
            Our Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F51] dark:text-white leading-tight">
            Latest News & <span className="text-[#00C4CC]">Articles</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Stay updated with the latest insights on water purification, health tips, and product guides.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <Link href={`/blogs/${featuredPost.slug}`} className="group block">
              <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300">
                <div className="aspect-16/10 md:h-full relative overflow-hidden">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-[#00C4CC] hover:bg-[#00A0A8] text-white border-none px-3 py-1.5 text-sm font-semibold">
                      Featured
                    </Badge>
                  </div>
                </div>
                <div className="p-8 md:p-12 space-y-6">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {featuredPost.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-[#0B1F51] dark:text-white group-hover:text-[#00C4CC] transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-500 text-lg line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#0B1F51] font-bold">
                        {featuredPost.author[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F51] dark:text-white">{featuredPost.author}</p>
                        <p className="text-xs text-gray-400">Author</p>
                      </div>
                    </div>
                    <span className="flex items-center text-[#00C4CC] font-semibold group-hover:translate-x-2 transition-transform">
                      Read Article <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Recent Posts Grid */}
        {otherPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((post) => (
              <Link key={post.id} href={`/blogs/${post.slug}`} className="group">
                <article className="bg-white dark:bg-slate-900 rounded-card border border-gray-100 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-16/10 relative overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-[#0B1F51] hover:bg-white border-none backdrop-blur-xs shadow-xs">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F51] dark:text-white mb-3 group-hover:text-[#00C4CC] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">By {post.author}</span>
                      </div>
                      <span className="flex items-center text-sm text-[#00C4CC] font-medium group-hover:translate-x-1 transition-transform">
                        Read <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
