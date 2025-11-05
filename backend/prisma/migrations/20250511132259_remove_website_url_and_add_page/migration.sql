/*
  Warnings:

  - You are about to drop the column `websiteUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Nft" ADD COLUMN     "pageId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "websiteUrl";

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_name_key" ON "Page"("name");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nft" ADD CONSTRAINT "Nft_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;
