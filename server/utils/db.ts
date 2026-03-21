import mysql from "mysql2/promise";

let pool: mysql.Pool;

export function getPool() {
  const config = useRuntimeConfig();

  if (!pool) {
    pool = mysql.createPool({
      host: config.dbHost,
      user: config.dbUser,
      database: config.dbName,
      port: Number(config.dbPort || 3306),
      password: config.dbPass,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]) {

  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}
