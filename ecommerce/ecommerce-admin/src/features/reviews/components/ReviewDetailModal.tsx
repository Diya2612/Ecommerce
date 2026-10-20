import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Star, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { notifySuccess, notifyError } from '@/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { reviewService } from '../services';
import { moderateReviewSchema, type ModerateReviewFormData } from '../validation/reviewSchema';
import { REVIEW_STATUS_COLORS } from '../constants/statuses';
import type { ReviewDetailModalProps } from '../types';

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
    open,
    onOpenChange,
    onSuccess,
    review,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ModerateReviewFormData>({
        resolver: zodResolver(moderateReviewSchema),
    });

    useEffect(() => {
        if (review && open) {
            reset({
                status: review.status,
                adminReply: review.adminReply || '',
            });
        }
    }, [review, open, reset]);

    const handleAction = async (data: ModerateReviewFormData, newStatus?: 'approved' | 'rejected') => {
        if (!review) return;
        
        const payload = { ...data };
        if (newStatus) {
            payload.status = newStatus;
        }

        try {
            await reviewService.moderateReview(review.id, payload);
            notifySuccess(`Review ${payload.status} successfully`);
            onOpenChange(false);
            onSuccess();
        } catch (error: any) {
            notifyError(error.message || 'Failed to update review');
        }
    };

    if (!review) return null;

    const statusColors = REVIEW_STATUS_COLORS[review.status] || REVIEW_STATUS_COLORS.pending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl font-bold text-[#253154]">
                            Review Details
                        </DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            View and moderate customer review
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                        {review.status}
                    </span>
                </DialogHeader>

                <div className="px-6 py-5 space-y-6">
                    {/* Review Info Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1">
                            <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Product</Label>
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{review.productName || 'Unknown Product'}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1">
                            <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Customer</Label>
                            <p className="text-sm font-medium text-gray-900">{review.userName || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{review.userEmail || 'No email provided'}</p>
                        </div>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star} 
                                        className={`w-5 h-5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">
                                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                            </span>
                        </div>

                        {review.title && (
                            <h4 className="font-semibold text-lg text-gray-900">{review.title}</h4>
                        )}
                        
                        {review.comment && (
                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-white border border-gray-100 p-4 rounded-xl">
                                {review.comment}
                            </p>
                        )}
                        
                        {review.isVerifiedPurchase && (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit mt-2">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Verified Purchase</span>
                            </div>
                        )}
                    </div>

                    {/* Media Attachments */}
                    {review.mediaUrls && review.mediaUrls.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Attached Media</Label>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {review.mediaUrls.map((url, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img src={url} alt={`Review attachment ${idx + 1}`} className="object-cover w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <hr className="border-gray-100" />

                    {/* Moderation Form */}
                    <form id="moderate-form" onSubmit={handleSubmit((data) => handleAction(data))} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="adminReply" className="text-sm font-medium text-gray-700">
                                Admin Reply (Visible to customers)
                            </Label>
                            <Textarea
                                id="adminReply"
                                {...register('adminReply')}
                                placeholder="Type a public reply to this review..."
                                className={`min-h-[100px] resize-y rounded-xl focus:ring-[#0e042f] ${errors.adminReply ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            {errors.adminReply && <p className="text-xs text-red-500">{errors.adminReply.message}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            {review.status !== 'approved' && (
                                <Button
                                    type="button"
                                    onClick={() => handleSubmit((data) => handleAction(data, 'approved'))()}
                                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                    Approve & Save
                                </Button>
                            )}
                            
                            {review.status !== 'rejected' && (
                                <Button
                                    type="button"
                                    onClick={() => handleSubmit((data) => handleAction(data, 'rejected'))()}
                                    className="flex-1 h-12 rounded-xl bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                    Reject Review
                                </Button>
                            )}

                            {/* Save reply without changing status if already approved/rejected */}
                            <Button
                                type="submit"
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-gray-200 font-medium"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Reply Only'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};
