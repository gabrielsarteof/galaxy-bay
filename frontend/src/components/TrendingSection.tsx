import TrendingCard from './TrendingCard';

const trendingData = [
  { title: 'Game Mess', subtitle: 'Podcasts e gaming content', imageSrc: '/placeholder1.jpg' },
  { title: 'Chico Felitti', subtitle: 'Podcasts', imageSrc: '/placeholder2.jpg' },
  { title: 'cFemen', subtitle: 'Game Content Creator', imageSrc: '/placeholder3.jpg' },
  { title: 'matt bernstein', subtitle: 'Political commentary', imageSrc: '/placeholder4.jpg' },
  { title: 'Amorian Skies', subtitle: 'Development Team on Roblox', imageSrc: '/placeholder5.jpg' },
];

export default function TrendingSection() {
  return (
    <section className="px-6 py-8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Em alta esta semana</h2>
        <a href="#" className="text-sm text-blue-600 hover:underline">Ver mais</a>
      </div>
      <div className="flex overflow-x-auto">
        {trendingData.map(item => (
          <TrendingCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
