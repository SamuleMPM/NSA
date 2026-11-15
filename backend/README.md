# AeroHealth Backend · API REST + SQLite

Backend funcional de la consola **AeroHealth** para el NASA Space Apps Challenge.
Expone una API REST sobre **Node.js** y **SQLite**, persiste todas las entidades
que produce el frontend (registros de Inserción de datos, alertas, logs,
historial RIDGE, vitales suprimidos y tripulación) y puede servir el bundle de
producción de React.

> Equipo 2 · Backend y Arquitectura de Datos.
> Los datos clínicos del proyecto son sintéticos o introducidos manualmente; no
> son telemetría real de la NASA.

---

## Stack

| Capa | Tecnología |
| :--- | :--- |
| Runtime | Node.js **24** (probado con 24.15) |
| HTTP | `node:http` nativo, sin frameworks ni dependencias externas |
| Base de datos | `node:sqlite` (`DatabaseSync`), WAL y transacciones |
| Formato | JSON UTF-8, envelope `{ data, meta }` |
| Frontend | React 18 + Vite 6 consumiendo `/api` |

No hay `npm install` en `backend/`: el proyecto usa únicamente módulos nativos de
Node. Esto evita compilaciones nativas de SQLite y funciona en Windows, Linux y
macOS.

---

## Arranque rápido

```bash
# 1) API (crea backend/data/aerohealth.db automáticamente)
cd backend
npm start                 # http://127.0.0.1:4000

# 2) Frontend en otra terminal
cd frontend
npm install
npm run dev               # http://localhost:3000 (proxy /api → :4000)
```

En Windows también puedes ejecutar `iniciar_frontend.bat` en la raíz: levanta la
API y la consola Vite en una sola operación. `iniciar_backend.bat` levanta solo la
API.

### Producción (un único servidor)

```bash
cd frontend && npm run build
cd ../backend && npm start
# Consola + API en http://127.0.0.1:4000
```

Si existe `frontend/dist`, el servidor sirve el SPA y aplica fallback a
`index.html` para las rutas del cliente.

---

## Scripts

| Comando | Descripción |
| :--- | :--- |
| `npm start` | Inicia la API en `HOST:PORT`. |
| `npm run dev` | Igual, con `node --watch` para recarga en caliente. |
| `npm test` | Suite de integración con `node:test` sobre una base temporal. |
| `npm run db:seed` | Aplica el esquema y la semilla de tripulación. |
| `npm run db:reset` | Elimina y recrea la base local (pierde datos). |

---

## Configuración

Variables de entorno (ver `.env.example`):

| Variable | Por defecto | Descripción |
| :--- | :--- | :--- |
| `HOST` | `127.0.0.1` | Interfaz de escucha. Usa `0.0.0.0` para exponer en LAN. |
| `PORT` | `4000` | Puerto HTTP. |
| `DB_PATH` | `backend/data/aerohealth.db` | Ruta del archivo SQLite. |
| `CORS_ORIGIN` | `*` | Origen permitido para CORS. |
| `BODY_LIMIT_BYTES` | `2097152` | Tamaño máximo del cuerpo JSON (2 MB). |
| `LOG_REQUESTS` | desactivado | `1` imprime método, ruta, estado y latencia. |

Node no lee `.env` automáticamente; puedes arrancar con
`node --env-file=.env src/server.js` o definir las variables en el sistema.

---

## Modelo de datos

```
crew (1) ───< records.astronaut_id
records (1) ───< suppressed_vitals.record_id
alerts          (payload JSON + columnas indexables)
logs
risk_history
```

| Tabla | Propósito | Columnas clave |
| :--- | :--- | :--- |
| `crew` | Perfil operativo de cada tripulante. | `id`, `name`, `role`, `activity`, `mission_days` |
| `records` | Las seis categorías de Inserción de datos. | `id`, `category`, `astronaut_id`, `origin`, `recorded_at`, `data` |
| `alerts` | Ciclo de vida de alertas clínicas y RIDGE. | `id`, `status`, `severity`, `kind`, `payload` |
| `logs` | Consola operativa de la misión. | `id`, `time`, `level`, `message`, `timestamp` |
| `risk_history` | Instantáneas del modelo RIDGE. | `id`, `timestamp`, `score`, `level`, `scores` |
| `suppressed_vitals` | Registros neutralizados por contramedida. | `record_id`, `suppressed_at` |

Categorías válidas de `records`: `astronaut`, `vitals`, `telemetry`, `ecg`,
`environment`, `simulation`. Orígenes: `manual`, `simulated`, `automated`.

Las entidades conservan el objeto clínico completo en una columna JSON (`data`,
`payload`, `scores`) para que el contrato del frontend evolucione sin migraciones
destructivas. Las columnas duplicadas (`category`, `status`, `severity`,
`recorded_at`…) permiten filtrar e indexar.

### Integridad y comportamiento

- SQLite en modo **WAL**, `foreign_keys` activo y `busy_timeout` de 5 s.
- Las escrituras compuestas usan transacciones (`BEGIN IMMEDIATE`).
- Al crear/actualizar un registro `astronaut`, la API actualiza `crew`.
- Al borrar un registro se elimina su marca en `suppressed_vitals`.
- `PUT /api/records` y `PUT /api/state` son **reemplazos completos** pensados
  para la sincronización de la consola y la importación inicial.
- El arranque siembra tres tripulantes (`ast_001`, `ast_002`, `ast_003`) solo si
  no existen.

---

## API REST

Base: `/api`. Respuesta de recurso: `{ "data": ... }`. Listados:
`{ "data": [...], "meta": { "total": 12, "limit": 500, "offset": 0 } }`.
Errores: `{ "error": { "code": "bad_request", "message": "..." } }`.

