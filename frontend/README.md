# Frontend - Centro de Telemetría Biomédica Aeroespacial

Interfaz moderna y de alta fidelidad desarrollada con **React.js 18**, **Tailwind CSS**, **Lucide Icons** y **Vite** para el **Equipo 3 (Frontend y UX)**.

---

## 🛰️ Características Principales

- **Dashboard de Telemetría en Tiempo Real:** 
  - Tarjetas de constantes vitales con medidores visuales, deltas de cambio y estados (*Nominal*, *Advertencia*, *Alerta Crítica*).
  - Reglas clínicas automáticas basadas en [docs/DATA_DICTIONARY.md](file:///c:/Users/raydl/Documents/Streamlit/NSA/docs/DATA_DICTIONARY.md).
- **Osciloscopio / ECG en Vivo (Lead II):**
  - Trazado dinámico en Canvas de la onda cardíaca P-Q-R-S-T a 25 mm/s y 10 mm/mV sincronizado con los latidos (BPM).
  - Efecto de audio opcional (Web Audio API) con sonido de monitor médico conmutable.
- **Tripulación Activa y Selector de Astronautas:**
  - `ast_001`: Neil A. (Comandante de Misión — EVA)
  - `ast_002`: Ellen O. (Especialista Biomédica — IVA)
  - `ast_003`: Pedro D. (Ingeniero de Vuelo — REST)
- **Motor de Simulación Fisiológica de Escenarios:**
  - Microgravedad Estándar (Nominal)
  - Paseo Espacial (EVA / Alta Carga Fisiológica)
  - Alerta de Hipoxia (Despresurización Parcial)
  - Estrés Térmico / Hipertermia
  - Ciclo de Reposo / Sueño
  - Inyector de anomalías de emergencia y botón de estabilización médica.
- **Gráficos de Tendencias y Análisis Temporal:**
  - Visualización vectorial SVG con curvas suavizadas, rangos de referencia y estadísticas (Mínimo, Promedio, Máximo).
- **Terminal de Eventos y Logs:**
  - Registro de auditoría cronológico con filtrado por severidad (`INFO`, `WARN`, `CRITICAL`).
- **Contrato de Integración JSON:**
  - Modal interactivo con copia al portapapeles y descarga de telemetría conforme a la especificación en [docs/ARCHITECTURE.md](file:///c:/Users/raydl/Documents/Streamlit/NSA/docs/ARCHITECTURE.md).
- **Diccionario Médico Integrado:**
  - Acceso inmediato a la tabla de variables, unidades y umbrales de alerta.

---

## 🛠️ Tecnologías

- **React 18** (JavaScript)
- **Vite 6** (Bundler de alto rendimiento)
- **Tailwind CSS 3** (Diseño aeroespacial oscuro y glassmorphism)
- **Lucide React** (Iconografía técnica y médica)
- **HTML5 Canvas & Web Audio API** (Osciloscopio y alertas sonoras)

---

## 🚀 Inicio Rápido

### 1. Requisitos
- **Node.js** v18+ y **npm** (o `npx`)

### 2. Instalación de dependencias
Desde la carpeta `frontend/`:
```bash
npm install
```

### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```
La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`.

### 4. Compilar para producción
```bash
npm run build
```
Los archivos optimizados se generarán en la carpeta `frontend/dist/`.
