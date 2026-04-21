-- Performance indexes for hot-path queries.
-- Safe to run multiple times (IF NOT EXISTS).
-- Run with:
--   psql "$DATABASE_URL" -f prisma/migrations/manual/add_performance_indexes.sql
-- Or via prisma:
--   npx prisma db execute --file prisma/migrations/manual/add_performance_indexes.sql --schema prisma/schema.prisma

-- Property
CREATE INDEX IF NOT EXISTS "Property_status_idx"    ON "Property" ("status");
CREATE INDEX IF NOT EXISTS "Property_projectId_idx" ON "Property" ("projectId");
CREATE INDEX IF NOT EXISTS "Property_ownerId_idx"   ON "Property" ("ownerId");
CREATE INDEX IF NOT EXISTS "Property_createdAt_idx" ON "Property" ("createdAt");
CREATE INDEX IF NOT EXISTS "Property_type_idx"      ON "Property" ("type");

-- Rental
CREATE INDEX IF NOT EXISTS "Rental_status_idx"                 ON "Rental" ("status");
CREATE INDEX IF NOT EXISTS "Rental_paymentStatus_idx"          ON "Rental" ("paymentStatus");
CREATE INDEX IF NOT EXISTS "Rental_propertyId_idx"             ON "Rental" ("propertyId");
CREATE INDEX IF NOT EXISTS "Rental_customerId_idx"             ON "Rental" ("customerId");
CREATE INDEX IF NOT EXISTS "Rental_paidUntil_idx"              ON "Rental" ("paidUntil");
CREATE INDEX IF NOT EXISTS "Rental_createdAt_idx"              ON "Rental" ("createdAt");
CREATE INDEX IF NOT EXISTS "Rental_status_paymentStatus_idx"   ON "Rental" ("status", "paymentStatus");

-- Transaction
CREATE INDEX IF NOT EXISTS "Transaction_date_idx"         ON "Transaction" ("date");
CREATE INDEX IF NOT EXISTS "Transaction_category_idx"     ON "Transaction" ("category");
CREATE INDEX IF NOT EXISTS "Transaction_type_idx"         ON "Transaction" ("type");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx"       ON "Transaction" ("status");
CREATE INDEX IF NOT EXISTS "Transaction_customerId_idx"   ON "Transaction" ("customerId");
CREATE INDEX IF NOT EXISTS "Transaction_propertyId_idx"   ON "Transaction" ("propertyId");
CREATE INDEX IF NOT EXISTS "Transaction_rentalId_idx"     ON "Transaction" ("rentalId");
CREATE INDEX IF NOT EXISTS "Transaction_ownerId_idx"      ON "Transaction" ("ownerId");
CREATE INDEX IF NOT EXISTS "Transaction_category_status_date_idx" ON "Transaction" ("category", "status", "date");
CREATE INDEX IF NOT EXISTS "Transaction_type_status_idx"  ON "Transaction" ("type", "status");

-- Customer
CREATE INDEX IF NOT EXISTS "Customer_name_idx"      ON "Customer" ("name");
CREATE INDEX IF NOT EXISTS "Customer_phone_idx"     ON "Customer" ("phone");
CREATE INDEX IF NOT EXISTS "Customer_createdAt_idx" ON "Customer" ("createdAt");

-- Owner
CREATE INDEX IF NOT EXISTS "Owner_name_idx"      ON "Owner" ("name");
CREATE INDEX IF NOT EXISTS "Owner_phone_idx"     ON "Owner" ("phone");
CREATE INDEX IF NOT EXISTS "Owner_createdAt_idx" ON "Owner" ("createdAt");

-- Project
CREATE INDEX IF NOT EXISTS "Project_status_idx"    ON "Project" ("status");
CREATE INDEX IF NOT EXISTS "Project_ownerId_idx"   ON "Project" ("ownerId");
CREATE INDEX IF NOT EXISTS "Project_createdAt_idx" ON "Project" ("createdAt");
