import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Users,
  ShoppingCart,
  Settings,
  Package,
  ArrowRight,
  Percent,
  UserPlus,
  Award,
  Tag,
  PenTool,
  BookOpen,
  Mail,
  Mails,
  List,
  LayoutDashboard
} from 'lucide-react';
import {
  Command,
  CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
export type ModuleName =
  | 'Products'
  | 'Collections'
  | 'Orders'
  | 'Customers'
  | 'Blogs'
  | 'Bundles'
  | 'Discounts'
  | 'Gift Cards'
  | 'Settings';

export interface SearchRecord {
  id: string;
  module: ModuleName;
  title: string;
  subtitle?: string;
  status?: string;
  path: string[];
  tags?: string[];
}

// --- Data ---
const QUICK_ACTIONS = [
  { title: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard", color: "text-slate-500", keywords: ["home", "main"] },
  { title: "Create Order", icon: <ShoppingCart size={20} />, path: "/orders/new", color: "text-slate-500", keywords: ["add order", "new order"] },
  { title: "View All Orders", icon: <List size={20} />, path: "/orders", color: "text-slate-500", keywords: ["list orders", "manage orders"] },
  { title: "Create Customer", icon: <UserPlus size={20} />, path: "/customers/new", color: "text-slate-500", keywords: ["add customer", "new user"] },
  { title: "Manage Customers", icon: <Users size={20} />, path: "/customers", color: "text-slate-500", keywords: ["list customers", "users"] },
  { title: "View Inventory", icon: <Package size={20} />, path: "/inventory", color: "text-slate-500", keywords: ["stock", "products"] },
  // { title: "Receive Stock", icon: <ArrowDownToLine size={20} />, path: "/inventory", color: "text-orange-500 hover:text-orange-600", keywords: ["add stock", "update inventory"] },
  { title: "Create Tier", icon: <Award size={20} />, path: "/tiers/new", color: "text-slate-500", keywords: ["loyalty", "level"] },
  { title: "Create Tag", icon: <Tag size={20} />, path: "/tags/new", color: "text-slate-500", keywords: ["label", "category"] },
  { title: "Write Blog Post", icon: <PenTool size={20} />, path: "/blogs/add", color: "text-slate-500", keywords: ["article", "content"] },
  { title: "View Blogs", icon: <BookOpen size={20} />, path: "/blogs", color: "text-slate-500", keywords: ["posts", "articles"] },
  { title: "Invite User", icon: <Mail size={20} />, path: "/invitations?action=create", color: "text-slate-500", keywords: ["send invite", "email"] },
  { title: "View Invitations", icon: <Mails size={20} />, path: "/invitations", color: "text-slate-500", keywords: ["pending invites"] },
  { title: "Create Discount", icon: <Percent size={20} />, path: "/discounts/new", color: "text-slate-500", keywords: ["coupon", "sale"] },
  { title: "System Settings", icon: <Settings size={20} />, path: "/settings", color: "text-slate-900", keywords: ["config", "admin"] },
];

// --- Component ---

interface GlobalSearchProps {
  onNavigate?: (page: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const GlobalSearch = ({
  onNavigate,
  placeholder = "Search actions...",
}: GlobalSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcut (Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 10);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter Logic
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return QUICK_ACTIONS;

    const query = searchQuery.toLowerCase().trim();
    return QUICK_ACTIONS.filter(action =>
      action.title.toLowerCase().includes(query) ||
      action.keywords.some(k => k.includes(query))
    );
  }, [searchQuery]);

  const handleActionClick = (path: string) => {
    setOpen(false);
    setSearchQuery("");
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative group w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors pointer-events-none">
            <Search size={16} />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            className="w-full h-[40px] bg-[#251550] rounded-lg pl-10 pr-12 text-sm text-white focus:outline-none focus:bg-[#2e1a5f] placeholder:text-gray-400 border border-transparent focus:border-[#7c6aa6] transition-all shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-sans text-[10px] font-medium text-gray-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden mt-2"
        align="center"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (inputRef.current && inputRef.current.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        <Command shouldFilter={false} className="bg-transparent flex flex-col w-full">
          <CommandList className="flex-1 overflow-y-auto p-2 min-h-[100px] max-h-[500px]">

            {/* Header */}
            <div className="flex items-center justify-between px-2 mb-2 mt-1">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {searchQuery ? 'Search Results' : 'Quick Actions'}
              </h4>
              <span className="text-[10px] text-slate-400">
                {filteredActions.length} actions
              </span>
            </div>

            {/* Grid of Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredActions.map((action, index) => (
                <QuickLink
                  key={index}
                  title={action.title}
                  icon={action.icon}
                  color={action.color}
                  onClick={() => handleActionClick(action.path)}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredActions.length === 0 && (
              <div className="py-8 text-center px-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-50 mb-3">
                  <Search className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-slate-900 font-medium text-sm">No actions found</p>
                <p className="text-slate-500 text-xs mt-1">
                  Try searching for 'order', 'stock', or 'create'
                </p>
              </div>
            )}

          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Quick Link Component
const QuickLink = ({ title, icon, onClick, color }: { title: string; icon: React.ReactNode; onClick?: () => void, color?: string }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 hover:shadow-sm cursor-pointer transition-all group"
  >
    <div className="flex items-center gap-3.5">
      <div className={cn("text-slate-400 transition-colors duration-200", color)}>
        {/* Helper wrapper to ensure icon size is respected if passed directly */}
        {React.isValidElement(icon) ? icon : <Settings size={20} />}
      </div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{title}</span>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
      <ArrowRight size={14} className="text-slate-400" />
    </div>
  </div>
);
