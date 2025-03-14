/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");