### Salud y snapshot

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servicio y de SQLite. |
| `GET` | `/api/bootstrap` | Snapshot inicial completo. |
| `GET` | `/api/state` | Alias de `bootstrap`. |
| `PUT` | `/api/state` | Importa/reemplaza el snapshot completo. |
| `GET` | `/api/stats` | Agregados de registros, alertas y tripulación. |

`GET /api/bootstrap` devuelve:

```json
{
  "data": {
    "records": [],
    "alerts": [],
    "logs": [],
    "riskHistory": [],
    "suppressedVitals": [],
    "crew": [{ "id": "ast_001", "name": "Neil A.", "missionDays": 62 }]
  },
  "meta": { "generatedAt": "2026-05-20T14:30:00.000Z" }
}
```

### Registros

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/records` | Lista con filtros `category`, `astronautId`, `origin`, `from`, `to`, `limit`, `offset`. |
| `POST` | `/api/records` | Crea un registro. `409` si el `id` ya existe. |
| `PUT` | `/api/records` | Reemplaza todos los registros (sincronización). |
| `GET` | `/api/records/:id` | Obtiene un registro. |
| `PUT/PATCH` | `/api/records/:id` | Actualiza; `data` se fusiona con el registro existente. |
| `DELETE` | `/api/records/:id` | Elimina el registro. |
| `GET` | `/api/records/export?category=vitals` | Exportación compatible con el JSON del frontend. |

Ejemplo de creación:

```bash
curl -X POST http://127.0.0.1:4000/api/records \
  -H "Content-Type: application/json" \
  -d '{
    "category": "vitals",
    "astronautId": "ast_001",
    "origin": "manual",
    "recordedAt": "2026-05-20T14:30:00.000Z",
    "data": {
      "heart_rate": 88,
      "spo2": 97,
      "temperature": 36.7,
      "respiratory_rate": 15
    }
  }'
```

El servidor completa `id`, `title`, `createdAt` y `updatedAt` si faltan. El `id`
puede generarlo el cliente para mantener la actualización optimista del frontend.

### Alertas

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/alerts` | Filtros `status`, `severity`, `kind`, `astronautId`. |
| `POST` | `/api/alerts` | Crea o reemplaza una alerta por `id`. |
| `PUT` | `/api/alerts` | Reemplaza la lista (`{ "alerts": [...] }` o array). |
| `PATCH` | `/api/alerts/:id` | Actualiza estado/campos. |
| `DELETE` | `/api/alerts/:id` | Elimina una alerta. |
| `DELETE` | `/api/alerts` | Vacía el historial. |

### Logs

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/logs?limit=120` | Últimos logs en orden cronológico. |
| `POST` | `/api/logs` | Añade una entrada. |
| `PUT` | `/api/logs` | Reemplaza la lista. |
| `DELETE` | `/api/logs` | Vacía la consola. |

### Historial RIDGE

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/risk-history?limit=60` | Instantáneas más recientes. |
| `POST` | `/api/risk-history` | Añade una instantánea. |
| `PUT` | `/api/risk-history` | Reemplaza el historial. |
| `DELETE` | `/api/risk-history` | Vacía el historial. |

### Vitales suprimidos

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/suppressed-vitals` | IDs de registros neutralizados. |
| `PUT` | `/api/suppressed-vitals` | Reemplaza la lista. |

### Tripulación

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/crew` | Tripulación completa. |
| `POST` | `/api/crew` | Crea/actualiza un perfil (requiere `id`). |
| `PUT` | `/api/crew` | Reemplaza la tripulación. |
| `GET` | `/api/crew/:id` | Perfil individual. |
| `PUT/PATCH` | `/api/crew/:id` | Actualiza un perfil. |

---

## Cómo sincroniza el frontend

1. `App.jsx` arranca con la caché de `localStorage` (render inmediato).
2. Pide `GET /api/bootstrap` y sustituye el estado por el de SQLite.
3. Si SQLite está vacío y hay datos locales de una versión anterior, ejecuta
   `PUT /api/state` una sola vez (migración automática).
4. Cada mutación actualiza el estado y un efecto con debounce de 250 ms envía:
   - `PUT /api/records`
   - `PUT /api/alerts`
   - `PUT /api/logs`
   - `PUT /api/risk-history`
   - `PUT /api/suppressed-vitals`
5. Si la API no responde, la consola muestra **Modo local**, mantiene
   `localStorage` y reintenta al recuperar `online` o en la siguiente mutación.
6. El Header muestra el estado: **API · SQLite**, **Conectando…** o **Modo local**.

---

## Pruebas

```bash
cd backend
npm test
```

La suite crea una base temporal, levanta la API en un puerto efímero y verifica
salud, CRUD de registros, propagación a tripulación, alertas, logs, riesgos,
vitales suprimidos, snapshots, exportación y validaciones.

---

## Limitaciones y siguientes pasos

- Autenticación y roles (`Flight Surgeon`, `Astronauta`) aún no implementados.
- El modelo RIDGE y los umbrales clínicos viven en el frontend; el backend los
  persiste, no los recalcula.
- Sin websockets: la telemetría sintética se genera en el cliente y solo se
  persisten los registros y agregados.
- La sincronización usa reemplazos completos (`PUT`). Si otro cliente o una
  llamada directa a la API modifica o elimina datos mientras la consola está
  abierta, la siguiente mutación de la consola puede restaurar su versión. Es
  intencional para un único operador; para varios clientes conviene pasar a
  operaciones por registro (`POST/PATCH/DELETE`) o a bloqueo optimista.
- Para despliegue multiusuario conviene añadir autenticación, versionado de
  registros y bloqueo optimista.
