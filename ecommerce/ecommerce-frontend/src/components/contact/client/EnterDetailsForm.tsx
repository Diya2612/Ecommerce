'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { User, Mail, Phone, MapPin, MessageSquare, Building, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * EnterDetailsForm - Client Component
 * 
 * Complete contact form with form state, validation, and submission.
 * Form handling is inherently client-side, so this remains a client component.
 * 
 * MAINTAINS EXACT SAME UI as original EnterDetailsSection.tsx
 */
export function EnterDetailsForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        address: '',
        pincode: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            toast.success('Booking Confirmed!', {
                description: 'Our team will contact you shortly to confirm your appointment.',
            });
            setFormData({
                name: '',
                email: '',
                phone: '',
                city: '',
                address: '',
                pincode: '',
                message: ''
            });
        }, 2000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-[28px] border border-black/6 shadow-xl p-8 md:p-12"
        >
            {/* Personal Information */}
            <div className="mb-10">
                <h3 className="text-[24px] font-semibold text-[#0B1F51] mb-6 tracking-[-0.01em]">
                    Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="contact-name"
                            className="flex items-center gap-2 text-[16px] font-medium text-gray-700 mb-3"
                        >
                            <User className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="contact-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                            className="w-full h-14 px-6 rounded-input border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px] placeholder:text-gray-400"
                            autoComplete="name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="contact-phone"
                            className="flex items-center gap-2 text-[16px] font-medium text-gray-700 mb-3"
                        >
                            <Phone className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="contact-phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="+91 XXXXX XXXXX"
                            className="w-full h-14 px-6 rounded-input border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px] placeholder:text-gray-400"
                            autoComplete="tel"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="contact-email"
                            className="flex items-center gap-2 text-[16px] font-medium text-gray-700 mb-3"
                        >
                            <Mail className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="contact-email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="your.email@example.com"
                            className="w-full h-14 px-6 rounded-input border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px] placeholder:text-gray-400"
                            autoComplete="email"
                        />
                    </div>
                </div>
            </div>

            {/* Address Information */}
            <div className="mb-10 pt-10 border-t border-gray-100">
                <h3 className="text-[24px] font-semibold text-[#0B1F51] mb-6 tracking-[-0.01em]">
                    Address Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="contact-city"
                            className="flex items-center gap-2 text-[16px] font-medium text-gray-700 mb-3"
                        >
                            <Building className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
                            City *
                        </label>
                        <input
                            type="text"
                            id="contact-city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            placeholder="Enter your city"
                            className="w-full h-14 px-6 rounded-input border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px] placeholder:text-gray-400"
                            autoComplete="address-level2"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="contact-pincode"
                            className="flex items-center gap-2 text-[16px] font-medium text-gray-700 mb-3"
                        >
                            <MapPin className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
                            PIN Code *
                        </label>
                        <input
                            type="text"
                            id="contact-pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                            placeholder="XXXXXX"
                            pattern="[0-9]{6}"
                            inputMode="numeric"
                            className="w-full h-14 px-6 rounded-input border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px] placeholder:text-gray-400"
                            autoComplete="postal-code"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label
                            htmlFor="contact-address"
                            className="flex items-center gap-2 text-[16px] font-medium text-gray-700 mb-3"
                        >
                            <MapPin className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
                            Complete Address *
                        </label>
                        <input
                            type="text"
                            id="contact-address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            placeholder="House/Flat No., Building Name, Street, Area"
                            className="w-full h-14 px-6 rounded-input border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px] placeholder:text-gray-400"
                            autoComplete="street-address"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Message */}
            <div className="mb-10 pt-10 border-t border-gray-100">
                <h3 className="text-[24px] font-semibold text-[#0B1F51] mb-6 tracking-[-0.01em]">
                    Additional Information
                </h3>
                <label
                    htmlFor="contact-message"
                    className="flex items-center gap-2 text-[16px] font-medium text-gray-700 mb-3"
                >
                    <MessageSquare className="w-4 h-4 text-[#00C4CC]" aria-hidden="true" />
                    Message (Optional)
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us more about your requirements, specific issues, or any questions you have..."
                    className="w-full px-6 py-4 rounded-input border-2 border-gray-200 focus:border-[#00C4CC] focus:outline-hidden transition-colors text-[16px] placeholder:text-gray-400 resize-none"
                />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-6 border-t border-gray-100">
                <p className="text-[14px] text-gray-600">
                    * Required fields. We respect your privacy and will never share your information.
                </p>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-linear-to-r from-[#0B1F51] to-[#00C4CC] text-white px-12 h-14 rounded-input text-[16px] font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5 mr-2" aria-hidden="true" />
                            Submit Booking
                        </>
                    )}
                </Button>
            </div>
        </motion.form>
    );
}
