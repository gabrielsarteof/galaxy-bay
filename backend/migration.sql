-- DropForeignKey
ALTER TABLE "Nft" DROP CONSTRAINT "Nft_pageId_fkey";

-- DropForeignKey
ALTER TABLE "Nft" DROP CONSTRAINT "Nft_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_pageId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_nftId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_pageId_fkey";

-- DropIndex
DROP INDEX "Page_slug_idx";

-- DropIndex
DROP INDEX "Page_status_idx";

-- DropIndex
DROP INDEX "Page_category_idx";

-- DropIndex
DROP INDEX "Nft_pageId_idx";

-- DropIndex
DROP INDEX "Nft_collectionId_idx";

-- DropIndex
DROP INDEX "Nft_ownerId_idx";

-- DropIndex
DROP INDEX "Nft_status_idx";

-- DropIndex
DROP INDEX "Nft_pageId_tokenId_key";

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "benefitsText",
DROP COLUMN "discordUrl",
DROP COLUMN "featuredNftIds",
DROP COLUMN "hasFirstPost",
DROP COLUMN "instagramUrl",
DROP COLUMN "twitterUrl",
DROP COLUMN "websiteUrl",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "Nft" DROP COLUMN "collectionId",
DROP COLUMN "imageUrl",
DROP COLUMN "status",
DROP COLUMN "tokenId",
ADD COLUMN     "isListed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "pageId" DROP NOT NULL;

-- DropTable
DROP TABLE "Collection";

-- DropTable
DROP TABLE "Activity";

-- DropEnum
DROP TYPE "PageStatus";

-- DropEnum
DROP TYPE "NftStatus";

-- DropEnum
DROP TYPE "ActivityType";

-- AddForeignKey
ALTER TABLE "Nft" ADD CONSTRAINT "Nft_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

