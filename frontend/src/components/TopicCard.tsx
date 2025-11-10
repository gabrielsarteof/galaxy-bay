interface TopicCardProps {
  label: string;
  bgColor: string;
  onClick: () => void;
}

export default function TopicCard({ label, bgColor, onClick }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative ${bgColor} flex items-center justify-center rounded-xl text-white font-bold text-lg h-32 w-56 flex-shrink-0 mr-4 transition-all hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <span className="relative z-10 drop-shadow-md">{label}</span>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}