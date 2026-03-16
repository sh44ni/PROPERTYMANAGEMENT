'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import {
  RentCollectionCard,
  StatsRow,
  QuickActionsCard,
  PendingPaymentsCard,
  RevenueChartCard,
  AvailablePropertiesCard,
} from '@/components/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Dashboard() {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cea26e]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return <DashboardLayout><div>Error loading data</div></DashboardLayout>;

  const { 
    stats, 
    rentCollection, 
    chartData, 
    overdueRentals = [], 
    availableProperties = [] 
  } = data;

  // Mappers
  const pendingPaymentsData = overdueRentals.map((r: any) => ({
    id: r.id,
    tenantName: r.customer?.name || 'Unknown',
    propertyName: r.property?.title || 'Unknown Property',
    amount: r.monthlyRent,
    dueDate: r.paidUntil,
    isOverdue: true
  }));

  const availablePropertiesData = availableProperties.map((p: any) => ({
    id: p.id,
    propertyId: 'PRP-' + p.id.substring(0, 4).toUpperCase(),
    name: p.title,
    nameAr: p.title,
    location: p.location || 'Unknown',
    locationAr: p.location || 'Unknown',
    type: (p.type === 'villa' || p.type === 'apartment') ? p.type : 'apartment',
    rent: p.price,
    bedrooms: p.bedrooms || 0,
    area: p.area || 0,
    image: p.images && p.images.length > 0 ? p.images[0] : undefined
  }));

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 lg:hidden">
        <RentCollectionCard
          totalRent={rentCollection.totalRent}
          collected={rentCollection.collected}
          pending={rentCollection.pending}
          month={rentCollection.month}
          overdueCount={rentCollection.overdueCount}
        />
        <StatsRow
          totalProperties={stats.totalProperties}
          occupancy={stats.occupancy}
          expenses={stats.expenses}
          cashFlow={stats.cashFlow}
        />
        <QuickActionsCard />
        <PendingPaymentsCard payments={pendingPaymentsData} />
        <RevenueChartCard data={chartData} />
        <AvailablePropertiesCard properties={availablePropertiesData} />
      </div>

      <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
        <div className="col-span-3 flex flex-col gap-6">
          <RentCollectionCard
            totalRent={rentCollection.totalRent}
            collected={rentCollection.collected}
            pending={rentCollection.pending}
            month={rentCollection.month}
            overdueCount={rentCollection.overdueCount}
          />
          <RevenueChartCard data={chartData} />
          <AvailablePropertiesCard properties={availablePropertiesData} />
        </div>
        <div className="col-span-2 flex flex-col gap-6">
          <StatsRow
            totalProperties={stats.totalProperties}
            occupancy={stats.occupancy}
            expenses={stats.expenses}
            cashFlow={stats.cashFlow}
          />
          <QuickActionsCard />
          <PendingPaymentsCard payments={pendingPaymentsData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
