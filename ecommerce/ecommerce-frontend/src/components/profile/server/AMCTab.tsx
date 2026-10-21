"use client";

import { Award, Calendar, CheckCircle, AlertCircle, Phone, Download, ChevronRight, ChevronDown, Plus, Clock, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AMCPlan } from '@/contexts/ProfileContext';
import { motion, AnimatePresence } from 'motion/react';
import { AmcActions } from '../client/AmcActions';
import { useState, useCallback } from 'react';
import { triggerHaptic } from '@/hooks/gestures/useHaptic';

interface AMCTabProps {
    amcPlans: AMCPlan[];
}

// Progress Ring Component
function ProgressRing({
    progress,
    size = 60,
    strokeWidth = 6,
    remaining,
    total
}: {
    progress: number;
    size?: number;
    strokeWidth?: number;
    remaining: number;
    total: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00C4CC" />
                        <stop offset="100%" stopColor="#0B1F51" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{remaining}</span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400">/{total}</span>
            </div>
        </div>
    );
}

// Mobile AMC Card
function MobileAMCCard({
    plan,
    statusConfig,
    progress,
    isExpanded,
    onToggle
}: {
    plan: AMCPlan;
    statusConfig: {
        label: string;
        color: string;
        bgColor: string;
        borderColor: string;
        icon: React.ElementType;
    };
    progress: number;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            layout
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
        >
            {/* Card Header - Always Visible */}
            <button
                onClick={() => {
                    triggerHaptic('light');
                    onToggle();
                }}
                className="w-full p-4 flex items-center gap-3 text-left"
            >
                {/* Progress Ring */}
                <ProgressRing
                    progress={progress}
                    size={56}
                    strokeWidth={5}
                    remaining={plan.servicesRemaining}
                    total={plan.totalServices}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {plan.planName}
                        </h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {plan.productName}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Valid till {plan.endDate}
                    </p>
                </div>

                {/* Expand Arrow */}
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    className="h-10 bg-[#00C4CC] hover:bg-[#0B1F51] text-white rounded-xl text-xs font-semibold gap-1.5"
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                    Schedule Service
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-10 border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium gap-1.5"
                                >
                                    <Wrench className="w-3.5 h-3.5" />
                                    Request Support
                                </Button>
                            </div>

                            {/* Service Details */}
                            <div className="grid grid-cols-2 gap-2">
                                {plan.nextServiceDate && (
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                                        <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mb-1">Next Service</p>
                                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">{plan.nextServiceDate}</p>
                                    </div>
                                )}
                                {plan.lastServiceDate && (
                                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">Last Service</p>
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{plan.lastServiceDate}</p>
                                    </div>
                                )}
                            </div>

                            {/* Service History */}
                            <div className="pt-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Services</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/30 rounded-lg p-2.5">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">Filter Replacement</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Oct 10, 2024</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                            <Download className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function AMCTab({ amcPlans }: AMCTabProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = useCallback((id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    const getStatusConfig = (status: AMCPlan['status']) => {
        switch (status) {
            case 'active':
                return {
                    label: 'Active',
                    color: 'text-[#22C55E]',
                    bgColor: 'bg-[#22C55E]/10',
                    borderColor: 'border-[#22C55E]/20',
                    icon: CheckCircle
                };
            case 'upcoming':
                return {
                    label: 'Upcoming',
                    color: 'text-[#F59E0B]',
                    bgColor: 'bg-[#F59E0B]/10',
                    borderColor: 'border-[#F59E0B]/20',
                    icon: Calendar
                };
            case 'expired':
                return {
                    label: 'Expired',
                    color: 'text-[#EF4444]',
                    bgColor: 'bg-[#EF4444]/10',
                    borderColor: 'border-[#EF4444]/20',
                    icon: AlertCircle
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-100',
                    borderColor: 'border-gray-200',
                    icon: AlertCircle
                };
        }
    };

    const calculateProgress = (remaining: number, total: number) => {
        return ((total - remaining) / total) * 100;
    };

    // Empty state
    if (amcPlans.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 lg:py-16"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 bg-linear-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                    <Award className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No AMC Plans</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto px-4">
                    Protect your water purifier with an Annual Maintenance Contract for worry-free service.
                </p>
                <Button className="bg-linear-to-r from-[#0B1F51] to-[#00C4CC] text-white h-11 px-6 rounded-xl font-semibold">
                    <Plus className="w-5 h-5 mr-2" />
                    Browse AMC Plans
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header - Hidden on mobile */}
            <div className="hidden lg:flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AMC Plans</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your Annual Maintenance Contracts
                    </p>
                </div>
                <Button className="bg-[#0B1F51] text-white hover:bg-[#00C4CC] rounded-xl h-11 px-6 font-semibold w-fit">
                    <Plus className="w-4 h-4 mr-2" />
                    Buy New AMC
                </Button>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {amcPlans.length} {amcPlans.length === 1 ? 'plan' : 'plans'}
                </p>
                <Button size="sm" className="h-9 bg-[#00C4CC] hover:bg-[#0B1F51] text-white rounded-xl font-medium text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    New AMC
                </Button>
            </div>

            {/* Mobile: Card Stack View */}
            <div className="lg:hidden space-y-3">
                {amcPlans.map((plan) => {
                    const statusConfig = getStatusConfig(plan.status as AMCPlan['status']);
                    const progress = calculateProgress(plan.servicesRemaining, plan.totalServices);

                    return (
                        <MobileAMCCard
                            key={plan.id}
                            plan={plan}
                            statusConfig={statusConfig}
                            progress={progress}
                            isExpanded={expandedId === plan.id}
                            onToggle={() => toggleExpand(plan.id)}
                        />
                    );
                })}
            </div>

            {/* Desktop: Full Cards */}
            <div className="hidden lg:block space-y-6">
                {amcPlans.map((plan) => {
                    const statusConfig = getStatusConfig(plan.status as AMCPlan['status']);
                    const StatusIcon = statusConfig.icon;
                    const progress = calculateProgress(plan.servicesRemaining, plan.totalServices);

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-linear-to-r from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-800">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-linear-to-br from-[#0B1F51] to-[#1a3578] rounded-xl flex items-center justify-center">
                                            <Award className="w-7 h-7 text-[#00C4CC]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                                {plan.planName}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {plan.productName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor} w-fit`}>
                                        <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                                        <span className={`text-sm font-semibold ${statusConfig.color}`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                    {/* Plan Duration */}
                                    <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-[#00C4CC]" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Plan Duration</p>
                                        </div>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {plan.startDate}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">to {plan.endDate}</p>
                                    </div>

                                    {/* Services Remaining with Progress Ring */}
                                    <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-3">Services Used</p>
                                        <div className="flex items-center gap-4">
                                            <ProgressRing
                                                progress={progress}
                                                remaining={plan.servicesRemaining}
                                                total={plan.totalServices}
                                            />
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {plan.servicesRemaining}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">remaining</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Next Service */}
                                    {plan.nextServiceDate && (
                                        <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Next Service</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {plan.nextServiceDate}
                                            </p>
                                            <Button className="mt-2 bg-[#00C4CC] text-white hover:bg-[#0B1F51] rounded-lg h-9 px-4 text-sm font-semibold w-full">
                                                <Phone className="w-3 h-3 mr-2" />
                                                Schedule
                                            </Button>
                                        </div>
                                    )}

                                    {/* Last Service */}
                                    {plan.lastServiceDate && (
                                        <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Last Service</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                {plan.lastServiceDate}
                                            </p>
                                            <button className="mt-2 text-sm text-[#00C4CC] hover:text-[#0B1F51] font-medium transition-colors">
                                                View Details →
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Service History */}
                                <div className="bg-linear-to-br from-gray-50 to-white dark:from-slate-700/30 dark:to-slate-800/30 rounded-xl p-6 mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Service History
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#22C55E] rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    Filter Replacement & General Checkup
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Oct 10, 2024</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-gray-200 dark:border-slate-600 rounded-lg h-9 px-4 text-sm font-medium"
                                            >
                                                <Download className="w-3 h-3 mr-2" />
                                                Report
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#22C55E] rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    Membrane Cleaning & TDS Check
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Jul 8, 2024</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-gray-200 dark:border-slate-600 rounded-lg h-9 px-4 text-sm font-medium"
                                            >
                                                <Download className="w-3 h-3 mr-2" />
                                                Report
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <AmcActions planId={plan.id} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Benefits Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-linear-to-br from-[#0B1F51] to-[#1a3578] rounded-2xl p-5 lg:p-8 text-white"
            >
                <h3 className="text-lg lg:text-2xl font-semibold mb-4 lg:mb-6">AMC Benefits</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-[#00C4CC] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm lg:text-base font-semibold mb-0.5 lg:mb-1">Regular Maintenance</p>
                            <p className="text-xs lg:text-sm text-white/80">
                                Scheduled services to keep your purifier running efficiently
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-[#00C4CC] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm lg:text-base font-semibold mb-0.5 lg:mb-1">Priority Support</p>
                            <p className="text-xs lg:text-sm text-white/80">
                                24/7 customer support with faster response times
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-[#00C4CC] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm lg:text-base font-semibold mb-0.5 lg:mb-1">Free Replacements</p>
                            <p className="text-xs lg:text-sm text-white/80">
                                Complimentary filter and parts replacement
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
