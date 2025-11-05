import { useEffect, useState } from 'react';

/**
 * Hook para debounce de valores
 * Retorna o valor após o delay especificado sem mudanças
 *
 * @param value - Valor a ser debounced
 * @param delay - Delay em ms (padrão: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
