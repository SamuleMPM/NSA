import fs from 'node:fs';
import { DB_PATH } from '../src/config.js';
import { openDatabase } from '../src/db.js';

for (const suffix of ['', '-wal', '-shm']) {
  const target = `${DB_PATH}${suffix}`;
  if (fs.existsSync(target)) {
    fs.rmSync(target, { force: true });
    console.log(`Eliminado: ${target}`);
  }
}

const db = openDatabase();
console.log(`Base de datos recreada con esquema y semilla: ${DB_PATH}`);
db.close();
