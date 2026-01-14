import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma'; // Uncomment when Prisma is set up
import type { UpdateProjectInput } from '@/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Get a single project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // TODO: Replace with Prisma query when database is connected
        // const project = await prisma.project.findUnique({
        //     where: { id },
        //     include: { updates: true, properties: true }
        // });
        // if (!project) {
        //     return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        // }

        return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
        );
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body: UpdateProjectInput = await request.json();

        // TODO: Replace with Prisma update when database is connected
        // const project = await prisma.project.update({
        //     where: { id },
        //     data: {
        //         name: body.name,
        //         description: body.description,
        //         location: body.location,
        //         image: body.image,
        //         budget: body.budget,
        //         spent: body.spent,
        //         totalUnits: body.totalUnits,
        //         soldUnits: body.soldUnits,
        //         status: body.status,
        //         progress: body.progress,
        //         startDate: body.startDate ? new Date(body.startDate) : undefined,
        //         endDate: body.endDate ? new Date(body.endDate) : undefined,
        //     }
        // });

        console.log('Update project:', id, body);
        return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
        );
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // TODO: Replace with Prisma delete when database is connected
        // await prisma.project.delete({ where: { id } });

        console.log('Delete project:', id);
        return NextResponse.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
