import { ConsoleLogger, LogLevel } from "@duckdb/duckdb-wasm";
import { DuckDBConnectionProvider, DuckDBPlatform, DuckDBProvider } from '@duckdb/react-duckdb';

const DUCKDB_BUNDLES = {
    mvp: {
        mainModule: new URL("@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm", import.meta.url).toString(),
        mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js', import.meta.url).toString(),
    },
    eh: {
        mainModule: new URL("@duckdb/duckdb-wasm/dist/duckdb-eh.wasm", import.meta.url).toString(),
        mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).toString(),
    },
    coi: {
        mainModule: new URL("@duckdb/duckdb-wasm/dist/duckdb-coi.wasm", import.meta.url).toString(),
        mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-coi.worker.js', import.meta.url).toString(),
        pthreadWorker: new URL(
            '@duckdb/duckdb-wasm/dist/duckdb-browser-coi.pthread.worker.js',
            import.meta.url,
        ).toString(),
    },
};
const logger = new ConsoleLogger(LogLevel.WARNING);

export function DbProvider(props) {
    const { children } = props;
    return (
        <DuckDBPlatform logger={logger} bundles={DUCKDB_BUNDLES}>
            <DuckDBProvider>
                <DuckDBConnectionProvider>
                    {children}
                </DuckDBConnectionProvider>
            </DuckDBProvider>
        </DuckDBPlatform>
    );
}
