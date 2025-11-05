import dynamic from 'next/dynamic';

export const DynamicMintForm = dynamic(
  () => import('@/components/NFT/MintForm').then(mod => ({ default: mod.MintForm })),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export const DynamicListingForm = dynamic(
  () => import('@/components/NFT/ListingForm').then(mod => ({ default: mod.ListingForm })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
      </div>
    ),
    ssr: false,
  }
);

export const DynamicOffersPanel = dynamic(
  () => import('@/components/Marketplace/OffersPanel'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export const DynamicTransactionHistory = dynamic(
  () => import('@/components/Analytics/TransactionHistory'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);

export const DynamicPageAnalytics = dynamic(
  () => import('@/components/Analytics/PageAnalytics'),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    ),
    ssr: true,
  }
);
