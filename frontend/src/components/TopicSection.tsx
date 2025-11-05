import TopicCard from './TopicCard';

const topics = [
  { label: 'Podcasts e shows', bgColor: 'bg-red-600' },
  { label: 'Jogos de mesa', bgColor: 'bg-blue-600' },
  { label: 'Música', bgColor: 'bg-orange-500' },
  { label: 'Escrita', bgColor: 'bg-pink-600' },
  { label: 'Aplicativos e software', bgColor: 'bg-indigo-600' },
];

export default function TopicSection() {
  return (
    <section className="px-6 py-8 transition-all">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Explorar tópicos</h2>
      <div className="flex overflow-x-auto">
        {topics.map(t => (
          <TopicCard key={t.label} {...t} />
        ))}
      </div>
    </section>
  );
}