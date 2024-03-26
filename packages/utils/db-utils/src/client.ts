import { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { getArrowTableSchema } from "./arrow.js";
import { AsyncRecordBatchStreamReader, RecordBatch, Schema, Table } from "apache-arrow";

// Adapted from https://observablehq.com/@cmudig/duckdb-client
// Copyright 2021 CMU Data Interaction Group
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors
//    may be used to endorse or promote products derived from this software
//    without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

class ArrayWithSchema extends Array<any> {
    schema?: ReturnType<typeof getArrowTableSchema>;
}

async function queryStream(db: AsyncDuckDB, query: string, params?: string[]) {
    const connection = await db.connect();
    let reader: AsyncRecordBatchStreamReader;
    let batch: IteratorResult<RecordBatch>;
    try {
      if (params && params?.length > 0) {
        const statement = await connection.prepare(query);
        reader = await statement.send(...params) as unknown as AsyncRecordBatchStreamReader<any>;
      } else {
        reader = await connection.send(query) as unknown as AsyncRecordBatchStreamReader<any>;
      }
      batch = await reader.next();
      if (batch.done) throw new Error("missing first batch");
    } catch (error) {
      await connection.close();
      throw error;
    }
    return {
      schema: getArrowTableSchema(batch.value),
      async *readRows() {
        try {
          while (!batch.done) {
            yield batch.value.toArray();
            batch = await reader.next();
          }
        } finally {
          await connection.close();
        }
      }
    };
  }

async function queryArray(db: AsyncDuckDB, query: string, params?: string[]) {
  const result = await queryStream(db, query, params);
  const results: ArrayWithSchema = [];
  for await (const rows of result.readRows()) {
      for (const row of rows) {
      results.push(row);
      }
  }
  results.schema = result.schema;
  return results;
}

async function queryRow(db: AsyncDuckDB, query: string, params?: string[]) {
  const result = await queryStream(db, query, params);
  const reader = result.readRows();
  try {
    const {done, value} = await reader.next();
    return done || !value.length ? null : value[0];
  } finally {
    await reader.return();
  }
}


function escape(name: string) {
  return `"${name}"`;
}

export async function describeTables(db: AsyncDuckDB) {
  const tables = await queryArray(db, `SHOW TABLES`);
  return tables.map(({ name }: { name: string }) => name);
}

export async function hasTable(db: AsyncDuckDB, table: string) {
  const tables = await describeTables(db);
  return tables.includes(table);
}

async function describeColumns(db: AsyncDuckDB, { table }: { table: string }) {
  const columns = await queryArray(db, `DESCRIBE ${escape(table)}`);
  return columns.map(({column_name, column_type, null: nullable}) => ({
    name: column_name,
    type: getDuckDBType(column_type),
    nullable: nullable !== "NO",
    databaseType: column_type
  }));
}


// https://duckdb.org/docs/sql/data_types/overview
function getDuckDBType(type: string) {
  switch (type) {
    case "BIGINT":
    case "HUGEINT":
    case "UBIGINT":
      return "bigint";
    case "DOUBLE":
    case "REAL":
    case "FLOAT":
      return "number";
    case "INTEGER":
    case "SMALLINT":
    case "TINYINT":
    case "USMALLINT":
    case "UINTEGER":
    case "UTINYINT":
      return "integer";
    case "BOOLEAN":
      return "boolean";
    case "DATE":
    case "TIMESTAMP":
    case "TIMESTAMP WITH TIME ZONE":
      return "date";
    case "VARCHAR":
    case "UUID":
      return "string";
    // case "BLOB":
    // case "INTERVAL":
    // case "TIME":
    default:
      if (/^DECIMAL\(/.test(type)) return "integer";
      return "other";
  }
}
