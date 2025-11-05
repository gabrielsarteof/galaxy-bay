export default function TrendingCard({ title, subtitle, imageSrc }: { title: string; subtitle: string; imageSrc: string }) {
  return (
    <div className="w-48 flex-shrink-0 mr-4 transition-theme">
      <img src={imageSrc} alt={title} className="w-full h-32 object-cover rounded-md" />
      <h3 className="mt-2 font-semibold text-primary">{title}</h3>
      <p className="text-sm text-secondary">{subtitle}</p>
    </div>
  );
}