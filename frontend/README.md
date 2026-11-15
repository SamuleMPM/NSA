# Frontend · NASA AeroHealth

Consola de monitorización biomédica espacial construida con **React 18**, **Vite 6**,
**Tailwind CSS 3**, **Lucide** y **Three.js**. Interfaz de Flight Surgeon para una
misión de tránsito interplanetario, con datos **simulados** o introducidos
manualmente y persistencia real en la API + SQLite del repositorio.

> Los valores del motor de simulación no representan telemetría real de la NASA.
> El modelo RIDGE es una ayuda a la decisión, no un límite clínico oficial.

---

## Módulos

La navegación principal tiene tres módulos:

1. **Dashboard** — cuatro pestañas:
   - `Resumen`: KPIs, tripulación, constantes vitales, matriz RIDGE, alertas abiertas, entorno y estado de los registros.
   - `Alertas`: detección automática, filtros por estado/severidad, atención, resolución y contramedidas.
   - `Riesgos RIDGE`: los cinco riesgos HRP, indicadores, fórmulas, contramedidas e historial.
   - `Inserción de datos`: seis categorías con validación, edición, borrado y exportación JSON.
2. **Telemetría y ECG** — constantes vitales, ECG Lead II, panel del último ECG validado, astronauta 3D, tendencias y perfil biomédico.
3. **Simulador y entornos** — nueve escenarios fisiológicos, cuatro entornos, telemetría ambiental sintética, evaluación RIDGE y guardado de corridas.

La barra lateral se puede contraer/expandir en escritorio y se convierte en
navegación inferior en móvil. El estado de contracción se conserva.

---

## Inserción de datos

Categorías disponibles:

| Categoría | Contenido |
| :--- | :--- |
| Astronauta | Identificación, rol, actividad, demografía y contexto de misión. |
| Signos vitales | HR, SpO₂, temperatura, frecuencia respiratoria, presión, glucosa, sueño y estrés. |
| Telemetría | Fuente de señal, muestreo, HRV, calidad y ritmo observado. |
| ECG | Ritmo, intervalos PR/QRS/QTc, segmento ST e interpretación. |
| Entorno espacial | O₂, CO₂, presión, temperatura, humedad, calidad de aire, radiación y enlace. |
| Simulación | Escenario, entorno, condiciones iniciales, variables RIDGE y resultado. |

Cada registro conserva fecha, origen (`manual`, `simulated`, `automated`),
validación y marcas de creación/actualización. Los registros se propagan a
Dashboard, Telemetría, Simulador, Alertas y Riesgos.

---

## Alertas

- Evaluación automática de HR, SpO₂, temperatura y frecuencia respiratoria.
- Alertas de riesgo RIDGE y de ritmo ECG.
- Severidades: informativa, advertencia, crítica y emergencia.
- Ciclo de vida: activa → atendida → resuelta, con historial y recurrencias.
- Cada alerta muestra parámetro, valor, rango de referencia, fecha, explicación y recomendaciones.
- Una contramedida normaliza la simulación y suprime el registro manual que originó la alerta, incluso tras recargar.

Rangos nominales, de advertencia y críticos: `docs/DATA_DICTIONARY.md`.
Umbrales de emergencia: configurables, marcados como simulación.

---

## Riesgos RIDGE

Implementación de los cinco riesgos del NASA HRP:

- **R** Radiación espacial.
- **I** Aislamiento y confinamiento.
- **D** Distancia de la Tierra.
- **G** Campos gravitatorios alterados.
- **E** Entornos cerrados y hostiles.

Detalles de fórmulas, bandas, fuentes y limitaciones:
[`src/lib/risks.js`](src/lib/risks.js).

---

## Persistencia

La fuente de verdad es la **API REST + SQLite** de `backend/` (ver
[`backend/README.md`](../backend/README.md)). El frontend:

1. Arranca al instante con la caché de `localStorage` (`aerohealth.v2.`).
2. Se hidrata con `GET /api/bootstrap`.
3. Migra automáticamente datos antiguos de `localStorage` si la base está vacía.
4. Sincroniza cada mutación con `PUT /api/records`, `/api/alerts`, `/api/logs`,
   `/api/risk-history` y `/api/suppressed-vitals` (debounce de 250 ms).
5. Si la API no responde, muestra **Modo local**, conserva `localStorage` y
   reintenta al volver la conexión o en la siguiente escritura.

El Header indica el estado de persistencia: **API · SQLite**, **Conectando…** o
**Modo local**.

### Desarrollo con API

```bash
# Terminal 1
cd backend
npm start                 # http://127.0.0.1:4000

# Terminal 2
cd frontend
npm run dev               # http://localhost:3000 (proxy /api → :4000)
```

`vite.config.js` reenvía `/api` al backend. Para apuntar a otro servidor:

```bash
# frontend/.env.local
VITE_API_URL=https://mi-api.example.com/api
```

---

## Estructura

```
frontend/src/
├── App.jsx                     # Orquestación, simulación en vivo, alertas y sincronización
├── modules/
│   ├── Dashboard.jsx           # Shell de pestañas
│   ├── DashboardOverview.jsx
│   ├── AlertsPanel.jsx
│   ├── RisksPanel.jsx
│   ├── DataEntry.jsx
│   ├── BiomedicalTelemetry.jsx
│   ├── MissionSimulator.jsx
│   └── MedicalHandbook.jsx
├── components/                 # Header, Sidebar, tarjetas, ECG, 3D, matriz de riesgo…
└── lib/
    ├── api.js                  # Cliente HTTP de la API REST
    ├── persistence.js          # Hidratación, migración y sincronización
    ├── clinical.js             # Rangos y recomendaciones clínicas
    ├── risks.js                # Modelo RIDGE
    ├── records.js              # Esquemas y validación de las seis categorías
    ├── alerts.js               # Motor de alertas
    ├── simulation.js           # Escenarios y telemetría sintética
    ├── environments.js         # Entornos de misión
    ├── storage.js              # Caché local de arranque
    └── format.js               # Utilidades de formato
```

---

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # genera dist/
npm run preview   # sirve la compilación de producción
```

Requisitos: Node.js 18+ para el frontend. Para servir la API se recomienda
Node.js 24.
