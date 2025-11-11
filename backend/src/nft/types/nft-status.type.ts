/**
 * Temporary type definition for NftStatus enum
 *
 * This should match the NftStatus enum in prisma/schema.prisma
 * Remove this file once Prisma Client is properly generated with `npx prisma generate`
 */
export type NftStatus = 'minted' | 'listed' | 'sold' | 'transferred';

export const NftStatus = {
  minted: 'minted' as NftStatus,
  listed: 'listed' as NftStatus,
  sold: 'sold' as NftStatus,
  transferred: 'transferred' as NftStatus,
};
