'use client';

import { useState, useEffect } from 'react';
import {
    useNotificationPreferences,
    useUpdateNotificationPreferences,
    useResetNotificationPreferences,
} from '@/queries';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, RotateCcw, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { NotificationPreferences } from '@/types/notification';

export function NotificationSettingsClient() {
    const { data: preferencesData, isLoading } = useNotificationPreferences();
    const updateMutation = useUpdateNotificationPreferences();
    const resetMutation = useResetNotificationPreferences();

    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize local state from fetched data
    useEffect(() => {
        if (preferencesData?.data) {
            setPreferences(preferencesData.data);
        }
    }, [preferencesData]);

    const handleChannelToggle = (channel: keyof NotificationPreferences['channels']) => {
        if (!preferences) return;

        setPreferences({
            ...preferences,
            channels: {
                ...preferences.channels,
                [channel]: !preferences.channels[channel],
            },
        });
        setHasChanges(true);
    };

    const handleTypeToggle = (type: keyof NotificationPreferences['types']) => {
        if (!preferences) return;

        setPreferences({
            ...preferences,
            types: {
                ...preferences.types,
                [type]: !preferences.types[type],
            },
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!preferences) return;

        await updateMutation.mutateAsync(preferences);
        setHasChanges(false);
    };

    const handleReset = async () => {
        await resetMutation.mutateAsync();
        setHasChanges(false);
    };

    if (isLoading || !preferences) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Customize how and when you receive notifications
                </p>
            </div>

            {/* Channels */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Channels
                    </CardTitle>
                    <CardDescription>
                        Choose where you want to receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <div>
                                <Label htmlFor="in-app" className="font-medium">In-App Notifications</Label>
                                <p className="text-sm text-gray-500">
                                    Receive notifications within the application
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="in-app"
                            checked={preferences.channels.in_app}
                            onCheckedChange={() => handleChannelToggle('in_app')}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div>
                                <Label htmlFor="email" className="font-medium">Email Notifications</Label>
                                <p className="text-sm text-gray-500">
                                    Receive notifications via email (coming soon)
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="email"
                            checked={preferences.channels.email}
                            onCheckedChange={() => handleChannelToggle('email')}
                            disabled
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-gray-500" />
                            <div>
                                <Label htmlFor="sms" className="font-medium">SMS Notifications</Label>
                                <p className="text-sm text-gray-500">
                                    Receive notifications via SMS (coming soon)
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="sms"
                            checked={preferences.channels.sms}
                            onCheckedChange={() => handleChannelToggle('sms')}
                            disabled
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Types</CardTitle>
                    <CardDescription>
                        Select which types of notifications you want to receive
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(preferences.types).map(([type, enabled], index) => (
                        <div key={type}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor={type} className="font-medium">
                                        {formatNotificationType(type)}
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        {getNotificationTypeDescription(type)}
                                    </p>
                                </div>
                                <Switch
                                    id={type}
                                    checked={enabled}
                                    onCheckedChange={() => handleTypeToggle(type as keyof NotificationPreferences['types'])}
                                />
                            </div>
                            {index < Object.keys(preferences.types).length - 1 && <Separator className="mt-4" />}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={resetMutation.isPending}
                >
                    {resetMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    Reset to Defaults
                </Button>

                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || updateMutation.isPending}
                >
                    {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

// Helper functions
function formatNotificationType(type: string): string {
    return type
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
}

function getNotificationTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
        ORDER_CREATED: 'When a new order is placed',
        ORDER_SHIPPED: 'When your order has been shipped',
        ORDER_DELIVERED: 'When your order has been delivered',
        PAYMENT_CAPTURED: 'When a payment is successfully processed',
        LOW_STOCK_ALERT: 'When products you favorited are low in stock',
        USER_WELCOME: 'Welcome messages and onboarding',
    };
    return descriptions[type] || 'Notification updates';
}
