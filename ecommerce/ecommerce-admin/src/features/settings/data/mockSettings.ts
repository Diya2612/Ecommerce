import type { Role } from "../types/settings.types";

export const MOCK_ROLES: Role[] = [
    {
        id: "ROLE-001",
        name: "Super Admin",
        type: "Full Access",
        permissions: "All Modules",
        users: 2,
        createdBy: "System",
        created_at: "2024-01-01T00:00:00Z"
    },
    {
        id: "ROLE-002",
        name: "Sales Manager",
        type: "Frontend",
        permissions: "Orders, Customers, Reports",
        users: 5,
        createdBy: "Admin",
        created_at: "2024-02-15T00:00:00Z"
    },
    {
        id: "ROLE-003",
        name: "Inventory Manager",
        type: "Backend",
        permissions: "Inventory, Products, Shipping",
        users: 3,
        createdBy: "Admin",
        created_at: "2024-03-10T00:00:00Z"
    },
    {
        id: "ROLE-004",
        name: "Accountant",
        type: "Backend",
        permissions: "Accounting, Reports",
        users: 2,
        createdBy: "Admin",
        created_at: "2024-03-20T00:00:00Z"
    },
    {
        id: "ROLE-005",
        name: "Dispatch Team",
        type: "Frontend",
        permissions: "Shipping, Orders (View)",
        users: 8,
        createdBy: "Ops Head",
        created_at: "2024-04-05T00:00:00Z"
    },
    {
        id: "ROLE-006",
        name: "Customer Support",
        type: "Frontend",
        permissions: "Customers, Orders (View)",
        users: 6,
        createdBy: "Admin",
        created_at: "2024-05-01T00:00:00Z"
    },
];
