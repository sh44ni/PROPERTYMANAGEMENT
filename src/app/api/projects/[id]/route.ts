import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id] - Get single project with all linked properties (units) + occupancy stats
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, phone: true } },
                // properties = units linked to this project via projectId
                properties: {
                    orderBy: [{ unitNumber: 'asc' }, { title: 'asc' }],
                    select: {
                        id: true,
                        title: true,
                        unitNumber: true,
                        floor: true,
                        area: true,
                        price: true,
                        status: true,
                        maintenance: true,
                        type: true,
                        rentals: {
                            where: { status: 'active' },
                            select: {
                                id: true,
                                monthlyRent: true,
                                startDate: true,
                                endDate: true,
                                customer: { select: { id: true, name: true, phone: true } }
                            },
                            take: 1,
                        }
                    }
                },
                updates: { orderBy: { updatedAt: 'desc' }, take: 10 }
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Compute unit statuses automatically based on active rentals / maintenance flag
        const unitsWithStatus = project.properties.map(unit => {
            const activeRental = unit.rentals[0] || null;
            let computedStatus: string;
            if (activeRental) {
                computedStatus = 'rented';
            } else if (unit.maintenance && unit.maintenance !== '0' && unit.maintenance !== '') {
                computedStatus = 'maintenance';
            } else {
                computedStatus = 'vacant';
            }
            return { ...unit, computedStatus, activeRental };
        });

        const total = unitsWithStatus.length;
        const rentedCount = unitsWithStatus.filter(u => u.computedStatus === 'rented').length;
        const maintenanceCount = unitsWithStatus.filter(u => u.computedStatus === 'maintenance').length;
        const vacantCount = total - rentedCount - maintenanceCount;
        const occupancy = total > 0 ? Math.round((rentedCount / total) * 100) : 0;

        return NextResponse.json({
            data: {
                ...project,
                properties: unitsWithStatus,
                stats: { total, rentedCount, vacantCount, maintenanceCount, occupancy }
            }
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }
}
