import Link from 'next/link';
import { useState } from 'react';

interface TrendingCardProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  slug: string;
}

export default function TrendingCard({ title, subtitle, imageSrc, slug }: TrendingCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/${slug}`}
      className="group w-48 flex-shrink-0 mr-4 transition-all"
    >
      <div className="relative overflow-hidden rounded-xl shadow-md group-hover:shadow-xl transition-shadow">
        {imageError ? (
          <div className="w-full h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <span className="text-white text-5xl font-bold drop-shadow-lg">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-3">
        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 truncate">{subtitle}</p>
      </div>
    </Link>
  );
}