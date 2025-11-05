export default function Loading() {
  return (
    <div className="p-8 space-y-4">
      {/* cabeçalho */}
      <div className="h-6 rounded skeleton" />
      {/* subtítulo */}
      <div className="h-4 w-1/2 rounded skeleton" />
      {/* grid de cartões */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 rounded skeleton" />
        ))}
      </div>
    </div>
  );
}
