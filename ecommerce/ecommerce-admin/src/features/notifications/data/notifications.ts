import type { LegacyNotification } from "../types";

const notifications: LegacyNotification[] = [
    {
        id: "n1",
        title: "System Maintenance Scheduled",
        body: "Platform will be under maintenance on Jan 10, 2026 from 2-4 AM EST",
        time: "5 mins ago",
        unread: true,
        type: "system",
    },
    {
        id: "n2",
        title: "Security Alert",
        body: "New login detected from Chrome on Windows in Toronto, Canada",
        time: "1 hour ago",
        unread: true,
        type: "security",
    },
    {
        id: "n3",
        title: "New Student Application",
        body: "Sarah Chen submitted application for University of Toronto",
        time: "2 hours ago",
        unread: false,
        type: "user",
    },
    {
        id: "n4",
        title: "Admin Action Required",
        body: "3 documents are pending verification for student ID STU-2024-00156",
        time: "2 hours ago",
        unread: true,
        type: "admin",
    },
];

export default notifications;
