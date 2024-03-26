import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { tableFromArrays, makeVector, makeTable, tableToIPC } from "apache-arrow";
import { hasTable } from "./client.js";




export async function insertTable(db: AsyncDuckDB, embeddingArr: any) {

    console.log(hasTable(db, 'embeddings'));
    /*const table = makeTable({
        a: makeVector(new Int32Array([1, 2, 3])),
        b: makeVector(new Int32Array([4, 5, 6])),
    });
    const ipc = tableToIPC(table);
    await db.query(`CREATE TABLE test (a INTEGER, b INTEGER)`);
    await db.query(`INSERT INTO test SELECT * FROM read_ipc('${ipc}')`);
    */
}