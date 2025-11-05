import { useState } from 'react';

const categories = [
  'Tudo',
  'Cultura pop',
  'Comédia',
  'Jogos de RPG',
  'Crimes reais',
  'Tutoriais de arte',
  'Artesanato',
  'Ilustrador',
  'Educação musical',
];

export default function CategoryTabs() {
  const [active, setActive] = useState(categories[0]);
  return (
    <div className="flex space-x-2 px-6 py-4 overflow-x-auto bg-gray-50 transition-all">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={
            `whitespace-nowrap px-4 py-2 rounded-full font-medium transition ` +
            (active === cat
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
          }
        >
          {cat}
        </button>
      ))}
    </div>
  );
}