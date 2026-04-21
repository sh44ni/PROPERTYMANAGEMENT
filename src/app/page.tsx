'use client';

import { DashboardLayout } from '@/components/layout';
import {
  RentCollectionCard,
  StatsRow,
  QuickActionsCard,
  PendingPaymentsCard,
  RevenueChartCard,
  AvailablePropertiesCard,
} from '@/components/dashboard';
import {
  RentCollectionSkeleton,
  StatsRowSkeleton,
  RevenueChartSkeleton,
  DashboardListSkeleton,
} from '@/components/ui/skeleton';
import { useApi } from '@/hooks/useApi';

interface DashboardPayload {
  stats: {
    totalProperties: number;
    occupancy: number;
    expenses: number;
    cashFlow: number;
  };
  rentCollection: {
    totalRent: number;
    collected: number;
    pending: number;
    month: string;
    overdueCount: number;
  };
  chartData: Array<{ month: string; monthAr: string; revenue: number; expenses: number }>;
  overdueRentals: Array<any>;
  availableProperties: Array<any>;
}

export default function Dashboard() {
  const { data, error } = useApi<DashboardPayload>('/api/dashboard/stats', {
    dedupeMs: 30_000,
  });

  // Show skeletons the moment the page renders — no full-page spinner.
  const ready = !!data;

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <p className="text-destructive font-medium">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  const pendingPaymentsData = (data?.overdueRentals ?? []).map((r: any) => ({
    id: r.id,
    tenantName: r.customer?.name || 'Unknown',
    propertyName: r.property?.title || 'Unknown Property',
    amount: r.monthlyRent,
    dueDate: r.paidUntil,
    isOverdue: true,
  }));

  const availablePropertiesData = (data?.availableProperties ?? []).map((p: any) => ({
    id: p.id,
    propertyId: 'PRP-' + p.id.substring(0, 4).toUpperCase(),
    name: p.title,
    nameAr: p.title,
    location: p.location || 'Unknown',
    locationAr: p.location || 'Unknown',
    type: p.type === 'villa' || p.type === 'apartment' ? p.type : 'apartment',
    rent: p.price,
    bedrooms: p.bedrooms || 0,
    area: p.area || 0,
    image: p.images && p.images.length > 0 ? p.images[0] : undefined,
  }));

  const stats = data?.stats;
  const rentCollection = data?.rentCollection;
  const chartData = data?.chartData ?? [];

  return (
    <DashboardLayout>
      {/* Mobile layout */}
      <div className="flex flex-col gap-4 lg:hidden">
        {ready && rentCollection ? (
          <RentCollectionCard
            totalRent={rentCollection.totalRent}
            collected={rentCollection.collected}
            pending={rentCollection.pending}
            month={rentCollection.month}
            overdueCount={rentCollection.overdueCount}
          />
        ) : (
          <RentCollectionSkeleton />
        )}
        {ready && stats ? (
          <StatsRow
            totalProperties={stats.totalProperties}
            occupancy={stats.occupancy}
            expenses={stats.expenses}
            cashFlow={stats.cashFlow}
          />
        ) : (
          <StatsRowSkeleton />
        )}
        <QuickActionsCard />
        {ready ? (
          <PendingPaymentsCard payments={pendingPaymentsData} />
        ) : (
          <DashboardListSkeleton rows={3} />
        )}
        {ready ? (
          <RevenueChartCard data={chartData} />
        ) : (
          <RevenueChartSkeleton />
        )}
        {ready ? (
          <AvailablePropertiesCard properties={availablePropertiesData} />
        ) : (
          <DashboardListSkeleton rows={3} />
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
        <div className="col-span-3 flex flex-col gap-6">
          {ready && rentCollection ? (
            <RentCollectionCard
              totalRent={rentCollection.totalRent}
              collected={rentCollection.collected}
              pending={rentCollection.pending}
              month={rentCollection.month}
              overdueCount={rentCollection.overdueCount}
            />
          ) : (
            <RentCollectionSkeleton />
          )}
          {ready ? (
            <RevenueChartCard data={chartData} />
          ) : (
            <RevenueChartSkeleton />
          )}
          {ready ? (
            <AvailablePropertiesCard properties={availablePropertiesData} />
          ) : (
            <DashboardListSkeleton rows={3} />
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-6">
          {ready && stats ? (
            <StatsRow
              totalProperties={stats.totalProperties}
              occupancy={stats.occupancy}
              expenses={stats.expenses}
              cashFlow={stats.cashFlow}
            />
          ) : (
            <StatsRowSkeleton />
          )}
          <QuickActionsCard />
          {ready ? (
            <PendingPaymentsCard payments={pendingPaymentsData} />
          ) : (
            <DashboardListSkeleton rows={3} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
