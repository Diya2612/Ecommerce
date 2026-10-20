import {
    Home,
    ShoppingCart,
    Package,
    Users,
    Layers,
    Warehouse,
} from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import type { NavItemList } from "./navigation.types";

/**
 * Navigation Configuration
 * 
 * Defines navigation menu items by adding metadata (icons, labels, permissions)
 * to route constants. This eliminates duplication between routes and menu.
 */

export const NAV_ITEMS: NavItemList = [
    {
        id: "dashboard",
        label: "Home",
        icon: Home,
        path: ROUTES.DASHBOARD,
    },
    {
        id: "customers",
        label: "Customers",
        icon: Users,
        path: ROUTES.CUSTOMERS.LIST,
    },
    {
        id: "products",
        label: "Products",
        icon: Package,
        path: ROUTES.PRODUCTS.LIST,
    },
    {
        id: "inventory",
        label: "Inventory",
        icon: Warehouse,
        path: ROUTES.INVENTORY.LIST,
    },
    {
        id: "tiers",
        label: "Tiers",
        icon: Layers,
        path: ROUTES.TIERS.LIST,
    },
    {
        id: "orders",
        label: "Orders",
        icon: ShoppingCart,
        path: ROUTES.ORDERS.LIST,
        submenu: [
            {
                id: "orders-draft",
                label: "Draft Orders",
                path: ROUTES.ORDERS.DRAFT
            },
            {
                id: "orders-abandoned-cart",
                label: "Abandoned Cart",
                path: ROUTES.ORDERS.ABANDONED_CART
            },
        ],
    },

];
