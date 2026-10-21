"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function FilterSubscriptionBox() {
    const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Subscription Request Sent", {
            description: "We have received your subscription request. Our team will contact you shortly to finalize details."
        });
        setIsSubscribeDialogOpen(false);
        setFormData({ name: '', phone: '', email: '' });
    };

    return (
        <>
            <div className="mt-8 bg-linear-to-br from-[#0B1F51] to-[#1a3570] rounded-2xl p-8 text-white">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Bell className="w-6 h-6 text-[#00C4CC]" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold mb-2">Filter Subscription Plan</h4>
                        <p className="text-white/80 text-sm">Never miss a filter change. Get automatic reminders and doorstep delivery</p>
                    </div>
                </div>
                <ul className="space-y-2 mb-6">
                    {['Timely reminder notifications', 'Pre-scheduled technician visits', 'Discounted filter prices', 'Free installation service'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#00C4CC]" />
                            {item}
                        </li>
                    ))}
                </ul>
                <Button
                    onClick={() => setIsSubscribeDialogOpen(true)}
                    className="w-full bg-[#00C4CC] hover:bg-[#00C4CC]/90 text-[#0B1F51] h-11 rounded-xl font-bold"
                >
                    Subscribe Now - Save 20%
                </Button>
            </div>

            <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#0B1F51]">Subscribe & Save</DialogTitle>
                        <DialogDescription>
                            Get automatic filter replacements and save 20%. Enter your details to get started.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sub-name" className="text-[#0B1F51]">Name</Label>
                            <Input
                                id="sub-name"
                                name="name"
                                placeholder="Your Name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="rounded-lg border-gray-200 focus:border-[#00C4CC] focus:ring-[#00C4CC]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sub-phone" className="text-[#0B1F51]">Phone Number</Label>
                            <Input
                                id="sub-phone"
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
                            <Label htmlFor="sub-email" className="text-[#0B1F51]">Email</Label>
                            <Input
                                id="sub-email"
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
