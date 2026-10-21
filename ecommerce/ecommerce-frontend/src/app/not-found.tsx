import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, MoveLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-6 max-w-md mx-auto">
        {/* Abstract decoration */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-teal-100 dark:bg-teal-900/30 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-slate-950 rounded-full border-2 border-gray-100 dark:border-slate-800 shadow-xl">
            <span className="text-4xl font-bold bg-gradient-to-r from-[#0B1F51] to-[#00C4CC] bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F51] dark:text-white">
            Page not found
          </h1>
          <p className="text-gray-500 dark:text-slate-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto gap-2 bg-[#0B1F51] hover:bg-[#0B1F51]/90 rounded-xl">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2 rounded-xl border-gray-200 dark:border-slate-800">
            <Link href="/collections">
              <MoveLeft className="w-4 h-4" />
              View Collections
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
