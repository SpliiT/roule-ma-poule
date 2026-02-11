-- AlterTable
ALTER TABLE "Intervention" ADD COLUMN     "trackingEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentLat" DOUBLE PRECISION,
ADD COLUMN     "currentLng" DOUBLE PRECISION,
ADD COLUMN     "lastLocUpdate" TIMESTAMP(3);
