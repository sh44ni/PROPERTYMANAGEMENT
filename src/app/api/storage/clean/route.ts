import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

// DELETE /api/storage/clean - Clean all user data
export async function DELETE(request: NextRequest) {
    try {
        // Verify the confirmation phrase
        const { confirmPhrase } = await request.json();

        if (confirmPhrase !== 'DELETE ALL DATA') {
            return NextResponse.json(
                { error: 'Invalid confirmation phrase' },
                { status: 400 }
            );
        }

        // Delete all user data in the correct order (respecting foreign key constraints)
        // Order matters: delete children before parents

        // 1. Delete transactions
        const deletedTransactions = await prisma.transaction.deleteMany();

        // 2. Delete documents and their files
        const documents = await prisma.document.findMany({
            select: { fileUrl: true, filePath: true }
        });
        await prisma.document.deleteMany();

        // 3. Delete rental contracts
        await prisma.rentalContract.deleteMany();

        // 4. Delete sale contracts
        await prisma.saleContract.deleteMany();

        // 5. Delete rentals
        const deletedRentals = await prisma.rental.deleteMany();

        // 6. Delete properties
        const deletedProperties = await prisma.property.deleteMany();

        // 7. Delete projects
        const deletedProjects = await prisma.project.deleteMany();

        // 8. Delete customers
        const deletedCustomers = await prisma.customer.deleteMany();

        // 9. Delete areas and cities (optional - you might want to keep these)
        const deletedAreas = await prisma.area.deleteMany();
        const deletedCities = await prisma.city.deleteMany();

        // Clean uploaded files
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        let filesDeleted = 0;

        try {
            filesDeleted = await cleanDirectory(uploadsDir);
        } catch (e) {
            console.log('No uploads directory to clean');
        }

        return NextResponse.json({
            success: true,
            message: 'All user data has been deleted',
            deleted: {
                transactions: deletedTransactions.count,
                documents: documents.length,
                rentals: deletedRentals.count,
                properties: deletedProperties.count,
                projects: deletedProjects.count,
                customers: deletedCustomers.count,
                areas: deletedAreas.count,
                cities: deletedCities.count,
                files: filesDeleted,
            },
        });
    } catch (error) {
        console.error('Error cleaning data:', error);
        return NextResponse.json({ error: 'Failed to clean data' }, { status: 500 });
    }
}

// Helper function to clean a directory (delete all files but keep structure)
async function cleanDirectory(dirPath: string): Promise<number> {
    let count = 0;

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                count += await cleanDirectory(fullPath);
            } else {
                await fs.unlink(fullPath);
                count++;
            }
        }
    } catch (e) {
        // Directory doesn't exist or can't be read
    }

    return count;
}
