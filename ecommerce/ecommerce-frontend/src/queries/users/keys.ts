/**
 * User Query Keys
 */

export const userKeys = {
    all: ['users'] as const,
    current: () => [...userKeys.all, 'me'] as const,
    profile: () => [...userKeys.current(), 'profile'] as const,
    addresses: () => [...userKeys.current(), 'addresses'] as const,
    address: (id: string) => [...userKeys.addresses(), id] as const,
};
