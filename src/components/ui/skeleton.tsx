import { cn } from '@/lib/utils';

// Base skeleton shimmer block
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-muted/60',
                className
            )}
            {...props}
        />
    );
}

// Customer card skeleton — matches the real customer card layout
export function CustomerCardSkeleton() {
    return (
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4">
            <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-28" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/40">
                <div className="text-center space-y-1.5">
                    <Skeleton className="h-5 w-5 mx-auto" />
                    <Skeleton className="h-3 w-10 mx-auto" />
                </div>
                <div className="text-center space-y-1.5">
                    <Skeleton className="h-5 w-5 mx-auto" />
                    <Skeleton className="h-3 w-10 mx-auto" />
                </div>
                <div className="text-center space-y-1.5">
                    <Skeleton className="h-5 w-12 mx-auto" />
                    <Skeleton className="h-3 w-14 mx-auto" />
                </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-border/40">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </div>
        </div>
    );
}

// Property card skeleton
export function PropertyCardSkeleton() {
    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-3 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </div>
        </div>
    );
}

// Contract row skeleton
export function ContractRowSkeleton() {
    return (
        <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-14 rounded" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3.5 w-32" />
                </div>
                <div className="flex gap-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// Table row skeleton (for owners, rentals, accounts)
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr className="border-b border-border/50">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="py-3 px-4">
                    <Skeleton className="h-4 w-full max-w-[140px]" />
                </td>
            ))}
        </tr>
    );
}

// Stats card skeleton
export function StatCardSkeleton() {
    return (
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-16" />
        </div>
    );
}

// Dashboard: rent collection card skeleton
export function RentCollectionSkeleton() {
    return (
        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-2.5 w-20" />
                </div>
            </div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    );
}

// Dashboard: stats row skeleton (4 stat tiles)
export function StatsRowSkeleton() {
    return (
        <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:pb-0">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 min-w-[160px] rounded-xl border border-border/50 bg-card">
                    <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Dashboard: revenue chart skeleton
export function RevenueChartSkeleton() {
    return (
        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-7 w-20 rounded-md" />
            </div>
            <div className="flex items-end gap-2 h-40">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t-md"
                        style={{ height: `${40 + (i * 7) % 60}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-8" />
                ))}
            </div>
        </div>
    );
}

// Dashboard: small list card (pending payments, available properties)
export function DashboardListSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-4 w-14" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Project card skeleton
export function ProjectCardSkeleton() {
    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <Skeleton className="h-36 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2.5 w-full rounded-full" />
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    );
}
