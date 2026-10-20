import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { getCurrentUser, type User } from "@/services/userService";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { formatDistanceToNow, isValid } from "date-fns";
import { useNavigate } from "react-router-dom";

// Safe date formatter to prevent "Invalid time value" crashes
const safeFormatDistanceToNow = (dateString: string | undefined | null) => {
  if (!dateString) return "Unknown time";
  const date = new Date(dateString);
  if (!isValid(date)) return "Unknown time";
  return formatDistanceToNow(date, { addSuffix: false });
};

// --- Types ---
interface MetricData {
  label: string;
  value: string | number;
  trend: number;
  trendUp: boolean;
  chartData: { value: number }[];
  color: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  details: string;
  time: string;
  icon: string;
  color: string;
}

interface InsightItem {
  id: string;
  title: string;
  details: string;
  time: string;
  image: string;
}

// --- Components ---

const Sparkline = ({
  data,
  color,
}: {
  data: { value: number }[];
  color: string;
}) => (
  <div className="h-10 w-20">
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const generateSparklineData = (count: number, seed: number): { value: number }[] => {
  const baseValue = Math.max(10, count / 10);
  const data: { value: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const variation = Math.sin(seed + i * 0.8) * baseValue * 0.4;
    const trend = (i / 7) * baseValue * 0.3;
    data.push({ value: Math.max(5, baseValue + variation + trend) });
  }
  return data;
};

const MetricCard = ({ data }: { data: MetricData }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between min-h-35 relative overflow-hidden transition-all hover:shadow-md">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {data.label}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.value}</h3>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div
          className={cn(
            "flex items-center text-xs font-bold",
            data.trendUp ? "text-emerald-500" : "text-rose-500"
          )}
        >
          {data.trendUp ? (
            <ArrowUpRight size={16} className="mr-1" />
          ) : (
            <ArrowDownRight size={16} className="mr-1" />
          )}
          {data.trend}%
        </div>
        <Sparkline data={data.chartData} color={data.color} />
      </div>
    </div>
  );
};

