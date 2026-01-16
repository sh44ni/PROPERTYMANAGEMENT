import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/storage/stats - Get storage statistics
export async function GET(request: NextRequest) {
    try {
        // Count records in each table
        const [
            documentsCount,
            transactionsCount,
            customersCount,
            propertiesCount,
            projectsCount,
            rentalsCount,
            rentalContractsCount,
            saleContractsCount,
            areasCount,
            citiesCount,
        ] = await Promise.all([
            prisma.document.count(),
            prisma.transaction.count(),
            prisma.customer.count(),
            prisma.property.count(),
            prisma.project.count(),
            prisma.rental.count(),
            prisma.rentalContract.count(),
            prisma.saleContract.count(),
            prisma.area.count(),
            prisma.city.count(),
        ]);

        // Calculate file storage in uploads folder
        let uploadedFilesSize = 0;
        let uploadedFilesCount = 0;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        try {
            uploadedFilesSize = await getDirectorySize(uploadsDir);
            uploadedFilesCount = await countFiles(uploadsDir);
        } catch (e) {
            // Uploads directory may not exist
            console.log('Uploads directory not found or empty');
        }

        // Convert bytes to GB for display
        const uploadedFilesGB = uploadedFilesSize / (1024 * 1024 * 1024);

        // Estimate database size (rough estimation: ~1KB per record average)
        const totalRecords = documentsCount + transactionsCount + customersCount +
            propertiesCount + projectsCount + rentalsCount +
            rentalContractsCount + saleContractsCount + areasCount + citiesCount;
        const estimatedDbSizeBytes = totalRecords * 1024; // ~1KB per record
        const estimatedDbSizeGB = estimatedDbSizeBytes / (1024 * 1024 * 1024);

        // Total user data
        const userDataGB = uploadedFilesGB + estimatedDbSizeGB;

        return NextResponse.json({
            data: {
                // Storage summary (in GB)
                storage: {
                    total: 50, // Total allocated storage (configurable)
                    system: 12, // Fixed system storage
                    userData: parseFloat(userDataGB.toFixed(3)),
                    files: parseFloat(uploadedFilesGB.toFixed(3)),
                    database: parseFloat(estimatedDbSizeGB.toFixed(6)),
                },
                // Record counts for breakdown
                counts: {
                    documents: documentsCount,
                    transactions: transactionsCount,
                    customers: customersCount,
                    properties: propertiesCount,
                    projects: projectsCount,
                    rentals: rentalsCount,
                    rentalContracts: rentalContractsCount,
                    saleContracts: saleContractsCount,
                    areas: areasCount,
                    cities: citiesCount,
                    uploadedFiles: uploadedFilesCount,
                    totalRecords,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching storage stats:', error);
        return NextResponse.json({ error: 'Failed to fetch storage stats' }, { status: 500 });
    }
}

// Helper function to get directory size recursively
async function getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                totalSize += await getDirectorySize(fullPath);
            } else {
                const stats = await fs.stat(fullPath);
                totalSize += stats.size;
            }
        }
    } catch (e) {
        // Directory doesn't exist or can't be read
    }

    return totalSize;
}

// Helper function to count files recursively
async function countFiles(dirPath: string): Promise<number> {
    let count = 0;

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                count += await countFiles(fullPath);
            } else {
                count++;
            }
        }
    } catch (e) {
        // Directory doesn't exist or can't be read
    }

    return count;
}
