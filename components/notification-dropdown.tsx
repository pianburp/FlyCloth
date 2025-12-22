"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Clock, Package, Star, AlertTriangle, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

type NotificationType =
    | 'order_created'
    | 'order_status'
    | 'payment_received'
    | 'low_stock'
    | 'out_of_stock'
    | 'bad_review';

type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
};

function getTypeIcon(type: NotificationType) {
    switch (type) {
        case 'order_created':
        case 'payment_received':
            return <CreditCard className="h-4 w-4 text-green-500" />;
        case 'order_status':
            return <Truck className="h-4 w-4 text-blue-500" />;
        case 'low_stock':
            return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        case 'out_of_stock':
            return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'bad_review':
            return <Star className="h-4 w-4 text-yellow-500" />;
        default:
            return <Package className="h-4 w-4 text-muted-foreground" />;
    }
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            const data = await trpc.notifications.list.query({ limit: 20 });
            setNotifications(data as Notification[]);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch and refetch when dropdown opens
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await trpc.notifications.markAllAsRead.mutate();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Mark single as read
    const markAsRead = async (id: string) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification || notification.is_read) return;

        try {
            await trpc.notifications.markAsRead.mutate({ notificationId: id });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative transition-all duration-300 hover:bg-muted/50 rounded-full w-9 h-9 sm:w-10 sm:h-10"
                    aria-label="Notifications"
                >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[320px] sm:w-[380px] p-0 backdrop-blur-md bg-background/95 border-border/40 shadow-xl"
            >
                <div className="p-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                    <div className="flex flex-col gap-0.5">
                        <h4 className="text-base font-medium tracking-tight">
                            Notifications
                        </h4>
                        <p className="text-xs text-muted-foreground font-light">
                            {isLoading ? 'Loading...' : `You have ${unreadCount} unread messages`}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto px-2 py-1 text-xs text-gold hover:text-gold/80 hover:bg-gold/10 font-medium"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto py-1">
                    {isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <Bell className="mx-auto h-8 w-8 opacity-20 mb-2 animate-pulse" />
                            <p className="text-sm">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <Bell className="mx-auto h-8 w-8 opacity-20 mb-2" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-muted/40 rounded-none border-b border-border/20 last:border-0",
                                    !notification.is_read && "bg-muted/20"
                                )}
                                onClick={() => markAsRead(notification.id)}
                                asChild
                            >
                                <Link href={notification.link || "#"} className="block w-full">
                                    <div className="flex w-full justify-between items-start gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(notification.type)}
                                            <span className={cn(
                                                "text-sm font-medium",
                                                !notification.is_read && "text-foreground",
                                                notification.is_read && "text-muted-foreground"
                                            )}>
                                                {notification.title}
                                            </span>
                                        </div>
                                        {!notification.is_read && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mb-2 pl-6">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 uppercase tracking-wider pl-6">
                                        <Clock className="h-3 w-3" />
                                        {formatTimeAgo(notification.created_at)}
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <DropdownMenuSeparator className="m-0 bg-border/40" />
                <div className="p-2 bg-muted/20 text-center">
                    <Button variant="link" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-auto py-1" asChild>
                        <Link href="/user/notifications">View all notifications</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
