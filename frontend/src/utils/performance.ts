export function measurePerformance(name: string, fn: () => void) {
  if (typeof window === 'undefined') return fn();

  const start = performance.now();
  const result = fn();
  const end = performance.now();

  if (end - start > 16) {
    console.warn(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
  }

  return result;
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function requestIdleCallback(callback: () => void, timeout = 2000) {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }

  return setTimeout(callback, 1);
}

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  mark(name: string) {
    const time = performance.now();
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(time);
  }

  measure(name: string, startMark: string, endMark: string) {
    const starts = this.metrics.get(startMark);
    const ends = this.metrics.get(endMark);

    if (!starts || !ends || starts.length === 0 || ends.length === 0) {
      console.warn(`[Performance] Cannot measure ${name}: marks not found`);
      return null;
    }

    const duration = ends[ends.length - 1] - starts[starts.length - 1];

    if (duration > 100) {
      console.warn(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  clear() {
    this.metrics.clear();
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

export const perfMonitor = new PerformanceMonitor();
