/*
  Warnings:

  - Changed the type of `expireAt` on the `VerificationEmail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "VerificationEmail" DROP COLUMN "expireAt",
ADD COLUMN     "expireAt" TIMESTAMP(3) NOT NULL;
