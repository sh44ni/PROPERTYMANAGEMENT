import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma'; // Uncomment when Prisma is set up
import type { Project, CreateProjectInput } from '@/types';

// GET /api/projects - Get all projects
export async function GET() {
    try {
        // TODO: Replace with Prisma query when database is connected
        // const projects = await prisma.project.findMany({
        //     orderBy: { createdAt: 'desc' },
        //     include: { updates: true }
        // });

        // Return empty array for now - will be populated from database
        const projects: Project[] = [];

        return NextResponse.json({ data: projects });
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
        const body: CreateProjectInput = await request.json();

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            );
        }

        // TODO: Replace with Prisma create when database is connected
        // const project = await prisma.project.create({
        //     data: {
        //         name: body.name,
        //         description: body.description,
        //         location: body.location,
        //         image: body.image,
        //         budget: body.budget || 0,
        //         totalUnits: body.totalUnits || 0,
        //         startDate: body.startDate ? new Date(body.startDate) : null,
        //         endDate: body.endDate ? new Date(body.endDate) : null,
        //     }
        // });

        // Placeholder response
        const project: Project = {
            id: `proj_${Date.now()}`,
            name: body.name,
            description: body.description || null,
            location: body.location || null,
            image: body.image || null,
            budget: body.budget || 0,
            spent: 0,
            totalUnits: body.totalUnits || 0,
            soldUnits: 0,
            status: 'planning',
            progress: 0,
            startDate: body.startDate || null,
            endDate: body.endDate || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ data: project }, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
