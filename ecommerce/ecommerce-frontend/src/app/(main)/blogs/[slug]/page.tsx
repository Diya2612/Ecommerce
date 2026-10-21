import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBlogBySlug } from '@/lib/data/blog';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Not Found | Anant Enterprises',
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
      {/* Hero Image */}
      <div className="w-full h-[400px] md:h-[500px] relative mb-12">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white container mx-auto">
          <Link href="/blogs" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Link>
          <Badge className="bg-[#00C4CC] border-none text-white mb-4 block w-fit">{post.category}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight max-w-4xl">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-white/90">
            <span className="flex items-center gap-2"><User className="w-4 h-4" /> {post.author}</span>
            <span className="w-1 h-1 bg-white/50 rounded-full" />
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {post.date}</span>
            <span className="w-1 h-1 bg-white/50 rounded-full" />
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {post.readTime}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <article className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>

          {/* Tags & Share */}
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium text-sm">Share this article:</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600"><Facebook className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-sky-50 hover:text-sky-500"><Twitter className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-700"><Linkedin className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100"><Share2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gray-50 dark:bg-slate-900 rounded-card p-8 border border-gray-100 dark:border-slate-800 sticky top-32">
            <h3 className="text-lg font-bold text-[#0B1F51] dark:text-white mb-4">Newsletter</h3>
            <p className="text-gray-500 mb-4 text-sm">Subscribe to get the latest updates and health tips directly in your inbox.</p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-[#00C4CC]/20 focus:border-[#00C4CC]"
              />
              <Button className="w-full bg-[#0B1F51] hover:bg-[#00C4CC] text-white rounded-xl">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
