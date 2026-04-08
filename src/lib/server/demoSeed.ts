import { prisma } from '@/lib/prisma';

export async function seedDemoDataIfEmpty() {
  const projectCount = await prisma.project.count();
  const ownerCount = await prisma.owner.count();
  const customerCount = await prisma.customer.count();

  // If there's already data, don't seed.
  if (projectCount > 0 || ownerCount > 0 || customerCount > 0) return { seeded: false };

  const owner = await prisma.owner.create({
    data: {
      name: 'Demo Owner',
      phone: '99999999',
      email: 'demo-owner@example.com',
      nationality: 'OM',
      notes: 'Demo data',
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'Explore the system safely in demo mode.',
      budget: 250000,
      totalUnits: 12,
      status: 'planning',
      progress: 35,
      ownerId: owner.id,
    },
  });

  await prisma.projectUpdate.create({
    data: {
      projectId: project.id,
      details: 'Demo progress update',
      progress: 35,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      name: 'Demo Customer',
      phone: '98888888',
      email: 'demo-customer@example.com',
      nationality: 'OM',
      notes: 'Demo data',
    },
  });

  await prisma.property.create({
    data: {
      title: 'Demo Unit A-101',
      type: 'apartment',
      status: 'available',
      price: 450,
      images: [],
      projectId: project.id,
      ownerId: owner.id,
      description: 'Demo unit',
    },
  });

  // Minimal footprint; more can be added later
  return { seeded: true, ownerId: owner.id, projectId: project.id, customerId: customer.id };
}

export async function wipeDemoData() {
  // Order matters due to foreign keys.
  await prisma.projectDocument.deleteMany();
  await prisma.document.deleteMany();
  await prisma.projectUpdate.deleteMany();

  await prisma.rental.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.rentalContract.deleteMany();
  await prisma.saleContract.deleteMany();

  await prisma.property.deleteMany();
  await prisma.project.deleteMany();

  await prisma.customer.deleteMany();
  await prisma.owner.deleteMany();
}

