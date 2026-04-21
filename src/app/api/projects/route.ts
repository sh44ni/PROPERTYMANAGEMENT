import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedJson, errorJson } from '@/lib/api-cache';

// GET /api/projects - Get all projects with property stats
export async function GET() {
    try {
        // Fetch projects and per-project status counts in one round-trip each,
        // instead of fetching every property row then counting them in JS.
        const [projects, propertyStatusRows] = await Promise.all([
            prisma.project.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    updates: {
                        orderBy: { updatedAt: 'desc' },
                        take: 5,
                        select: {
                            id: true,
                            details: true,
                            progress: true,
                            updatedAt: true,
                        },
                    },
                    _count: { select: { properties: true } },
                },
            }),
            prisma.property.groupBy({
                by: ['projectId', 'status'],
                where: { projectId: { not: null } },
                _count: { _all: true },
            }),
        ]);

        // Aggregate the groupBy rows into a { projectId -> { rented, sold } } map.
        const statsByProject = new Map<string, { rented: number; sold: number }>();
        for (const row of propertyStatusRows) {
            if (!row.projectId) continue;
            const entry = statsByProject.get(row.projectId) ?? { rented: 0, sold: 0 };
            if (row.status === 'rented') entry.rented += row._count._all;
            else if (row.status === 'sold') entry.sold += row._count._all;
            statsByProject.set(row.projectId, entry);
        }

        const projectsWithStats = projects.map((project) => {
            const totalLinked = project._count.properties;
            const capacity = project.totalUnits || 0;
            const entry = statsByProject.get(project.id) ?? { rented: 0, sold: 0 };
            const unallocated = Math.max(0, capacity - totalLinked);

            return {
                ...project,
                totalUnits: capacity,
                propertiesCount: totalLinked,
                occupiedUnits: entry.rented,
                soldUnits: entry.sold,
                availableUnits: unallocated,
            };
        });

        return cachedJson({ data: projectsWithStats }, { cdn: 30, swr: 120 });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return errorJson('Failed to fetch projects');
    }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                name: body.name,
                description: body.description || null,
                location: body.location || null,
                address: body.address || null,
                city: body.city || null,
                image: body.image || null,
                budget: body.budget ? parseFloat(body.budget) : 0,
                totalUnits: body.totalUnits ? parseInt(body.totalUnits) : 0,
                status: body.status || 'planning',
                progress: body.progress || 0,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                ownerId: body.ownerId || null,
                propertyNumber: body.propertyNumber || null,
                buildingName: body.buildingName || null,
                propertyType: body.propertyType || null,
                mobileNumber: body.mobileNumber || null,
                districtName: body.districtName || null,
                floors: body.floors ? parseInt(body.floors) : null,
                facadeLength: body.facadeLength ? parseFloat(body.facadeLength) : null,
                transactionType: body.transactionType || null,
                propertyArea: body.propertyArea ? parseFloat(body.propertyArea) : null,
            }
        });

        return NextResponse.json({ data: project }, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}

// PUT /api/projects - Update a project
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {};

        if (body.name) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.location !== undefined) updateData.location = body.location;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.city !== undefined) updateData.city = body.city;
        if (body.ownerId !== undefined) updateData.ownerId = body.ownerId || null;
        if (body.image !== undefined) updateData.image = body.image;
        if (body.budget !== undefined) updateData.budget = parseFloat(body.budget);
        if (body.spent !== undefined) updateData.spent = parseFloat(body.spent);
        if (body.totalUnits !== undefined) updateData.totalUnits = parseInt(body.totalUnits);
        if (body.status !== undefined) updateData.status = body.status;
        if (body.progress !== undefined) updateData.progress = parseInt(body.progress);
        if (body.startDate) updateData.startDate = new Date(body.startDate);
        if (body.endDate) updateData.endDate = new Date(body.endDate);
        if (body.propertyNumber !== undefined) updateData.propertyNumber = body.propertyNumber;
        if (body.buildingName !== undefined) updateData.buildingName = body.buildingName;
        if (body.propertyType !== undefined) updateData.propertyType = body.propertyType;
        if (body.mobileNumber !== undefined) updateData.mobileNumber = body.mobileNumber;
        if (body.districtName !== undefined) updateData.districtName = body.districtName;
        if (body.floors !== undefined) updateData.floors = body.floors ? parseInt(body.floors) : null;
        if (body.facadeLength !== undefined) updateData.facadeLength = body.facadeLength ? parseFloat(body.facadeLength) : null;
        if (body.transactionType !== undefined) updateData.transactionType = body.transactionType;
        if (body.propertyArea !== undefined) updateData.propertyArea = body.propertyArea ? parseFloat(body.propertyArea) : null;

        // Auto-set completed status if progress reaches 100
        if (body.progress !== undefined && parseInt(body.progress) >= 100) {
            updateData.status = 'completed';
        }

        const project = await prisma.project.update({
            where: { id: body.id },
            data: updateData
        });

        // If progress update is provided, create a project update log
        if (body.progress !== undefined && body.updateDetails) {
            await prisma.projectUpdate.create({
                data: {
                    projectId: body.id,
                    details: body.updateDetails,
                    progress: parseInt(body.progress),
                }
            });
        }

        return NextResponse.json({ data: project });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects - Delete a project
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        // Check if project has properties
        const propertyCount = await prisma.property.count({
            where: { projectId: id }
        });

        if (propertyCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete project with existing properties' },
                { status: 400 }
            );
        }

        await prisma.project.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
