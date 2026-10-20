import React from "react";
import {
    ChevronRight,
    Store,
    Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/layouts/headers";

// Settings sections data
const settingsSections = [
    {
        id: "store-details",
        title: "Store / Company Details",
        description: "Manage your business profile and address",
        icon: Store,
        link: "/settings/store",
    },
    {
        id: "policies",
        title: "Policies",
        description: "Manage store policies and legal documents",
        icon: Shield,
        link: "/settings/policies",
    },
];

const SettingsOverviewPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Standardized Page Header */}
            <PageHeader
                title="Settings"
                subtitle="Manage your organization preferences and configurations"
                breadcrumbs={[
                    { label: 'Dashboard', onClick: () => navigate("/dashboard") },
                    { label: 'Settings', active: true }
                ]}
                backIcon="arrow"
                onBack={() => navigate(-1)}
            />

            {/* Settings Grid */}
            <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settingsSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => navigate(section.link)}
                            className="group flex flex-col p-6 bg-white border border-slate-200 hover:border-[#0E042F] focus:border-[#0E042F] active:border-[#0E042F] rounded-xl hover:shadow-md transition-all text-left outline-none"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-slate-400 transition-colors">
                                    <section.icon size={26} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-[#0E042F]">{section.title}</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {section.description}
                            </p>
                            <div className="mt-auto pt-6 flex items-center text-sm font-medium text-[#0E042F] transition-opacity">
                                <span>Manage</span>
                                <ChevronRight size={16} className="ml-1" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsOverviewPage;

