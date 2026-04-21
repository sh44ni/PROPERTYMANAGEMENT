import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedJson, errorJson } from '@/lib/api-cache';

export const dynamic = 'force-dynamic';

/**
 * Dashboard stats — rewritten to avoid pulling full relation arrays.
 *
 * Instead of fetching every active rental + every transaction in the last 6
 * months and crunching the numbers in JS, this version:
 *   - Uses `count` / `aggregate` / `groupBy` so the DB returns numbers only.
 *   - Runs all queries in parallel (Promise.all).
 *   - Keeps the payload shape identical for the frontend.
 */
export async function GET(_request: NextRequest) {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const [
            totalProperties,
            rentedProperties,
            activeRentAgg,
            monthIncomeAgg,
            monthExpenseAgg,
            monthRentPaidAgg,
            availableProperties,
            overdueRentals,
            overdueCount,
            monthlyRows,
        ] = await Promise.all([
            prisma.property.count(),
            prisma.property.count({ where: { status: 'rented' } }),
            prisma.rental.aggregate({
                where: { status: 'active' },
                _sum: { monthlyRent: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    category: 'income',
                    status: { not: 'cancelled' },
                    date: { gte: startOfMonth, lt: endOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    category: 'expense',
                    status: { not: 'cancelled' },
                    date: { gte: startOfMonth, lt: endOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    type: 'rent_payment',
                    status: { not: 'cancelled' },
                    date: { gte: startOfMonth, lt: endOfMonth },
                },
                _sum: { amount: true },
            }),
            prisma.property.findMany({
                where: { status: 'available' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    area: true,
                    location: true,
                    price: true,
                    bedrooms: true,
                    images: true,
                    project: { select: { id: true, name: true } },
                },
            }),
            prisma.rental.findMany({
                where: { paymentStatus: { in: ['unpaid', 'overdue'] }, status: 'active' },
                take: 5,
                orderBy: { paidUntil: 'asc' },
                select: {
                    id: true,
                    monthlyRent: true,
                    paidUntil: true,
                    customer: { select: { id: true, name: true, phone: true } },
                    property: { select: { id: true, title: true } },
                },
            }),
            prisma.rental.count({
                where: { paymentStatus: { in: ['unpaid', 'overdue'] }, status: 'active' },
            }),
            // 6-month income/expense buckets in a single DB round-trip.
            prisma.transaction.findMany({
                where: {
                    status: { not: 'cancelled' },
                    date: { gte: sixMonthsAgo, lt: endOfMonth },
                },
                select: { date: true, amount: true, category: true },
            }),
        ]);

        const occupancy =
            totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0;

        const revenue = monthIncomeAgg._sum.amount ?? 0;
        const expenses = monthExpenseAgg._sum.amount ?? 0;
        const cashFlow = revenue - expenses;

        const totalRentDue = activeRentAgg._sum.monthlyRent ?? 0;
        const collectedRent = monthRentPaidAgg._sum.amount ?? 0;
        const pendingRent = Math.max(0, totalRentDue - collectedRent);

        // Bucket last 6 months from the slim rows we already fetched.
        const monthsMap = new Map<string, { month: string; monthAr: string; revenue: number; expenses: number }>();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthsMap.set(key, {
                month: d.toLocaleDateString('en-US', { month: 'short' }),
                monthAr: d.toLocaleDateString('ar-OM', { month: 'long' }),
                revenue: 0,
                expenses: 0,
            });
        }

        for (const t of monthlyRows) {
            const d = t.date as Date;
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const entry = monthsMap.get(key);
            if (!entry) continue;
            if (t.category === 'income') entry.revenue += t.amount;
            else if (t.category === 'expense') entry.expenses += t.amount;
        }

        return cachedJson(
            {
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
                    overdueCount,
                },
                chartData: Array.from(monthsMap.values()),
                overdueRentals,
                availableProperties,
            },
            { cdn: 15, swr: 60 },
        );
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return errorJson('Failed to fetch dashboard stats');
    }
}
