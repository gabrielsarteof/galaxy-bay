/*
  Warnings:

  - You are about to drop the column `bannerUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "subscriberCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bannerUrl",
DROP COLUMN "bio",
DROP COLUMN "displayName",
DROP COLUMN "location";
