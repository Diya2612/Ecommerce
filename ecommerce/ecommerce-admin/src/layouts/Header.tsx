import {
    ChevronDown,
    LayoutGrid,
    PanelLeftClose
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileImg from "../assets/Frame 3562.jpg";
import { getLoggedInUser } from "@/utils/auth";

import { GlobalSearch } from "@/components/search";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { NotificationsPopover } from "@/features/notifications";
import { makeGetRequest } from "@/lib/api/baseApi";

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (v: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;

    // MOBILE SUPPORT
    mobileSidebarOpen: boolean;
    setMobileSidebarOpen: (v: boolean) => void;
}

export function Header({
    isCollapsed,
    setIsCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen
}: HeaderProps) {
    const [showProfile, setShowProfile] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const navigate = useNavigate();
    const { signOut } = useAuth();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const user = getLoggedInUser();
            if (!user) return;

            // Use the user data we already have (from localStorage set during login)
            const name = user.name || user.email || 'User';
            setDisplayName(name.split(' ')[0] || name);

            // Fetch the user's profile to get the profile image URL and up-to-date name
            try {
                const response = await makeGetRequest('/users/me');
                // API response is wrapped: { success, message, data: {user} }
                const apiResponse = response.data as any;
                const userData = apiResponse.data;

                if (userData) {
                    if (userData.profile_image_url) {
                        setAvatarUrl(userData.profile_image_url);
                    }

                    // Prioritize proper first name from backend
                    const freshName = userData.first_name || userData.name || 'User';
                    setDisplayName(freshName);
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchUserProfile();

        // Listen for profile picture updates
        const handleProfileUpdate = (event: CustomEvent) => {
            if (event.detail?.profileImageUrl) {
                setAvatarUrl(event.detail.profileImageUrl);
            }
        };

        // Listen for profile name updates
        const handleNameUpdate = (event: CustomEvent) => {
            if (event.detail?.firstName) {
                setDisplayName(event.detail.firstName);
            } else if (event.detail?.name) {
                setDisplayName(event.detail.name);
            }
        };

        window.addEventListener('profilePictureUpdated', handleProfileUpdate as EventListener);
        window.addEventListener('profileNameUpdated', handleNameUpdate as EventListener);

        window.addEventListener('profilePictureUpdated', handleProfileUpdate as EventListener);

        return () => {
            window.removeEventListener('profilePictureUpdated', handleProfileUpdate as EventListener);
            window.removeEventListener('profileNameUpdated', handleNameUpdate as EventListener);
        };
    }, []);

    return (
        <>
            <header
                className="
          bg-admin-panel rounded-4xl mx-2 mt-2 px-3 sm:px-4 py-2
          flex items-center justify-between shadow-lg relative
        "
                role="banner"
            >
                {/* LEFT (mobile: hamburger, desktop: collapse) */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* mobile hamburger */}
                    <button
                        className="p-2 sm:hidden text-white hover:bg-[#251550] rounded-lg transition"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        aria-label="Toggle menu"
                    >
                        <LayoutGrid className="w-6 h-6" />
                    </button>

                    {/* desktop collapse button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-[#251550] rounded-lg transition text-white hidden sm:inline-flex"
                        aria-label="Toggle sidebar"
                    >
                        {isCollapsed ? (
                            <PanelLeftClose className="w-6 h-6" />
                        ) : (
                            <LayoutGrid className="w-6 h-6" />
                        )}
                    </button>
                </div>

                <div className="flex flex-1 max-w-md mx-2 sm:mx-4">
                    <GlobalSearch
                        onNavigate={(path) => navigate(path)}
                    />
                </div>

                {/* RIGHT (notifications + profile) */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notifications */}
                    <NotificationsPopover />

                    {/* Profile (on mobile only show avatar icon and no text) */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-2 sm:gap-3 hover:bg-[#251550] 
                        px-2 sm:px-3 py-2 rounded-lg transition text-white"
                            aria-haspopup="true"
                            aria-expanded={showProfile}
                        >
                            <img
                                src={avatarUrl || (profileImg as unknown as string)}
                                alt="Profile"
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                            />
                            <span className="hidden sm:inline">{displayName ?? 'User'}</span>
                            <ChevronDown className="w-4 h-4 hidden sm:inline" />
                        </button>

                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white shadow-xl rounded-xl border border-gray-200 py-2 z-20">
                                <button
                                    onClick={() => {
                                        navigate(ROUTES.PROFILE);
                                        setShowProfile(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => {
                                        navigate(ROUTES.SETTINGS.OVERVIEW);
                                        setShowProfile(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                >
                                    Settings
                                </button>
                                <hr className="my-2" />
                                <button
                                    onClick={async () => {
                                        await signOut();
                                        navigate(ROUTES.AUTH.LOGIN, { replace: true });
                                    }}
                                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
