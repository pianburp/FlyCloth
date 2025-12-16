import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Hero Skeleton */}
            <Skeleton className="w-full h-[400px] rounded-xl" />

            {/* Section Header Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-72" />
            </div>

            {/* Product Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}

export function AdminPageSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Page Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}
