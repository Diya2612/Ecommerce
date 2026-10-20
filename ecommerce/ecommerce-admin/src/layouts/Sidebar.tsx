import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { NAV_ITEMS } from "@/lib/config";
import type { NavItem } from "@/lib/config";
import { getLoggedInUser, type DecodedToken } from "@/features/auth/services/authService";
import logo from "@/assets/logos/ANANT ENTERPRISES 1-04.png";

/* ============================================================
   Types
============================================================ */

interface SidebarProps {
    isCollapsed: boolean;
    expandedMenus: string[];
    setExpandedMenus: React.Dispatch<React.SetStateAction<string[]>>;
}

/* ============================================================
   Component
============================================================ */

export function Sidebar({
    isCollapsed,
    expandedMenus,
    setExpandedMenus,
}: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<DecodedToken | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const loggedInUser = await getLoggedInUser();
            setUser(loggedInUser);
        };
        fetchUser();
    }, []);

    const roles = user?.roles || [];
    const permissions = user?.permissions || [];

    /* ============================================================
         Permissions
      ============================================================ */

    const isAllowed = (item: NavItem) => {
        if (roles.includes('superadmin') || roles.includes('admin') || permissions.includes('*'))
            return true;

        if (item.rolesAllowed && !item.rolesAllowed.some((r) => roles.includes(r)))
            return false;

        if (
            item.permissionsAllowed &&
            !item.permissionsAllowed.some((p) => permissions.includes(p))
        )
            return false;

        return true;
    };

    const isSubItemAllowed = (item: { rolesAllowed?: string[], permissionsAllowed?: string[] }) => {
        if (roles.includes('superadmin') || roles.includes('admin') || permissions.includes('*'))
            return true;

        if (item.rolesAllowed && !item.rolesAllowed.some((r) => roles.includes(r)))
            return false;
        if (
            item.permissionsAllowed &&
            !item.permissionsAllowed.some((p) => permissions.includes(p))
        )
            return false;
        return true;
    };

    /* ============================================================
         Active Route Sync
      ============================================================ */

    const activeMenuId = React.useMemo(() => {
        const findActive = (items: NavItem[]): string | null => {
            for (const item of items) {
                if (item.path && location.pathname.startsWith(item.path)) {
                    return item.id;
                }
                if (item.submenu) {
                    // Check submenu items for active path
                    for (const sub of item.submenu) {
                        if (sub.path && location.pathname.startsWith(sub.path)) {
                            return sub.id;
                        }
                    }
                }
            }
            return null;
        };

        return findActive(NAV_ITEMS) ?? "Home";
    }, [location.pathname]);

    /* Auto-expand parent when child is active */
    useEffect(() => {
        NAV_ITEMS.forEach((item) => {
            if (
                item.submenu?.some((sub) => sub.id === activeMenuId) &&
                !expandedMenus.includes(item.id)
            ) {
                setExpandedMenus((prev) => [...prev, item.id]);
            }
        });
    }, [activeMenuId, expandedMenus, setExpandedMenus]);

    /* ============================================================
         Handlers
      ============================================================ */

    const toggleMenu = (id: string) => {
        if (isCollapsed) return;
        setExpandedMenus((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const HomeIcon = NAV_ITEMS[0].icon;

    /* ============================================================
         Render
      ============================================================ */

    return (
        <aside
            className={`
                ${isCollapsed ? "w-[70px]" : "w-[280px]"}
                bg-admin-panel p-4 rounded-4xl m-1
                flex flex-col shadow-xl
                transition-all duration-300
                h-screen
            `}
        >
            {/* ======================================================
                FIXED TOP — LOGO + HOME
            ====================================================== */}
            <div className="flex-none pb-4">
                {/* Logo Space */}
                <div className={`mb-6 flex items-center ${isCollapsed ? "justify-center" : "justify-center px-2"}`}>
                    <img 
                        src={logo} 
                        alt="Anant Enterprises Logo" 
                        className={`${isCollapsed ? "h-12 w-auto" : "h-16 w-auto max-w-[180px]"} object-contain transition-all duration-300`}
                    />
                </div>

                {/* Home Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className={`
                        SidebarBtn
                        ${isCollapsed ? "justify-center" : "gap-3 px-4"}
                        py-3 rounded-xl
                        ${activeMenuId === "Home" ? "SidebarBtnActive ActiveBorder" : ""}
                    `}
                >
                    <HomeIcon className="SidebarIcon w-6 h-6" />
                    {!isCollapsed && <span className="SidebarLabel">Home</span>}
                </button>
            </div>

            {/* ======================================================
                SCROLLABLE MIDDLE
            ====================================================== */}
            <div className="flex-1 overflow-y-auto pr-1">
                <nav className="space-y-1">
                    {NAV_ITEMS.slice(1)
                        .filter(isAllowed)
                        .map(item => {
                            const submenu = item.submenu?.filter(isSubItemAllowed);
                            const isParentActive =
                                activeMenuId === item.id ||
                                submenu?.some(sub => sub.id === activeMenuId);

                            return (
                                <div key={item.id}>
                                    {/* MAIN MENU ITEM */}
                                    <button
                                        onClick={() => {
                                            if (item.path) navigate(item.path);
                                            if (submenu) toggleMenu(item.id);
                                        }}
                                        className={`
                                            SidebarBtn
                                            ${isCollapsed ? "justify-center" : "gap-3 px-4"}
                                            py-2.5 rounded-xl text-left
                                            ${isParentActive ? "SidebarBtnActive ActiveBorder" : ""}
                                        `}
                                    >
                                        {item.icon && (
                                            <item.icon className="SidebarIcon w-6 h-6" />
                                        )}

                                        {!isCollapsed && (
                                            <span className="SidebarLabel flex-1">
                                                {item.label}
                                            </span>
                                        )}

                                        {!isCollapsed && submenu && (
                                            expandedMenus.includes(item.id)
                                                ? <ChevronDown className="w-4 h-4" />
                                                : <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>

                                    {/* SUBMENU */}
                                    {!isCollapsed && submenu && (
                                        <div
                                            className={`
                                                SubmenuWrapper
                                                ${expandedMenus.includes(item.id)
                                                    ? "SubmenuOpen"
                                                    : "SubmenuClosed"
                                                }
                                            `}
                                        >
                                            <div className="ml-6 mt-1 space-y-1 border-l border-gray-700 pl-4">
                                                {submenu.map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => navigate(sub.path!)}
                                                        className={`
                                                        SidebarBtn
                                                        px-4 py-2 rounded-lg text-sm text-left
                                                        ${activeMenuId === sub.id
                                                                ? "SidebarBtnActive"
                                                                : ""
                                                            }
                                                        `}
                                                    >
                                                        <span>-</span>
                                                        <span className="SidebarLabel flex-1">
                                                            {sub.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </nav>
            </div>

            {/* ======================================================
                FIXED BOTTOM — SETTINGS
            ====================================================== */}
            <div className="pt-4 mt-4">
                <button
                    onClick={() => navigate("/settings")}
                    className={`
                        SidebarBtn
                        ${isCollapsed ? "justify-center" : "gap-3 px-4"}
                        py-3 rounded-xl
                        ${activeMenuId === "Settings" ? "SidebarBtnActive" : ""}
                    `}
                >
                    <Settings className="SidebarIcon w-5 h-5" />
                    {!isCollapsed && (
                        <span className="SidebarLabel">Settings</span>
                    )}
                </button>
            </div>
        </aside>
    );
}
