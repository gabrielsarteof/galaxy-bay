/*
  Warnings:

  - You are about to drop the column `subscriberCount` on the `Page` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `Page` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Page" DROP COLUMN "subscriberCount",
ADD COLUMN     "salesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Page_ownerId_key" ON "Page"("ownerId");
