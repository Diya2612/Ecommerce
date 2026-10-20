import React from 'react';
import {
  ShoppingBag,
  DollarSign,
  LogIn,
  Activity,
  AlertCircle,
  ShoppingCart,
  Heart,
  User,
  Star,
  MessageSquare,
  Truck,
  RotateCcw,
  ShieldCheck,
  Mail,
  Settings,
  Edit3,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
  PlusCircle,
  CreditCard,
  Package,
  MapPin,
  Phone,
  Lock,
  Download,
  Upload,
  PackageCheck
} from 'lucide-react';

export const getActivityIcon = (type: string) => {
  const t = type.toLowerCase();

  if (t.includes('pay') || t.includes('transaction') || t.includes('paid')) return React.createElement(DollarSign, { size: 20 });
  if (t.includes('refund') || t.includes('return')) return React.createElement(RotateCcw, { size: 20 });
  if (t.includes('ship') || t.includes('dispatch') || t.includes('transit')) return React.createElement(Truck, { size: 20 });
  if (t.includes('deliver') || t.includes('arrival') || t.includes('received')) return React.createElement(Package, { size: 20 });
  if (t.includes('fulfill')) return React.createElement(PackageCheck, { size: 20 }); // Fulfilled

  // Generic Order check should be after specific statuses
  if (t.includes('order')) {
    if (t.includes('create') || t.includes('place')) return React.createElement(ShoppingBag, { size: 20 });
    return React.createElement(ShoppingBag, { size: 20 });
  }

  if (t.includes('card') || t.includes('credit')) return React.createElement(CreditCard, { size: 20 });
  if (t.includes('login') || t.includes('sign in') || t.includes('session')) return React.createElement(LogIn, { size: 20 });
  if (t.includes('logout') || t.includes('sign out')) return React.createElement(LogIn, { size: 20, className: "rotate-180" });
  if (t.includes('account') || t.includes('profile') || t.includes('user')) return React.createElement(User, { size: 20 });

  // Cart & Wishlist
  if (t.includes('cart') || t.includes('basket') || t.includes('abandon')) return React.createElement(ShoppingCart, { size: 20 });
  if (t.includes('wishlist') || t.includes('favorite')) return React.createElement(Heart, { size: 20 });

  if (t.includes('review') || t.includes('rating')) return React.createElement(Star, { size: 20 });
  if (t.includes('support') || t.includes('ticket') || t.includes('chat')) return React.createElement(MessageSquare, { size: 20 });

  // Verification
  if (t.includes('verif')) return React.createElement(ShieldCheck, { size: 20 });

  if (t.includes('secur') || t.includes('password') || t.includes('auth')) return React.createElement(Lock, { size: 20 });
  if (t.includes('market') || t.includes('email') || t.includes('campaign')) return React.createElement(Mail, { size: 20 });
  if (t.includes('syst') || t.includes('config') || t.includes('setting')) return React.createElement(Settings, { size: 20 });
  if (t.includes('error') || t.includes('fail') || t.includes('deny')) return React.createElement(AlertCircle, { size: 20 });
  if (t.includes('edit') || t.includes('update') || t.includes('change')) return React.createElement(Edit3, { size: 20 });
  if (t.includes('create') || t.includes('add') || t.includes('new')) return React.createElement(PlusCircle, { size: 20 });
  if (t.includes('delete') || t.includes('remove')) return React.createElement(Trash2, { size: 20 });
  if (t.includes('complete') || t.includes('success')) return React.createElement(CheckCircle2, { size: 20 });
  if (t.includes('cancel') || t.includes('reject')) return React.createElement(XCircle, { size: 20 });
  if (t.includes('invoice') || t.includes('bill')) return React.createElement(FileText, { size: 20 });
  if (t.includes('address') || t.includes('location')) return React.createElement(MapPin, { size: 20 });
  if (t.includes('phone') || t.includes('call')) return React.createElement(Phone, { size: 20 });
  if (t.includes('phone') || t.includes('call')) return React.createElement(Phone, { size: 20 });
  if (t.includes('upload')) return React.createElement(Upload, { size: 20 });
  if (t.includes('download')) return React.createElement(Download, { size: 20 });

  return React.createElement(Activity, { size: 20 });
};

export const getActivityIconColors = (type: string) => {
  const t = type.toLowerCase();

  // Specific semantic overrides
  if (t.includes('error') || t.includes('fail') || t.includes('deny') || t.includes('remove') || t.includes('delete') || t.includes('cancel')) {
    return 'bg-red-50 text-red-600 border-red-100';
  }

  if (t.includes('success') || t.includes('complete') || t.includes('pay') || t.includes('paid') || t.includes('deliver') || t.includes('fulfill') || t.includes('verif')) {
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  }

  if (t.includes('warning') || t.includes('alert') || t.includes('abandon')) {
    return 'bg-amber-50 text-amber-600 border-amber-100';
  }

  if (t.includes('review') || t.includes('rating')) {
    return 'bg-yellow-50 text-yellow-600 border-yellow-100';
  }

  if (t.includes('wishlist') || t.includes('favorite')) {
    return 'bg-rose-50 text-rose-600 border-rose-100';
  }

  // Category based matching
  if (t.includes('order') || t.includes('invoice') || t.includes('bill')) {
    return 'bg-blue-50 text-blue-600 border-blue-100';
  }

  if (t.includes('ship') || t.includes('track') || t.includes('truck')) {
    return 'bg-sky-50 text-sky-600 border-sky-100';
  }


  if (t.includes('secur') || t.includes('pass') || t.includes('auth') || t.includes('lock')) {
    return 'bg-violet-50 text-violet-600 border-violet-100';
  }

  if (t.includes('account') || t.includes('profile') || t.includes('user')) {
    return 'bg-indigo-50 text-indigo-600 border-indigo-100';
  }

  if (t.includes('support') || t.includes('ticket') || t.includes('chat') || t.includes('mail')) {
    return 'bg-purple-50 text-purple-600 border-purple-100';
  }

  if (t.includes('edit') || t.includes('update') || t.includes('change') || t.includes('upload') || t.includes('return') || t.includes('refund')) {
    return 'bg-orange-50 text-orange-600 border-orange-100';
  }

  if (t.includes('create') || t.includes('add') || t.includes('new') || t.includes('cart')) {
    return 'bg-teal-50 text-teal-600 border-teal-100';
  }

  // Fallback
  return 'bg-slate-50 text-slate-500 border-slate-200';
};

export const ACTIVITY_CATEGORY_OPTIONS = [
  { label: 'All Activity', value: 'all' },
  { label: 'Orders & Shipping', value: 'order' },
  { label: 'Payments & Refunds', value: 'payment' },
  { label: 'Account & Security', value: 'account' },
  { label: 'Cart & Wishlist', value: 'cart' },
  { label: 'Support & Reviews', value: 'support' },
];
