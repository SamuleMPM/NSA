import { openDatabase } from '../src/db.js';
import { DB_PATH } from '../src/config.js';
import { listCrew } from '../src/repositories/crew.js';
import { summarizeRecords } from '../src/repositories/records.js';

const db = openDatabase();
const summary = summarizeRecords(db);
const crew = listCrew(db);

console.log(`Base de datos: ${DB_PATH}`);
console.log(`Tripulantes: ${crew.length}`);
console.log(`Registros: ${summary.total}`);
db.close();
