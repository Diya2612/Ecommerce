'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    isSearching?: boolean;
    placeholder?: string;
    debounceMs?: number;
}

export function SearchInput({
    value,
    onChange,
    onClear,
    isSearching = false,
    placeholder = 'Search for products...',
    debounceMs = 500,
}: SearchInputProps) {
    const [searchInput, setSearchInput] = useState(value);

    // Sync internal state with external value
    useEffect(() => {
        setSearchInput(value);
    }, [value]);

    // Debounced onChange handler
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== value) {
                onChange(searchInput);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchInput, value, onChange, debounceMs]);

    const handleClear = useCallback(() => {
        setSearchInput('');
        onClear();
    }, [onClear]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            handleClear();
            e.currentTarget.blur();
        } else if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    }, [handleClear]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="pl-10 pr-20 h-12 text-base rounded-xl border-gray-200 dark:border-gray-700 focus-visible:ring-[#00C4CC] focus-visible:border-[#00C4CC]"
                    aria-label="Search products"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isSearching && (
                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    )}
                    {searchInput && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
