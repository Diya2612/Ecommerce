"use client";
import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Award,
  Loader2,
  ChevronRight,
  User,
  Bell,
  HelpCircle
} from 'lucide-react';
import { TabType } from '@/lib/data/profile/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

interface ProfileContentProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  counts: {
    orders: number;
    addresses: number;
    wishlist: number;
    amc: number;
  };
  ordersContent: ReactNode;
  addressesContent: ReactNode;
  wishlistContent: ReactNode;
  amcContent: ReactNode;
  accountContent: ReactNode;
}

// Tab configuration with icons and colors
const TABS = [
  {
    id: 'orders' as TabType,
    label: 'My Orders',
    icon: ShoppingBag,
    description: 'Track, return, or buy things again',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'addresses' as TabType,
    label: 'Addresses',
    icon: MapPin,
    description: 'Manage your shipping addresses',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    id: 'wishlist' as TabType,
    label: 'Wishlist',
    icon: Heart,
    description: 'Your saved items',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20'
  },
  {
    id: 'amc' as TabType,
    label: 'AMC Plans',
    icon: Award,
    description: 'Annual maintenance contracts',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 'account' as TabType,
    label: 'Account',
    icon: Settings,
    description: 'Profile, password & preferences',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-800'
  },
];

export function ProfileContent({
  activeTab,
  setActiveTab,
  counts,
  ordersContent,
  addressesContent,
  wishlistContent,
  amcContent,
  accountContent
}: ProfileContentProps) {
  const { signOut, isLoading, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TABS.some(t => t.id === tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams, setActiveTab]);

  const getTabCount = (tabId: TabType) => {
    switch (tabId) {
      case 'orders': return counts.orders;
      case 'addresses': return counts.addresses;
      case 'wishlist': return counts.wishlist;
      case 'amc': return counts.amc;
      default: return 0;
    }
  };

  return (
    <section className="py-4 bg-[#F9FBFD] dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6">

            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="sticky top-24 space-y-4">

                {/* User Mini Card - Mobile */}
                <div className="lg:hidden bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0B1F51] to-[#00C4CC] rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.user_metadata?.name || 'User'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Main Navigation Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      My Account
                    </h3>
                  </div>

                  <nav className="p-2">
                    {TABS.map((tab, index) => {
                      const count = getTabCount(tab.id);
                      const isActive = activeTab === tab.id;

                      return (
                        <motion.button
                          key={tab.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group mb-1 ${isActive
                            ? 'bg-gradient-to-r from-[#0B1F51] to-[#1a3578] text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive
                            ? 'bg-white/20'
                            : tab.bgColor
                            }`}>
                            <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : tab.color}`} />
                          </div>

                          {/* Label & Description */}
                          <div className="flex-1 text-left">
                            <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                              {tab.label}
                            </p>
                            <p className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'} hidden lg:block`}>
                              {tab.description}
                            </p>
                          </div>

                          {/* Count Badge or Chevron */}
                          {count > 0 ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isActive
                              ? 'bg-[#00C4CC] text-white'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                              }`}>
                              {count}
                            </span>
                          ) : (
                            <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white' : 'text-gray-400'
                              }`} />
                          )}
                        </motion.button>
                      );
                    })}
                  </nav>

                  {/* Logout Button */}
                  <div className="p-2 border-t border-gray-100 dark:border-slate-800">
                    <button
                      onClick={() => signOut()}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                        ) : (
                          <LogOut className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{isLoading ? 'Signing out...' : 'Logout'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-blue-100 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Need Help?</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        24/7 customer support
                      </p>
                      <a href="tel:+919876543210" className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 inline-block hover:underline">
                        Call Now →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  {/* Tab Header */}
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const currentTab = TABS.find(t => t.id === activeTab);
                        if (!currentTab) return null;
                        return (
                          <>
                            <div className={`w-10 h-10 ${currentTab.bgColor} rounded-xl flex items-center justify-center`}>
                              <currentTab.icon className={`w-5 h-5 ${currentTab.color}`} />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentTab.label}</h2>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{currentTab.description}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'orders' && ordersContent}
                    {activeTab === 'addresses' && addressesContent}
                    {activeTab === 'wishlist' && wishlistContent}
                    {activeTab === 'amc' && amcContent}
                    {activeTab === 'account' && accountContent}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
