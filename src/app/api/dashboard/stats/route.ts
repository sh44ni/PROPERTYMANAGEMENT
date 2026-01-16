import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Fetch all data in parallel
        const [
            totalProperties,
            rentedProperties,
            activeRentals,
            availableProperties,
            overdueRentals,
            transactions
        ] = await Promise.all([
            prisma.property.count(),
            prisma.property.count({ where: { status: 'rented' } }),
            prisma.rental.findMany({
                where: { status: 'active' },
                include: { customer: true, property: true }
            }),
            prisma.property.findMany({
                where: { status: 'available' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { project: true }
            }),
            prisma.rental.findMany({
                where: { paymentStatus: { in: ['unpaid', 'overdue'] } },
                take: 5,
                include: { customer: true, property: true }
            }),
            prisma.transaction.findMany({
                where: { date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } },
                orderBy: { date: 'asc' }
            })
        ]);

        // Calculate Stats
        const occupancy = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0;

        // Financials (Current Month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentMonthTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const expenses = currentMonthTransactions
            .filter((t: any) => t.category === 'expense' && t.status !== 'cancelled')
            .reduce((sum, t) => sum + t.amount, 0);

        const revenue = currentMonthTransactions
            .filter((t: any) => t.category === 'income' && t.status !== 'cancelled')
            .reduce((sum, t) => sum + t.amount, 0);

        const cashFlow = revenue - expenses;

        // Rent Collection
        const totalRentDue = activeRentals.reduce((sum, r) => sum + r.monthlyRent, 0);
        const collectedRent = currentMonthTransactions
            .filter((t: any) => t.type === 'rent_payment' && t.status !== 'cancelled')
            .reduce((sum, t) => sum + t.amount, 0);
        const pendingRent = Math.max(0, totalRentDue - collectedRent);

        // Chart Data - last 6 months
        const monthsMap = new Map();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
            const monthAr = d.toLocaleDateString('ar-OM', { month: 'long' });
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthsMap.set(key, { month: monthShort, monthAr, revenue: 0, expenses: 0 });
        }

        transactions.forEach((t: any) => {
            // Skip cancelled transactions
            if (t.status === 'cancelled') return;

            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (monthsMap.has(key)) {
                const entry = monthsMap.get(key);
                if (t.category === 'income') entry.revenue += t.amount;
                if (t.category === 'expense') entry.expenses += t.amount;
            }
        });

        const chartData = Array.from(monthsMap.values());

        return NextResponse.json({
            stats: {
                totalProperties,
                occupancy,
                expenses,
                cashFlow,
            },
            rentCollection: {
                totalRent: totalRentDue,
                collected: collectedRent,
                pending: pendingRent,
                month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                overdueCount: overdueRentals.length
            },
            chartData,
            overdueRentals,
            availableProperties
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
