import { selectBundle, ConsoleLogger, createWorker, AsyncDuckDB, LogLevel } from "@duckdb/duckdb-wasm";

let promise;

async function loadDuckDB() {
    const bundle = await selectBundle({
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
    });
    const logger = new ConsoleLogger(
        LogLevel.DEBUG // TODO: vary this based on environment
    );
    return { bundle, logger };
}
  
async function createDuckDB() {
    if (promise === undefined) promise = loadDuckDB();
    const { bundle, logger } = await promise;
    const worker = await createWorker(bundle.mainWorker);
    const db = new AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule);
    return db;
}


export async function initDatabase() {
    const db = await createDuckDB();
    const config = {
        query: {
            castTimestampToDate: true,
            castBigIntToDouble: true,
        },
    };
	await db.open(config);
	return db;
}