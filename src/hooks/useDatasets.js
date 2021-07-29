import { useState, useEffect } from 'react';

function useDatasets(url) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    () => {
      const fetchData = async () => {
        setIsLoading(true);
        const res = await fetch(
          url,
          {
            headers: new Headers([['Accept', 'application/json']]),
          },
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setIsLoading(false);
        } else {
          setData({});
          setIsLoading(false);
        }
      };
      fetchData();
    }, [url],
  );
  return isLoading ? 'loading' : data;
}

export default useDatasets;
