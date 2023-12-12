import { useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from '@mui/material';

const useDebounce = (callback, delay) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useMemo(() => {
    const func = (...args) => {
      ref.current?.(...args);
    };

    return debounce(func, delay);
  }, [delay]);
};

export default function GeneInfo({ gene }) {
  const [data, setData] = useState(null);


  // Debounce the gene input
  const debouncedFetchData = useDebounce(async (geneId) => {
    try {
      if (!geneId) return;
      const url = `https://mygene.info/v3/query?q=ensembl.gene:${geneId.split('.')[0]}&fields=all&size=1`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.hits.length === 0) {
        setData('NOT FOUND');
      } else {
        setData(result.hits[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  });

  useEffect(() => {
    debouncedFetchData(gene);
  }, [debouncedFetchData, gene]); // Dependency on the memoized function

  // Render your component
  return (
    <div>
      {gene}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
