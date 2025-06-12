/*
  Warnings:

  - A unique constraint covering the columns `[shapeId]` on the table `Element` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Element_shapeId_key" ON "Element"("shapeId");
