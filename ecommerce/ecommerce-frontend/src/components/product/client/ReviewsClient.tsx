'use client';

import { motion, AnimatePresence } from 'motion/react';
import Image from "next/image";
import { Star, ThumbsUp, User, CheckCircle2, Shield, ImagePlus, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { SectionHeader } from '@/components/shared/SectionHeader';
import type { ProductReview, ReviewsClientProps } from '@/types/product';

/**
 * ReviewsClient - Client Component
 * 
 * Exact UI match of original ProductReviews but receives data as props
 */
export function ReviewsClient({
    initialReviews,
    totalReviews,
    averageRating = 4.8
}: ReviewsClientProps) {
    // State
    const [reviews, setReviews] = useState(initialReviews || []);
    const [sortBy, setSortBy] = useState('most-helpful');
    const [votedReviews, setVotedReviews] = useState<Set<number>>(new Set());
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Modals State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportingReviewId, setReportingReviewId] = useState<number | null>(null);

    // New Review Form State
    const [newReview, setNewReview] = useState({
        rating: 0,
        title: '',
        content: '',
        images: [] as string[]
    });
    const [hoverRating, setHoverRating] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
    const [dragWidth, setDragWidth] = useState(0);

    // Sorting Logic
    const sortedReviews = useMemo(() => {
        if (!reviews || reviews.length === 0) return [];
        const sorted = [...reviews];
        switch (sortBy) {
            case 'most-helpful':
                return sorted.sort((a, b) => b.helpful - a.helpful);
            case 'newest':
                return sorted.sort((a, b) => {
                    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return dateB - dateA;
                });
            case 'highest-rating':
                return sorted.sort((a, b) => b.rating - a.rating);
            default:
                return sorted;
        }
    }, [reviews, sortBy]);

    const displayedReviews = sortedReviews.slice(0, visibleReviewsCount);

    // Safely calculate drag constraints after mount
    useEffect(() => {
        const updateWidth = () => {
            setDragWidth(
                (displayedReviews.length - 1) * (window.innerWidth * 0.9 + 16)
            );
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, [displayedReviews.length]);

    // Calculate rating distribution
    const ratingDistribution = useMemo(() => {
        const dist = [
            { stars: 5, percentage: 72, count: 246 },
            { stars: 4, percentage: 18, count: 62 },
            { stars: 3, percentage: 6, count: 21 },
            { stars: 2, percentage: 3, count: 10 },
            { stars: 1, percentage: 1, count: 3 }
        ];
        return dist;
    }, []);

    // Actions
    const handleLoadMore = () => {
        const loadingPromise = new Promise(resolve => setTimeout(resolve, 800));

        toast.promise(loadingPromise, {
            loading: 'Loading more reviews...',
            success: () => {
                if (visibleReviewsCount >= reviews.length) {
                    const moreMockReviews: ProductReview[] = [
                        {
                            id: Date.now() + 1,
                            author: "Rahul Verma",
                            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
                            rating: 5,
                            date: "2 months ago",
                            timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                            verified: true,
                            title: "Value for money",
                            content: "Great product for the price. The installation was quick and the service engineer was very polite. Water taste is great.",
                            helpful: 12,
                            images: []
                        },
                        {
                            id: Date.now() + 2,
                            author: "Anjali Gupta",
                            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali",
                            rating: 4,
                            date: "2 months ago",
                            timestamp: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
                            verified: true,
                            title: "Good but service could be better",
                            content: "Product is good but I had to wait for 2 days for installation. Otherwise everything works fine.",
                            helpful: 8,
                            images: []
                        }
                    ];
                    setReviews(prev => [...prev, ...moreMockReviews]);
                }
                setVisibleReviewsCount(prev => prev + 3);
                return 'Reviews loaded';
            },
            error: 'Failed to load reviews'
        });
    };

    const handleWriteReviewClick = () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
        } else {
            setShowReviewModal(true);
        }
    };

    const handleHelpfulClick = (reviewId: number) => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }

        setReviews(prev => prev.map(review => {
            if (review.id === reviewId) {
                const hasVoted = votedReviews.has(reviewId);
                const newHelpful = hasVoted ? review.helpful - 1 : review.helpful + 1;

                const newVoted = new Set(votedReviews);
                if (hasVoted) {
                    newVoted.delete(reviewId);
                } else {
                    newVoted.add(reviewId);
                }
                setVotedReviews(newVoted);

                return { ...review, helpful: newHelpful };
            }
            return review;
        }));
    };

    const handleReportClick = (reviewId: number) => {
        setReportingReviewId(reviewId);
        setShowReportModal(true);
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
        setShowLoginModal(false);
        toast.success("Successfully logged in!");
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (newReview.rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        const submission: ProductReview = {
            id: Date.now(),
            author: "You",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
            rating: newReview.rating,
            date: "Just now",
            timestamp: new Date().toISOString(),
            verified: true,
            title: newReview.title,
            content: newReview.content,
            helpful: 0,
            images: newReview.images
        };

        setReviews([submission, ...reviews]);
        setShowReviewModal(false);
        toast.success("Review submitted successfully!");
        setNewReview({ rating: 0, title: '', content: '', images: [] });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newImages = Array.from(files).map(file => URL.createObjectURL(file));
            setNewReview(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        }
    };

    const removeImage = (indexToRemove: number) => {
        setNewReview(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmitReport = () => {
        setShowReportModal(false);
        toast.success("Thank you, we will review this.");
    };

    return (
        <>
            <SectionHeader
                title="Customer Reviews"
                description="See what our customers are saying about this product"
                align="center"
                spacing="normal"
            />

            <div className="grid lg:grid-cols-[350px_1fr] gap-12">
                {/* Left: Rating Overview */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-card border border-black/6 p-8 h-fit lg:sticky lg:top-24"
                >
                    <div className="text-center mb-8">
                        <div className="text-[64px] font-bold text-[#0B1F51] leading-none mb-2">
                            {averageRating}
                        </div>
                        <div className="flex justify-center mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-6 h-6 ${i < Math.floor(averageRating) ? "fill-[#F5B012] text-[#F5B012]" : "text-gray-300"}`}
                                />
                            ))}
                        </div>
                        <p className="text-[16px] text-gray-600 font-medium">
                            Based on {totalReviews} reviews
                        </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-3 mb-8">
                        {ratingDistribution.map((rating) => (
                            <div key={rating.stars} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-12 shrink-0">
                                    <span className="text-[14px] font-medium text-gray-700">{rating.stars}</span>
                                    <Star className="w-3 h-3 fill-[#F5B012] text-[#F5B012]" />
                                </div>
                                <Progress value={rating.percentage} className="flex-1 h-2" />
                                <span className="text-[12px] text-gray-500 w-12 text-right">{rating.count}</span>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={handleWriteReviewClick}
                        className="w-full bg-[#0B1F51] hover:bg-[#152C6B] text-white h-12 rounded-input text-[15px] font-semibold"
                    >
                        Write a Review
                    </Button>

                    {/* Trust Badge */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-[#22C55E] mb-2">
                            <Shield className="w-5 h-5" />
                            <span className="text-[14px] font-semibold">Verified Reviews</span>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed">
                            All reviews are from verified purchasers who have used this product.
                        </p>
                    </div>
                </motion.div>

                {/* Right: Reviews List - Desktop */}
                <div className="hidden lg:block space-y-6">
                    {/* Sort Options */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h3 className="text-[22px] font-semibold text-[#0B1F51]">
                            All Reviews ({totalReviews})
                        </h3>
                        <div className="flex gap-2">
                            {[
                                { label: 'Most Helpful', value: 'most-helpful' },
                                { label: 'Newest', value: 'newest' },
                                { label: 'Highest Rating', value: 'highest-rating' }
                            ].map((option) => (
                                <Button
                                    key={option.value}
                                    variant={sortBy === option.value ? 'default' : 'outline'}
                                    className={`rounded-input h-10 text-[14px] font-medium transition-all shadow-xs ${sortBy === option.value
                                        ? 'bg-[#0B1F51] text-white shadow-md'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setSortBy(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    <AnimatePresence mode='popLayout'>
                        {displayedReviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-card border border-black/6 p-8 hover:shadow-lg transition-all duration-300"
                            >
                                {/* Review Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-12 h-12 border-2 border-gray-100">
                                            <AvatarImage src={review.avatar} alt={review.author} />
                                            <AvatarFallback>
                                                <User className="w-6 h-6 text-gray-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[16px] font-semibold text-[#0B1F51]">{review.author}</span>
                                                {review.verified && (
                                                    <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-none px-2 py-0.5 rounded-[6px] text-[11px] font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating ? "fill-[#F5B012] text-[#F5B012]" : "text-gray-300"}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[12px] text-gray-500">{review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Title */}
                                {review.title && (
                                    <h4 className="text-[18px] font-semibold text-[#0B1F51] mb-3">
                                        {review.title}
                                    </h4>
                                )}

                                {/* Review Content */}
                                <p className="text-[16px] text-gray-700 leading-[150%] mb-4">
                                    {review.content}
                                </p>

                                {/* Review Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-3 mb-4">
                                        {review.images.map((image, imgIndex) => (
                                            <div
                                                key={imgIndex}
                                                className="relative w-24 h-24 rounded-input border border-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`Review ${imgIndex + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Review Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleHelpfulClick(review.id)}
                                        className={`flex items-center gap-2 text-[14px] font-medium transition-colors ${votedReviews.has(review.id)
                                            ? "text-[#0B1F51]"
                                            : "text-gray-600 hover:text-[#0B1F51]"
                                            }`}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${votedReviews.has(review.id) ? "fill-current" : ""}`} />
                                        Helpful ({review.helpful})
                                    </button>
                                    <button
                                        onClick={() => handleReportClick(review.id)}
                                        className="text-[14px] font-medium text-gray-600 hover:text-[#EF4444] transition-colors flex items-center gap-1"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Report
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Load More */}
                    <div className="text-center pt-8">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            className="border-2 border-[#0B1F51] text-[#0B1F51] hover:bg-[#0B1F51] hover:text-white rounded-input px-12 h-14 text-[16px] font-semibold transition-all duration-300"
                        >
                            Load More Reviews
                        </Button>
                    </div>
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden">
                    {/* Sort Options - Mobile */}
                    <div className="mb-6">
                        <h3 className="text-[22px] font-semibold text-[#0B1F51] mb-4">
                            All Reviews ({totalReviews})
                        </h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[
                                { label: 'Most Helpful', value: 'most-helpful' },
                                { label: 'Newest', value: 'newest' },
                                { label: 'Highest Rating', value: 'highest-rating' }
                            ].map((option) => (
                                <Button
                                    key={option.value}
                                    variant={sortBy === option.value ? 'default' : 'outline'}
                                    className={`rounded-input h-10 text-[14px] font-medium transition-all shadow-xs whitespace-nowrap ${sortBy === option.value
                                        ? 'bg-[#0B1F51] text-white shadow-md'
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setSortBy(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Reviews Carousel */}
                    <div className="overflow-hidden">
                        <motion.div
                            className="flex gap-4 px-1"
                            drag="x"
                            dragConstraints={{ left: -dragWidth, right: 0 }}
                            dragElastic={0.1}
                            dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
                        >
                            {displayedReviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    className="bg-white rounded-card border border-black/6 p-6 shrink-0 shadow-md"
                                    style={{ width: 'calc(90vw)' }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    {/* Review Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <Avatar className="w-10 h-10 border-2 border-gray-100">
                                            <AvatarImage src={review.avatar} alt={review.author} />
                                            <AvatarFallback>
                                                <User className="w-5 h-5 text-gray-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-[15px] font-semibold text-[#0B1F51]">{review.author}</span>
                                                {review.verified && (
                                                    <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-none px-2 py-0.5 rounded-[6px] text-[10px] font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-[#F5B012] text-[#F5B012]" : "text-gray-300"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-gray-500">{review.date}</span>
                                        </div>
                                    </div>

                                    {/* Review Title */}
                                    {review.title && (
                                        <h4 className="text-[16px] font-semibold text-[#0B1F51] mb-2">
                                            {review.title}
                                        </h4>
                                    )}

                                    {/* Review Content */}
                                    <p className="text-[14px] text-gray-700 leading-[150%] mb-4">
                                        {review.content}
                                    </p>

                                    {/* Review Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleHelpfulClick(review.id)}
                                            className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${votedReviews.has(review.id)
                                                ? "text-[#0B1F51]"
                                                : "text-gray-600 hover:text-[#0B1F51]"
                                                }`}
                                        >
                                            <ThumbsUp className={`w-3.5 h-3.5 ${votedReviews.has(review.id) ? "fill-current" : ""}`} />
                                            Helpful ({review.helpful})
                                        </button>
                                        <button
                                            onClick={() => handleReportClick(review.id)}
                                            className="text-[13px] font-medium text-gray-600 hover:text-[#EF4444] transition-colors flex items-center gap-1"
                                        >
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Report
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {displayedReviews.map((_, idx) => (
                                <div
                                    key={idx}
                                    className="w-2 h-2 rounded-full bg-[#0B1F51]/30"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Load More - Mobile */}
                    <div className="text-center pt-6">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            className="border-2 border-[#0B1F51] text-[#0B1F51] hover:bg-[#0B1F51] hover:text-white rounded-input px-8 h-12 text-[15px] font-semibold transition-all duration-300 w-full"
                        >
                            Load More Reviews
                        </Button>
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            Please login to interact with reviews.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button onClick={handleLogin} className="w-full bg-[#0B1F51] hover:bg-[#152C6B] text-white">
                            Log In (Mock)
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Write Review Modal */}
            <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                            Share your experience with this product.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Rating</Label>
                            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        onMouseEnter={() => setHoverRating(star)}
                                        className="focus:outline-hidden"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${star <= (hoverRating || newReview.rating)
                                                ? "fill-[#F5B012] text-[#F5B012]"
                                                : "text-gray-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Summarize your experience"
                                required
                                value={newReview.title}
                                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Review</Label>
                            <Textarea
                                id="content"
                                placeholder="What did you like or dislike?"
                                required
                                className="min-h-[100px]"
                                value={newReview.content}
                                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Add Photos (Optional)</Label>
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-input p-8 text-center cursor-pointer hover:border-[#0B1F51]/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                                <ImagePlus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Click to upload images</span>
                            </div>

                            {/* Image Previews */}
                            {newReview.images.length > 0 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                    {newReview.images.map((src, idx) => (
                                        <div key={idx} className="relative w-20 h-20 shrink-0">
                                            <Image src={src} alt="Preview" fill className="object-cover rounded-[8px]" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="bg-[#0B1F51] hover:bg-[#152C6B] text-white">
                                Submit Review
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Report Modal */}
            <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Report Review</DialogTitle>
                        <DialogDescription>
                            Why are you reporting this review?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <RadioGroup defaultValue="irrelevant">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="spam" id="spam" />
                                <Label htmlFor="spam">Spam</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="abuse" id="abuse" />
                                <Label htmlFor="abuse">Abuse or Harassment</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fake" id="fake" />
                                <Label htmlFor="fake">Fake Review</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="irrelevant" id="irrelevant" />
                                <Label htmlFor="irrelevant">Irrelevant</Label>
                            </div>
                        </RadioGroup>

                        <div className="space-y-2">
                            <Label htmlFor="report-message">Additional Details (Optional)</Label>
                            <Textarea id="report-message" placeholder="Please provide more context..." />
                        </div>

                        <Button onClick={handleSubmitReport} className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white">
                            Submit Report
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
