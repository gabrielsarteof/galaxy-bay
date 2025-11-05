interface SkeletonCircleProps {
  size?: number;
  className?: string;
}

export default function SkeletonCircle({
  size = 40,
  className = ''
}: SkeletonCircleProps) {
  return (
    <div
      className={`rounded-full bg-gray-200 animate-pulse ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
