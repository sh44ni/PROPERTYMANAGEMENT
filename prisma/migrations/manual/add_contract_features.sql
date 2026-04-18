-- Migration: add_contract_features
-- Run this SQL on the PostgreSQL database to apply schema changes.
-- Command: psql -U telal -d telal_db -f add_contract_features.sql

-- Add notes, paymentTiming, paymentMonths to RentalContract
ALTER TABLE "RentalContract"
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentTiming" TEXT DEFAULT 'advance',
  ADD COLUMN IF NOT EXISTS "paymentMonths" INTEGER;

-- Create SaleContractDocument table
CREATE TABLE IF NOT EXISTS "SaleContractDocument" (
  "id"             TEXT NOT NULL,
  "saleContractId" TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "originalName"   TEXT NOT NULL,
  "storedFileName" TEXT NOT NULL,
  "storagePath"    TEXT NOT NULL,
  "mimeType"       TEXT NOT NULL,
  "fileSize"       INTEGER NOT NULL,
  "uploadedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SaleContractDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SaleContractDocument_saleContractId_fkey"
    FOREIGN KEY ("saleContractId") REFERENCES "SaleContract"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SaleContractDocument_saleContractId_idx"
  ON "SaleContractDocument"("saleContractId");

-- Create SaleContractInstallment table
CREATE TABLE IF NOT EXISTS "SaleContractInstallment" (
  "id"             TEXT NOT NULL,
  "saleContractId" TEXT NOT NULL,
  "label"          TEXT,
  "amount"         DOUBLE PRECISION NOT NULL,
  "amountWords"    TEXT,
  "dueDate"        TIMESTAMP(3),
  "order"          INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "SaleContractInstallment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SaleContractInstallment_saleContractId_fkey"
    FOREIGN KEY ("saleContractId") REFERENCES "SaleContract"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SaleContractInstallment_saleContractId_idx"
  ON "SaleContractInstallment"("saleContractId");
