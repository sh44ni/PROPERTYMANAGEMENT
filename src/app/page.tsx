import { DashboardLayout } from '@/components/layout';
import {
  RentCollectionCard,
  StatsRow,
  QuickActionsCard,
  PendingPaymentsCard,
  RevenueChartCard,
  AvailablePropertiesCard,
} from '@/components/dashboard';

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Mobile Layout - Single Column */}
      <div className="flex flex-col gap-4 lg:hidden">
        {/* 1. Rent Collection */}
        <RentCollectionCard
          totalRent={38000}
          collected={26600}
          pending={11400}
          month="January 2026"
          overdueCount={3}
        />

        {/* 2. Stats Row - Horizontal Scroll */}
        <StatsRow
          totalProperties={12}
          occupancy={85}
          expenses={2400}
          cashFlow={35600}
        />

        {/* 3. Quick Actions */}
        <QuickActionsCard />

        {/* 4. Pending Payments */}
        <PendingPaymentsCard />

        {/* 5. Revenue Chart */}
        <RevenueChartCard />

        {/* 6. Available Properties */}
        <AvailablePropertiesCard />
      </div>

      {/* Desktop Layout - Two Columns */}
      <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
        {/* Left Column - 60% (3/5) */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* Rent Collection Hero */}
          <RentCollectionCard
            totalRent={38000}
            collected={26600}
            pending={11400}
            month="January 2026"
            overdueCount={3}
          />

          {/* Revenue Chart */}
          <RevenueChartCard />

          {/* Available Properties */}
          <AvailablePropertiesCard />
        </div>

        {/* Right Column - 40% (2/5) */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Stats Grid 2x2 */}
          <StatsRow
            totalProperties={12}
            occupancy={85}
            expenses={2400}
            cashFlow={35600}
          />

          {/* Quick Actions */}
          <QuickActionsCard />

          {/* Pending Payments */}
          <PendingPaymentsCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
