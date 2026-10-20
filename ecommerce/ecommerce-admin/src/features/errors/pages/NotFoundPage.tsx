import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-md text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-slate-300">404</h1>
                </div>

                {/* Error Message */}
                <h2 className="mb-3 text-3xl font-semibold text-slate-900">
                    Page Not Found
                </h2>
                <p className="mb-8 text-slate-600">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild size="lg" className="rounded-xl">
                        <Link to="/">
                            <Home className="mr-2 size-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-xl">
                        <Link to="/products">
                            <Search className="mr-2 size-4" />
                            Browse Products
                        </Link>
                    </Button>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-sm text-slate-500">
                    Need help?{" "}
                    <Link to="/help" className="text-indigo-600 hover:underline">
                        Contact Support
                    </Link>
                </p>
            </div>
        </div>
    );
}
