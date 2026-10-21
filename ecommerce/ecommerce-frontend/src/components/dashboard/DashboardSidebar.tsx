import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/utils';
const logoDarkText = '/assets/10d9e162195ae525bf94f3d12e99419e24d10bb6.png';
import {
  LayoutDashboard,
  Smartphone,
  Calendar,
  Wrench,
  ShieldCheck,
  ShoppingBag,
  LifeBuoy,
  Settings,
  LogOut,
  User
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Smartphone, label: 'My Devices', href: '/dashboard/devices' },
  { icon: Wrench, label: 'Service & Repairs', href: '/dashboard/service/history' },
  { icon: ShieldCheck, label: 'AMC Plans', href: '/dashboard/amc' },
  { icon: ShoppingBag, label: 'Orders', href: '/profile' },
  { icon: LifeBuoy, label: 'Support', href: '/profile/tickets' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-100", className)}>
      <div className="p-6">
        <Link href="/" className="block">
          <Image
            src={logoDarkText}
            alt="Anant Enterprises"
            width={140}
            height={36}
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-[#1C2A54] text-white shadow-lg shadow-[#1C2A54]/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#1C2A54]"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-[#31CDD4]" : "text-gray-400 group-hover:text-[#1C2A54]")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#1C2A54] flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-[#1C2A54] truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">john@example.com</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
