import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects - Get all projects with property stats
export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                properties: {
                    select: {
                        id: true,
                        status: true,
                    }
                },
                updates: {
                    orderBy: { updatedAt: 'desc' },
                    take: 5
                }
            }
        });

        // Calculate property stats for each project
        const projectsWithStats = projects.map(project => {
            const availableUnits = project.properties.filter(p => p.status === 'available').length;
            const rentedUnits = project.properties.filter(p => p.status === 'rented').length;
            const soldUnits = project.properties.filter(p => p.status === 'sold').length;

            return {
                ...project,
                totalUnits: project.properties.length,
                availableUnits,
                occupiedUnits: rentedUnits,
                soldUnits,
            };
        });

        return NextResponse.json({ data: projectsWithStats });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
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
                image: body.image || null,
                budget: body.budget ? parseFloat(body.budget) : 0,
                totalUnits: body.totalUnits ? parseInt(body.totalUnits) : 0,
                status: body.status || 'planning',
                progress: body.progress || 0,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
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
        if (body.image !== undefined) updateData.image = body.image;
        if (body.budget !== undefined) updateData.budget = parseFloat(body.budget);
        if (body.spent !== undefined) updateData.spent = parseFloat(body.spent);
        if (body.status !== undefined) updateData.status = body.status;
        if (body.progress !== undefined) updateData.progress = parseInt(body.progress);
        if (body.startDate) updateData.startDate = new Date(body.startDate);
        if (body.endDate) updateData.endDate = new Date(body.endDate);

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
