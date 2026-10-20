import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/utils/logger";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error("Uncaught error:", { error, errorInfo });
    }

    public handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Optional: Attempt to recover by reloading the page if strictly necessary
        // window.location.reload(); 
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-gray-50 rounded-lg border border-gray-200 m-4">
                    <div className="bg-red-50 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                        We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw size={16} />
                            Reload Page
                        </Button>

                        <Button
                            onClick={this.handleReset}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Try Again
                        </Button>
                    </div>

                    {import.meta.env.MODE === 'development' && this.state.error && (
                        <div className="mt-8 p-4 bg-gray-100 rounded text-left w-full max-w-2xl overflow-auto text-xs font-mono text-gray-700">
                            <p className="font-bold text-red-600 mb-2">{this.state.error.toString()}</p>
                            <pre>{this.state.error.stack}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