const AnnouncementItemComponent = ({ item }: { item: AnnouncementItem }) => (
  <div className="flex items-start gap-4 py-3 px-6 border-b border-slate-50 last:border-0">
    <div
      className={cn(
        "size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
        item.color
      )}
    >
      {item.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-semibold text-slate-800 truncate">
          {item.title}
        </h4>
        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
          {item.time}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-0.5 truncate">{item.details}</p>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="size-6 text-slate-400 hover:text-slate-600 -mr-2"
    >
      <MoreHorizontal size={14} />
    </Button>
  </div>
);

const InsightItemComponent = ({ item }: { item: InsightItem }) => (
  <div className="flex items-start gap-4 py-3 px-6 border-b border-slate-50 last:border-0">
    <img
      src={item.image}
      alt={item.title}
      className="size-10 rounded-lg object-cover shrink-0 bg-slate-100"
    />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-semibold text-slate-800 truncate">
          {item.title}
        </h4>
        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
          {item.time}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-0.5 truncate">{item.details}</p>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="size-6 text-slate-400 hover:text-slate-600 -mr-2"
    >
      <MoreHorizontal size={14} />
    </Button>
  </div>
);

const Dashboard: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { data: stats, isLoading, error } = useDashboardStats();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const loggedInUser = await getCurrentUser();
      setUser(loggedInUser);
    };
    fetchUser();
  }, []);

  const displayName = useMemo(() => {
    return user?.firstName || "Admin";
  }, [user]);

  // Generate metrics from real data
  const metricsData: MetricData[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Total Revenue",
        value: `$${(stats.totalCustomers * 1024.3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        trend: 12.5,
        trendUp: true,
        color: "#8884d8",
        chartData: generateSparklineData(stats.totalCustomers * 100, 1),
      },
      {
        label: "Total Orders",
        value: stats.orderStats?.totalOrders?.toLocaleString() || "0",
        trend: 8.2,
        trendUp: true,
        color: "#82ca9d",
        chartData: generateSparklineData(stats.orderStats?.totalOrders || 1, 2),
      },
      {
        label: "New Applications",
        value: stats.customersThisMonth.toString(),
        trend: 2.1,
        trendUp: false,
        color: "#ffc658",
        chartData: generateSparklineData(stats.customersThisMonth || 1, 3),
      },
      {
        label: "Cancellation",
        value: stats.orderStats?.cancelledOrders?.toString() || "0",
        trend: 5.4,
        trendUp: true,
        color: "#ff8042",
        chartData: generateSparklineData(stats.orderStats?.cancelledOrders || 1, 4),
      },
      {
        label: "Refund",
        value: `$${((stats.orderStats?.cancelledOrders || 0) * 30.1).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        trend: 1.2,
        trendUp: false,
        color: "#ff6b6b",
        chartData: generateSparklineData(stats.orderStats?.cancelledOrders || 1, 5),
      },
    ];
  }, [stats]);

  // Generate announcements from real audit logs (activity)
  const announcements: AnnouncementItem[] = useMemo(() => {
    // Map action types to readable labels and colors
    const getActionDetails = (action: string) => {
      const actionMap: Record<string, { label: string; icon: string; color: string }> = {
        'CREATE': { label: 'Created', icon: '+', color: 'bg-emerald-100 text-emerald-600' },
        'UPDATE': { label: 'Updated', icon: '✎', color: 'bg-blue-100 text-blue-600' },
        'DELETE': { label: 'Deleted', icon: '✕', color: 'bg-rose-100 text-rose-600' },
        'LOGIN': { label: 'Login', icon: '→', color: 'bg-purple-100 text-purple-600' },
        'LOGOUT': { label: 'Logout', icon: '←', color: 'bg-slate-100 text-slate-600' },
      };

      // Check for action keywords
      const actionKey = Object.keys(actionMap).find(key => action.toUpperCase().includes(key));
      return actionMap[actionKey || 'UPDATE'] || actionMap['UPDATE'];
    };

    if (!stats?.recentActivity || stats.recentActivity.length === 0) {
      // Fallback if no activity
      return [
        { id: "1", title: "Dashboard Ready", details: "Your admin panel is set up and ready.", time: "Just now", icon: "✓", color: "bg-emerald-100 text-emerald-600" },
      ];
    }

    return stats.recentActivity.map((activity) => {
      const actionDetails = getActionDetails(activity.action);
      const resourceLabel = activity.resourceType.replace(/_/g, ' ').toLowerCase();


      return {
        id: activity.id.toString(),
        title: `${actionDetails.label} ${resourceLabel}`,
        details: activity.userEmail
          ? `By ${activity.userEmail}${activity.resourceId ? ` • ID: ${activity.resourceId.substring(0, 8)}...` : ''}`
          : `Resource ${activity.resourceId ? activity.resourceId.substring(0, 8) + '...' : 'updated'}`,
        time: safeFormatDistanceToNow(activity.timestamp),
        icon: actionDetails.icon,
        color: actionDetails.color,
      };
    });
  }, [stats]);

  // Generate products for display (same styling as Store Optimisation)
  const productItems: InsightItem[] = useMemo(() => {
    if (!stats?.recentProducts || stats.recentProducts.length === 0) {
      return [];
    }

    return stats.recentProducts.map((product) => ({
      id: product.id,
      title: product.title,
      details: `SKU: ${product.sku} • ₹${parseFloat(product.sellingPrice).toLocaleString()}`,
      time: safeFormatDistanceToNow(product.createdAt),
      image: product.primaryImageUrl || "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=100&q=80",
    }));
  }, [stats]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load dashboard data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* SECTION 1: Top-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* SECTION 2 & 3: Announcements & Optimisation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
          <CardHeader className="flex flex-row items-center justify-between pt-2 pb-2 border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800">
              Announcements
            </CardTitle>
            <Button
              variant="link"
              className="text-indigo-600 h-auto p-0 font-semibold text-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/notifications");
              }}
            >
              See All
            </Button>
          </CardHeader>
          <CardContent className="pt-0 pb-0 px-0">
            {announcements.map((item) => (
              <AnnouncementItemComponent key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
          <CardHeader className="flex flex-row items-center justify-between pt-2 pb-2 border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800">
              Products
            </CardTitle>
            <Button
              variant="link"
              className="text-indigo-600 h-auto p-0 font-semibold text-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/products");
              }}
            >
              See All
            </Button>
          </CardHeader>
          <CardContent className="pt-0 pb-0 px-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-4 py-3 px-6 border-b border-slate-50 last:border-0">
                    <div className="size-10 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-slate-200 rounded animate-pulse w-12 ml-2" />
                      </div>
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="size-6 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : productItems.length > 0 ? (
              productItems.map((item) => (
                <InsightItemComponent key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No products yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION 4: New Customers */}
      <Card className="border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow py-0">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Side */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-800">
                New Customers This Month
              </h3>
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} className="mr-1" /> 2.75%
              </span>
            </div>
            <div className="text-4xl font-bold text-slate-900">
              {isLoading ? "..." : stats?.customersThisMonth?.toLocaleString() || "0"}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex -space-x-3">
              {!isLoading && stats?.recentCustomers && stats.recentCustomers.length > 0 ? (
                <>
                  {stats.recentCustomers.slice(0, 5).map((customer) => (
                    <Avatar
                      key={customer.id}
                      className="border-2 border-white size-10 shadow-sm"
                    >
                      <AvatarImage src={customer.profileImageUrl || undefined} />
                      <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ))}
                  {stats.totalCustomers > 5 && (
                    <div className="size-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                      +{stats.totalCustomers - 5}
                    </div>
                  )}
                </>
              ) : (
                [1, 2, 3, 4, 5].map((i) => (
                  <Avatar key={i} className="border-2 border-white size-10 shadow-sm">
                    <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 10}`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                ))
              )}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <Button
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-6"
                onClick={() => navigate("/customers")}
              >
                Join Today
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
