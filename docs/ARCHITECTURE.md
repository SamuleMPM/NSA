# Arquitectura del Sistema

## Flujo de datos

```
Investigación → Motor de simulación → API REST (Node.js) → SQLite → Frontend React
                                              ↑                         │
                                              └── sincronización ───────┘
```

1. El frontend genera telemetría **sintética** y recibe registros manuales del
   operador.
2. `src/lib/api.js` envía las mutaciones a `/api`.
3. `backend/` valida, normaliza y persiste en SQLite dentro de transacciones.
4. `GET /api/bootstrap` hidrata la consola al recargar.
5. `localStorage` actúa como caché de arranque y modo de contingencia.

## Componentes

| Componente | Responsabilidad |
| :--- | :--- |
| `frontend/src/lib/records.js` | Esquemas de las seis categorías y validación de entrada. |
| `frontend/src/lib/alerts.js` | Reconciliación y ciclo de vida de alertas. |
| `frontend/src/lib/risks.js` | Modelo RIDGE (R, I, D, G, E). |
| `frontend/src/lib/api.js` | Cliente HTTP, timeouts y errores tipados. |
| `frontend/src/lib/persistence.js` | Hidratación, migración y sincronización con debounce. |
| `backend/src/server.js` | Router REST, CORS, validación de cuerpos y servido del SPA. |
| `backend/src/db.js` | Apertura de SQLite, WAL, migraciones y semilla. |
| `backend/src/repositories/` | Acceso a datos por entidad. |

## Base de datos

```
crew (1) ─────< records.astronaut_id
records (1) ──< suppressed_vitals.record_id

alerts          (payload JSON + status/severity/kind indexados)
logs
risk_history
```

| Tabla | Propósito |
| :--- | :--- |
| `crew` | Perfil operativo de la tripulación. |
| `records` | Registros de astronauta, vitales, telemetría, ECG, entorno y simulación. |
| `alerts` | Alertas clínicas y RIDGE con su ciclo de vida. |
| `logs` | Consola operativa de la misión. |
| `risk_history` | Instantáneas del score RIDGE. |
| `suppressed_vitals` | Registros neutralizados por contramedidas. |

Cada entidad conserva su contrato clínico completo en JSON (`data`, `payload`,
`scores`) y duplica en columnas los campos consultables. Esto permite evolucionar
el frontend sin migraciones destructivas y mantiene consultas indexadas.

## Contrato de integración (JSON)

Todos los datos generados deben seguir este formato:

```json
{
  "metadata": {
    "source": "simulation_engine_v1",
    "is_synthetic": true,
    "mission_id": "mars_001",
    "scenario": "microgravity_high_radiation"
  },
  "astronaut": { "id": "ast_001", "name": "Neil A." },
  "vital_signs": {
    "timestamp": "2026-05-20T14:30:00Z",
    "heart_rate": { "value": 85, "unit": "bpm", "status": "normal" }
  }
}
```

La API de registros usa un contrato plano compatible con el frontend:

```json
{
  "id": "rec_…",
  "category": "vitals",
  "astronautId": "ast_001",
  "origin": "manual",
  "recordedAt": "2026-05-20T14:30:00.000Z",
  "data": {
    "heart_rate": 85,
    "spo2": 98,
    "temperature": 36.6,
    "respiratory_rate": 14
  }
}
```

## Decisiones técnicas

- **Node.js + `node:sqlite`**: cero dependencias externas y sin compilación
  nativa; el backend arranca con `npm start` en Windows, Linux y macOS.
- **JSON + columnas indexables**: equilibrio entre flexibilidad clínica y
  consultas eficientes.
- **Reemplazo completo por recurso**: la consola es mono-operador; los `PUT`
  idempotentes simplifican la sincronización y la recuperación offline.
- **Migración automática**: la primera hidratación importa `localStorage` si
  SQLite está vacío, sin perder el trabajo previo.

## Referencias

- API, esquema y pruebas: [`backend/README.md`](../backend/README.md).
- Diccionario clínico: [`docs/DATA_DICTIONARY.md`](DATA_DICTIONARY.md).
- Modelo RIDGE: implementación en
  [`frontend/src/lib/risks.js`](../frontend/src/lib/risks.js) y panel en
  [`frontend/src/modules/RisksPanel.jsx`](../frontend/src/modules/RisksPanel.jsx).
