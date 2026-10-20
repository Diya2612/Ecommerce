// Simple auth utility for demo purposes
// In a real app, this would integrate with your authentication system

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    roles?: string[];
    permissions: string[];
}

export const getLoggedInUser = (): User | null => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
        const user = JSON.parse(raw);
        if (!user.roles || user.roles.length === 0) {
            user.roles = ['admin', 'superadmin'];
        }
        if (!user.permissions || user.permissions.length === 0) {
            user.permissions = ['*'];
        }
        user.role = 'admin';
        return user;
    } catch {
        return null;
    }
};

export const setLoggedInUser = (user: User): void => {
    if (!user.roles || user.roles.length === 0) {
        user.roles = ['admin', 'superadmin'];
    }
    if (!user.permissions || user.permissions.length === 0) {
        user.permissions = ['*'];
    }
    user.role = 'admin';
    localStorage.setItem('user', JSON.stringify(user));
};

export const logout = (): void => {
    localStorage.removeItem('user');
    // Note: Token is managed by Supabase session
    // Use supabase.auth.signOut() for complete logout
};

export const isAuthenticated = (): boolean => {
    return getLoggedInUser() !== null;
};