import { useMemo } from 'react';

export function useTextSplit(text: string, by: 'words' | 'chars' | 'lines' = 'words') {
  return useMemo(() => {
    if (by === 'chars') return text.split('');
    if (by === 'lines') return text.split('\n');
    return text.split(' ');
  }, [text, by]);
}
