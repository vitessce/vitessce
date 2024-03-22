import DuckDB from '@jetblack/duckdb-react';

const BUNDLES = {
  mvp: {
    mainModule: new URL("@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm", import.meta.url).href,
    mainWorker: new URL("@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js", import.meta.url).href,
  },
  eh: {
    mainModule: new URL("@duckdb/duckdb-wasm/dist/duckdb-eh.wasm", import.meta.url).href,
    mainWorker: new URL("@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js", import.meta.url).href,
  },
  coi: {
    mainModule: new URL("@duckdb/duckdb-wasm/dist/duckdb-coi.wasm", import.meta.url).href,
    mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-coi.worker.js', import.meta.url).href,
    pthreadWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-coi.pthread.worker.js', import.meta.url).href,
  },
};

export function DbProvider(props) {
  const { children } = props;
  return (
    <DuckDB>
      {children}
    </DuckDB>
  );
}