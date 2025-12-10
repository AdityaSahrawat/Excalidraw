/*
  Warnings:

  - The primary key for the `JoinedRooms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userid` on the `JoinedRooms` table. All the data in the column will be lost.
  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,roomId]` on the table `JoinedRooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `JoinedRooms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Element" DROP CONSTRAINT "Element_roomId_fkey";

-- DropForeignKey
ALTER TABLE "JoinedRooms" DROP CONSTRAINT "JoinedRooms_roomId_fkey";

-- DropForeignKey
ALTER TABLE "JoinedRooms" DROP CONSTRAINT "JoinedRooms_userid_fkey";

-- DropIndex
DROP INDEX "JoinedRooms_userid_roomId_key";

-- AlterTable
ALTER TABLE "Element" ALTER COLUMN "roomId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "JoinedRooms" DROP CONSTRAINT "JoinedRooms_pkey",
DROP COLUMN "userid",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roomId" SET DATA TYPE TEXT,
ADD CONSTRAINT "JoinedRooms_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "JoinedRooms_id_seq";

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Room_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "JoinedRooms_userId_roomId_key" ON "JoinedRooms"("userId", "roomId");

-- AddForeignKey
ALTER TABLE "JoinedRooms" ADD CONSTRAINT "JoinedRooms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinedRooms" ADD CONSTRAINT "JoinedRooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
