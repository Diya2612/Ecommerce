"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AMC_PLANS } from '@/lib/data/services-data';

export function AmcPricingManager() {
    const [pricingCarouselIndex, setPricingCarouselIndex] = useState(0);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    const handlePlanClick = (planName: string) => {
        setSelectedPlan(planName);
        setIsDialogOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Request Submitted", {
            description: `We have received your request for the ${selectedPlan}. Our team will contact you shortly.`
        });
        setIsDialogOpen(false);
        setFormData({ name: '', phone: '', email: '' });
    };

    const handlePricingPrev = () => {
        setPricingCarouselIndex((prev) => (prev === 0 ? AMC_PLANS.length - 1 : prev - 1));
    };

    const handlePricingNext = () => {
        setPricingCarouselIndex((prev) => (prev === AMC_PLANS.length - 1 ? 0 : prev + 1));
    };

    return (
        <>
            {/* Pricing Cards - Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
                {AMC_PLANS.map((plan, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.15 }}
                        className={`relative bg-white rounded-3xl p-8 border-2 ${plan.popular
                            ? 'border-[#F5B012] shadow-xl shadow-[#F5B012]/10 scale-105 z-10'
                            : 'border-gray-100 shadow-md'
                            } hover:shadow-2xl transition-all duration-300`}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <div className="bg-linear-to-r from-[#F5B012] to-[#f5c942] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                                    <Star className="w-3 h-3 fill-current" />
                                    Most Popular
                                </div>
                            </div>
                        )}

                        {/* Discount Badge */}
                        {plan.discount && (
                            <div className="absolute -right-3 top-8 bg-[#EF4444] text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg rotate-12">
                                {plan.discount}
                            </div>
                        )}

                        {/* Plan Name */}
                        <h3 className="text-2xl font-bold text-[#0F172A] mb-2">{plan.name}</h3>

                        {/* Price */}
                        <div className="mb-8">
                            <span className="text-5xl font-bold text-[#0B1F51]">{plan.price}</span>
                            <span className="text-[#475569]">{plan.duration}</span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${plan.popular ? 'text-[#F5B012]' : 'text-[#00C4CC]'
                                        }`} />
                                    <span className="text-[#475569] text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <div className="w-full">
                            <Button
                                onClick={() => handlePlanClick(plan.name)}
                                className={`w-full h-12 rounded-xl font-bold transition-all duration-300 ${plan.popular
                                    ? 'bg-linear-to-r from-[#F5B012] to-[#f5c942] hover:shadow-lg hover:shadow-[#F5B012]/30 text-white'
                                    : 'bg-[#0B1F51] hover:bg-[#0B1F51]/90 text-white'
                                    }`}
                            >
                                Choose {plan.name}
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pricing Cards - Mobile Carousel */}
            <div className="md:hidden relative mb-20">
                <div className="relative overflow-hidden pb-2">
                    <motion.div
                        className="flex"
                        animate={{ x: `-${pricingCarouselIndex * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {AMC_PLANS.map((plan, index) => (
                            <div key={index} className="w-full shrink-0 px-2">
                                <div className={`relative bg-white rounded-3xl p-8 border-2 ${plan.popular
                                    ? 'border-[#F5B012] shadow-xl shadow-[#F5B012]/10'
                                    : 'border-gray-100 shadow-md'
                                    }`}>
                                    {/* Popular Badge */}
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <div className="bg-linear-to-r from-[#F5B012] to-[#f5c942] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                                                <Star className="w-3 h-3 fill-current" />
                                                Most Popular
                                            </div>
                                        </div>
                                    )}

                                    {/* Discount Badge */}
                                    {plan.discount && (
                                        <div className="absolute -right-3 top-8 bg-[#EF4444] text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg rotate-12">
                                            {plan.discount}
                                        </div>
                                    )}

                                    {/* Plan Name */}
                                    <h3 className="text-2xl font-bold text-[#0F172A] mb-2 text-center mt-4">{plan.name}</h3>

                                    {/* Price */}
                                    <div className="mb-8 text-center">
                                        <span className="text-5xl font-bold text-[#0B1F51]">{plan.price}</span>
                                        <span className="text-[#475569]">{plan.duration}</span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${plan.popular ? 'text-[#F5B012]' : 'text-[#00C4CC]'
                                                    }`} />
                                                <span className="text-[#475569] text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <div className="w-full">
                                        <Button
                                            onClick={() => handlePlanClick(plan.name)}
                                            className={`w-full h-12 rounded-xl font-bold transition-all duration-300 ${plan.popular
                                                ? 'bg-linear-to-r from-[#F5B012] to-[#f5c942] hover:shadow-lg hover:shadow-[#F5B012]/30 text-white'
                                                : 'bg-[#0B1F51] hover:bg-[#0B1F51]/90 text-white'
                                                }`}
                                        >
                                            Choose {plan.name}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Navigation Arrows */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                    onClick={handlePricingPrev}
                >
                    <ChevronLeft className="w-5 h-5 text-[#0B1F51]" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                    onClick={handlePricingNext}
                >
                    <ChevronRight className="w-5 h-5 text-[#0B1F51]" />
                </Button>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-2 mt-8">
                    {AMC_PLANS.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === pricingCarouselIndex
                                ? "w-8 bg-[#F5B012]"
                                : "w-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                            onClick={() => setPricingCarouselIndex(index)}
                            aria-label={`Go to plan ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#0B1F51]">Request {selectedPlan}</DialogTitle>
                        <DialogDescription>
                            Enter your details below to proceed with the {selectedPlan}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-[#0B1F51]">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Your Name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="rounded-lg border-gray-200 focus:border-[#00C4CC] focus:ring-[#00C4CC]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="text-[#0B1F51]">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Mobile Number"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="rounded-lg border-gray-200 focus:border-[#00C4CC] focus:ring-[#00C4CC]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-[#0B1F51]">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="rounded-lg border-gray-200 focus:border-[#00C4CC] focus:ring-[#00C4CC]"
                            />
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="submit" className="w-full bg-[#0B1F51] hover:bg-[#152C6B] text-white font-bold h-11 rounded-xl">
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
