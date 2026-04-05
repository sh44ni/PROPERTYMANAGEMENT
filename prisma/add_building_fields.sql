-- Migration: Add Building Name, Apartment Number, Floor Number, and Agreement Period Unit to RentalContract
-- Run this on the VPS PostgreSQL database

ALTER TABLE "RentalContract" ADD COLUMN IF NOT EXISTS "propertyBuildingName" TEXT;
ALTER TABLE "RentalContract" ADD COLUMN IF NOT EXISTS "propertyApartmentNumber" TEXT;
ALTER TABLE "RentalContract" ADD COLUMN IF NOT EXISTS "propertyFloorNumber" TEXT;
ALTER TABLE "RentalContract" ADD COLUMN IF NOT EXISTS "agreementPeriodUnit" TEXT DEFAULT 'months';
