import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports?type=occupancy|financial|units|expiring
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'occupancy';
        const projectId = searchParams.get('projectId') || searchParams.get('buildingId'); // support legacy param too
        const district = searchParams.get('district');
        const status = searchParams.get('status');
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');
        const daysFilter = searchParams.get('days'); // 30, 60, 90

        // ─── OCCUPANCY REPORT ────────────────────────────────────────────────────
        if (type === 'occupancy') {
            const projects = await prisma.project.findMany({
                where: {
                    ...(projectId && { id: projectId }),
                    ...(district && { districtName: district }),
                },
                include: {
                    owner: { select: { id: true, name: true, phone: true } },
                    properties: {
                        select: {
                            id: true,
                            maintenance: true,
                            rentals: {
                                where: { status: 'active' },
                                select: { id: true },
                                take: 1,
                            }
                        }
                    }
                }
            });

            let totalUnits = 0, totalRented = 0, totalVacant = 0, totalMaint = 0;
            const buildingStats = projects.map(b => {
                const units = b.properties.length;
                // Each unit is classified as exactly ONE state (rented > maintenance > vacant)
                const rented = b.properties.filter(u => u.rentals.length > 0).length;
                const maint = b.properties.filter(u =>
                    u.rentals.length === 0 && // not rented
                    u.maintenance && u.maintenance !== '0' && u.maintenance !== ''
                ).length;
                const vacant = Math.max(0, units - rented - maint);
                const occupancy = units > 0 ? Math.round((rented / units) * 100) : 0;
                totalUnits += units;
                totalRented += rented;
                totalVacant += vacant;
                totalMaint += maint;
                return {
                    id: b.id,
                    name: b.name,
                    city: b.city,
                    district: b.districtName,
                    ownerName: b.owner?.name || '-',
                    ownerPhone: b.owner?.phone || null,
                    units,
                    rented,
                    vacant,
                    maintenance: maint,
                    occupancy,
                };
            });

            const totalOccupancy = totalUnits > 0 ? Math.round((totalRented / totalUnits) * 100) : 0;
            return NextResponse.json({
                data: {
                    summary: { totalUnits, totalRented, totalVacant, totalMaintenance: totalMaint, totalOccupancy },
                    buildings: buildingStats, // kept as 'buildings' for UI compat
                }
            });
        }

        // ─── FINANCIAL REPORT ────────────────────────────────────────────────────
        if (type === 'financial') {
            const dateFilter = {
                ...(fromDate && { gte: new Date(fromDate) }),
                ...(toDate && { lte: new Date(toDate) }),
            };

            const rentals = await prisma.rental.findMany({
                where: {
                    status: 'active',
                    property: {
                        ...(projectId && { projectId }),
                    },
                    ...(Object.keys(dateFilter).length > 0 && { startDate: dateFilter }),
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            title: true,
                            projectId: true,
                            project: {
                                select: {
                                    id: true,
                                    name: true,
                                    ownerId: true,
                                    owner: { select: { id: true, name: true } }
                                }
                            },
                        }
                    },
                    customer: { select: { id: true, name: true, phone: true } }
                }
            });

            // Group by project
            const byProject: Record<string, { name: string; ownerName: string; monthlyIncome: number; count: number }> = {};
            // Group by owner
            const byOwner: Record<string, { name: string; monthlyIncome: number; count: number }> = {};
            let totalMonthlyIncome = 0;

            rentals.forEach(r => {
                totalMonthlyIncome += r.monthlyRent;
                const pid = r.property?.project?.id ?? 'unassigned';
                const pname = r.property?.project?.name ?? 'No Project';
                const oid = r.property?.project?.owner?.id ?? 'unassigned';
                const oname = r.property?.project?.owner?.name ?? 'No Owner';

                if (!byProject[pid]) byProject[pid] = { name: pname, ownerName: oname, monthlyIncome: 0, count: 0 };
                byProject[pid].monthlyIncome += r.monthlyRent;
                byProject[pid].count++;

                if (!byOwner[oid]) byOwner[oid] = { name: oname, monthlyIncome: 0, count: 0 };
                byOwner[oid].monthlyIncome += r.monthlyRent;
                byOwner[oid].count++;
            });

            return NextResponse.json({
                data: {
                    totalMonthlyIncome,
                    activeContracts: rentals.length,
                    byBuilding: Object.entries(byProject).map(([id, v]) => ({ id, ...v })), // kept as byBuilding for UI compat
                    byOwner: Object.entries(byOwner).map(([id, v]) => ({ id, ...v })),
                }
            });
        }

        // ─── UNITS REPORT ────────────────────────────────────────────────────────
        if (type === 'units') {
            const fromDateObj = fromDate ? new Date(fromDate) : undefined;
            const toDateObj = toDate ? new Date(toDate) : undefined;

            const properties = await prisma.property.findMany({
                where: {
                    ...(projectId && { projectId }),
                },
                include: {
                    project: { select: { id: true, name: true } },
                    owner: { select: { id: true, name: true } },
                    rentals: {
                        where: { status: 'active' },
                        include: { customer: { select: { id: true, name: true, phone: true } } },
                        take: 1,
                    }
                },
                orderBy: [{ unitNumber: 'asc' }, { title: 'asc' }],
            });

            const units = properties.map(p => {
                const activeRental = p.rentals[0] ?? null;
                let computedStatus = 'vacant';
                if (activeRental) computedStatus = 'rented';
                else if (p.maintenance && p.maintenance !== '0') computedStatus = 'maintenance';

                return {
                    id: p.id,
                    projectName: p.project?.name ?? '-',
                    projectId: p.project?.id ?? null,
                    ownerName: p.owner?.name ?? '-',
                    unitNumber: p.unitNumber || p.title,
                    floor: p.floor ?? '-',
                    area: p.area ?? '-',
                    rentValue: activeRental?.monthlyRent ?? p.price,
                    status: computedStatus,
                    tenantName: activeRental?.customer?.name ?? '-',
                    tenantPhone: activeRental?.customer?.phone ?? '-',
                    contractStart: activeRental?.startDate ?? null,
                    contractEnd: activeRental?.endDate ?? null,
                };
            }).filter(u => {
                const matchStatus = !status || status === 'all' || u.status === status;
                let matchDate = true;
                if (fromDateObj && u.contractStart) matchDate = new Date(u.contractStart) >= fromDateObj;
                if (toDateObj && u.contractEnd) matchDate = matchDate && new Date(u.contractEnd) <= toDateObj;
                return matchStatus && matchDate;
            });

            return NextResponse.json({ data: { units } });
        }

        // ─── EXPIRING REPORT ─────────────────────────────────────────────────────
        if (type === 'expiring') {
            const days = parseInt(daysFilter || '30');
            const today = new Date();
            const cutoff = new Date();
            cutoff.setDate(today.getDate() + days);

            const rentals = await prisma.rental.findMany({
                where: {
                    status: 'active',
                    endDate: { lte: cutoff },
                    ...(projectId && { property: { projectId } }),
                },
                include: {
                    customer: { select: { id: true, name: true, phone: true } },
                    property: {
                        select: {
                            id: true,
                            title: true,
                            unitNumber: true,
                            project: { select: { id: true, name: true } }
                        }
                    }
                },
                orderBy: { endDate: 'asc' }
            });

            const contracts = rentals.map(r => {
                const daysRemaining = Math.ceil((new Date(r.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return {
                    id: r.id,
                    tenantName: r.customer?.name ?? '-',
                    tenantPhone: r.customer?.phone ?? '-',
                    projectName: r.property?.project?.name ?? '-',
                    unitNumber: r.property?.unitNumber ?? r.property?.title ?? '-',
                    contractEnd: r.endDate,
                    daysRemaining,
                    monthlyRent: r.monthlyRent,
                };
            });

            return NextResponse.json({ data: { contracts, days } });
        }

        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
