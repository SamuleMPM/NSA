# AeroHealth — Plataforma de Monitorización de Salud y Autoevaluación Espacial (NASA Space Apps Challenge)

[![NASA Space Apps](https://img.shields.io/badge/NASA%20Space%20Apps-Challenge%20Solution-blue.svg)](https://www.spaceappschallenge.org/)
[![NASA HRP](https://img.shields.io/badge/Standards-NASA%20HRP%20(RIDGE)-orange.svg)](https://www.nasa.gov/hrp)
[![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Vite%20%7C%20Tailwind%20CSS-cyan.svg)](https://vitejs.dev/)

> **AeroHealth** es una plataforma de software biomédico aeroespacial diseñada para que los astronautas en misiones de larga duración (como el programa Artemis y viajes tripulados a Marte) recopilen indicadores de salud, evalúen su estado físico y mental de forma autónoma, y ejecuten contramedidas clínicas sin depender de telemedicina en tiempo real desde la Tierra.

---

## 🚀 Contexto y Planteamiento del Reto

Las misiones espaciales de larga duración exponen a los astronautas al hostil entorno del espacio profundo. El **NASA Human Research Program (HRP)** categoriza estas amenazas en los **cinco riesgos de los vuelos tripulados (RIDGE)**:

1. **R — Space Radiation (Radiación Espacial):** Rayos Cósmicos Galácticos (GCR) y Eventos de Partículas Solares (SPE) que dañan el ADN, aceleran cataratas e inducen estrés cardiovascular e inmunosupresión.
2. **I — Isolation and Confinement (Aislamiento y Confinamiento):** Volúmenes cerrados y distancia extrema que alteran el ritmo circadiano, provocan fatiga crónica, insomnio y sobrecarga cognitiva.
3. **D — Distance from Earth (Distancia a la Tierra):** Retardos de comunicación de hasta 22 minutos de ida (44 min de ida y vuelta a Marte), haciendo imposible la evacuación o la consulta en tiempo real con cirujanos de vuelo (Flight Surgeons) en Houston. **La autonomía diagnóstica y terapéutica es obligatoria.**
4. **G — Gravity Fields (Campos Gravitatorios Alterados):** Transición entre $1g$, $0g$ (microgravedad), $0.16g$ (Luna) y $0.38g$ (Marte). Provoca desmineralización ósea acelerada ($\sim 1.2\%$ mensual en fémur y columna), atrofia muscular, intolerancia ortostática y el **Síndrome Neuro-Ocular Asociado a Vuelos Espaciales (SANS)** por redistribución de 2 litros de fluidos hacia la cabeza.
5. **E — Hostile Closed Environments (Entornos Cerrados y Hostiles):** Atmósferas artificiales con riesgo de hipercapnia por acumulación de $CO_2$, microbios reciclados, toxicología de regolito (polvillo marciano abrasivo) y alteración de la microbiota intestinal y metabolismo glucémico.

---

## 🛠️ Arquitectura de la Solución

```
 ┌───────────────────────────────────────────────────────────────┐
 │               AEROHEALTH CONSOLE ARCHITECTURE                 │
 └───────────────────────────────┬───────────────────────────────┘
                                 │
     ┌───────────────────────────┴───────────────────────────┐
     ▼                                                       ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     HRP PHYSIOLOGICAL ENGINE  │       │  ASTRONAUT INTERACTION & UX   │
│  • Ecuación de Hill (SpO2)    │       │  • Holograma Anatómico 3D SVG │
│  • Balance térmico escafandra │       │  • Autoevaluación & Ecógrafo  │
│  • Presión arterial & Fluid   │       │  • Gamificación & Rutinas     │
│  • Glucosa espacial & Insulina│       │  • Manual Médico Sencillo     │
│  • SANS & Calipers ONSD (mm)  │       │  • Consola Multicanal Lead II │
└───────────────┬───────────────┘       └───────────────┬───────────────┘
                │                                       │
                └───────────────────┬───────────────────┘
                                    ▼
                ┌───────────────────────────────────────┐
                │        STANDARDIZED JSON SCHEMA       │
                │    Contrato de datos interoperable    │
                │     para MCC-H y software de a bordo  │
                └───────────────────────────────────────┘
```

---

## 🌟 Módulos y Funcionalidades Principales

### 1. 🧍‍♂️ Holograma Biomédico Anatómico Interactivo (`MOD-02`)
- **Silueta holográfica SVG del astronauta** con nodos anatómicos interactivos:
  - **Cerebro / Salud Mental:** Estrés adinámico, fatiga circadiana, aislamiento y neuroplasticidad.
  - **Ojos y Visión (SANS):** Edema papilar por desplazamiento cefálico de fluidos y dilatación de vaina del nervio óptico.
  - **Sistema Cardiovascular:** Frecuencia cardíaca, arritmias, presión arterial y desacondicionamiento miocárdico.
  - **Sistema Pulmonar:** Saturación $SpO_2$, frecuencia respiratoria y respuesta a $CO_2$.
  - **Metabolismo & Digestión:** Nivel de glucosa en sangre en mg/dL y absorción intestinal.
  - **Sistema Musculoesquelético:** Resorción ósea (osteopenia de microgravedad) y atrofia de cuádriceps/columna.
  - **Sistema Inmunitario & Piel:** Radiación acumulada, recuento leucocitario y dermatitis de escafandra.
- Al seleccionar cualquier región, el sistema muestra:
  - Lecturas en tiempo real con codificación de colores semántica.
  - Función anatómica normal.
  - Impacto específico del riesgo espacial (NASA RIDGE).
  - Síntomas tempranos de alarma a vigilar.
  - Contramedida clínica inmediata con botón para ejecutar el protocolo.

### 2. 📋 Autoevaluación de Salud y Laboratorio de Bio-Imágenes (`MOD-03`)
- Permite al astronauta introducir activamente sus propios datos mediante teclado, sliders, clics o imágenes:
  - **Presión Arterial:** Sistólica y Diastólica (mmHg) con clasificación automática (Óptima, Prehipertensión espacial, Hipertensión Grado 1/2).
  - **Glucosa en Sangre:** Nivel en mg/dL con contexto (Ayuno, 2h post-comida, post-ejercicio).
  - **Horas y Calidad de Sueño:** Horas de descanso (3h a 11h), calificación por estrellas y despertares.
  - **Salud Mental y Confinamiento:** Escala psicométrica de estado de ánimo (Óptimo, Calmo, Fatigado, Confinado/Aislado) y nivel subjetivo de estrés (0 a 100%).
  - **Laboratorio de Ultrasonido Espacial:**
    - Presets de escaneo: Vaina del Nervio Óptico (ONSD para SANS), Ecografía de Cuádriceps (monitoreo de masa muscular) y Ecografía Pulmonar (detección de líneas B).
    - Carga de imágenes reales o captura con cámara médica de a bordo.
    - Calipers interactivos milimétricos y análisis automatizado asistido por IA para determinar riesgo en segundos.
  - **Informe Clínico & Plan de Acción Holístico:** Puntuación global *AeroHealth* (0-100), diagnóstico sintetizado en lenguaje claro y plan de tratamiento paso a paso.

### 3. 📈 Telemetría y Electrocardiograma Lead II (`MOD-04`)
- Adquisición continua en tiempo real de constantes vitales.
- Osciloscopio interactivo de **ECG Lead II** con trazado dinámico y generador de sonido acústico sístole/alarma.
- **Gráficos temporales avanzados** con interpolación suave cúbica de Bézier para todos los indicadores:
  - Frecuencia Cardíaca (bpm)
  - Presión Sistólica (mmHg)
  - Saturación $SpO_2$ (%)
  - Temperatura Central (°C)
  - Frecuencia Respiratoria (rpm)
  - Glucosa en Sangre (mg/dL)
  - Horas de Sueño (h)
  - Nivel de Estrés (%)
- Banda verde de rango seguro normal y marcadores de anomalía.

### 4. 🎮 AeroQuest: Gamificación de Salud y Rutinas de Misión (`MOD-05`)
- Diseñado para incentivar y motivar a los astronautas a cumplir con los exigentes protocolos de salud diaria en confinamiento:
  - **Bio-Créditos (AstroHealth Points):** Puntos ganados por completar entrenamientos y registros médicos.
  - **Rango Biomédico:** Nivel progresivo de preparación física (Cadete -> Especialista -> Comandante Biomédico).
  - **Racha de Salud Activa (Health Streak):** Contador de días consecutivos cumpliendo los objetivos.
  - **Cronograma de Tareas Programadas:** Checklists con avisos a lo largo del día:
    - *07:00* - Chequeo matutino de glucosa y presión arterial (+50 pts).
    - *09:30* - Entrenamiento resistivo ARED de 120 min para mitigar osteopenia (+150 pts).
    - *12:30* - Hidratación isotónica y suplementación de calcio (+40 pts).
    - *15:30* - Ecografía ocular ONSD para vigilancia de SANS (+100 pts).
    - *18:00* - Sesión mindfulness en realidad virtual contra el estrés del aislamiento (+80 pts).
    - *21:30* - Ajuste circadiano de iluminación de cabina y descanso (+50 pts).
  - **Insignias y Medallas Espaciales Desbloqueables:** *Guardián Óseo*, *Zen Orbital*, *Metabolismo de Marte*, *Visión Artemis*, *Escudo de Radiación* y *Comandante Autónomo*.

### 5. 📖 Manual Médico de Vuelo Artemis & Guía de los 5 Riesgos NASA (`MOD-06`)
- Explicaciones simples y accesibles redactadas para los astronautas:
  - Fichas pedagógicas completas de los 5 Riesgos del HRP (RIDGE): por qué ocurren, qué órganos dañan, cómo medirlos y qué contramedidas ejecutar.
  - Guías sencillas: cómo tomar la presión arterial en ingravidez, cómo recolectar glucosa sin gotas flotantes, cómo hacer una ecografía ocular guiada y cómo mantener la higiene del sueño.
  - **Árbol de Decisión frente a la Latencia de 14 a 22 minutos:** Matriz de severidad para saber cuándo actuar autónomamente con el botiquín de la nave y cuándo emitir un paquete prioritario a Houston.

### 6. 🪐 Simulador de Misión y Selector Multi-Entorno (`MOD-07`)
- Permite evaluar la salud del astronauta en **4 entornos espaciales diferentes**:
  1. 🚀 **Nave en Tránsito Interplanetario (Deep Space Transport):** $0.00g$, alta radiación ($1.8\,\text{mSv/día}$), retardo de 14.5 min con Tierra, confinamiento extremo.
  2. 🛰️ **Estación Espacial Orbital (Gateway / ISS):** $0.00g$, órbita protegida ($0.5\,\text{mSv/día}$), retardo de 1.3 s (telemedicina asistida).
  3. 🚜 **Vehículo Explorador Presurizado (Rover Marciano):** $0.38g$, fatiga física por trajes EVA, toxicología de regolito, cabina biplaza.
  4. 🪐 **Base Superficial Planetaria (Artemis Base Camp / Mars Hab):** $0.38g$, hábitat protegido con regolito ($0.36\,\text{mSv/día}$), rutinas de estancia prolongada (>500 días).
- Inyección de anomalías fisiológicas instantáneas: Despresurización / Hipoxia, Estrés Térmico (fallo LCVG), Taquicardia y Ciclo de Sueño.

### 7. 🛡️ Alertas Clínicas y Contramedidas Operativas (`MOD-08`)
- Catálogo de 9 protocolos de contingencia médica detallados paso a paso con árbol de decisión de causas raíz y soluciones protocolizadas.
- Botón de estabilización inmediata y ejecución de contramedidas en vuelo.

### 8. 💾 Contrato de Integración JSON y Diccionario Médico (`MOD-09`)
- Visor interactivo del paquete de telemetría normalizado según el contrato de datos interoperable.
- Opciones de copia al portapapeles y descarga de archivo JSON para auditoría y archivo en tierra.
- Diccionario médico completo con las 10 variables biomédicas, sus unidades, rangos normales, umbrales de alerta e impacto espacial.

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** v24 recomendado para el backend (usa `node:sqlite` nativo). El
  frontend funciona desde v18.
- **npm**.

### Pasos de Instalación

1. Clonar el repositorio y acceder al directorio del proyecto:
   ```bash
   cd NSA
   ```

2. Instalar dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Iniciar la API REST + SQLite (crea `backend/data/aerohealth.db`):
   ```bash
   cd ../backend
   npm start
   ```

4. En otra terminal, iniciar la consola Vite:
   ```bash
   cd frontend
   npm run dev
   ```

5. Abrir `http://localhost:3000`. El Header mostrará **API · SQLite** cuando la
   persistencia esté conectada.

*(En Windows también puede ejecutarse `iniciar_frontend.bat`, que levanta API y
frontend juntos, o `iniciar_backend.bat` para solo la API).*

### API y base de datos

- API REST documentada: [`backend/README.md`](backend/README.md).
- SQLite se crea y migra automáticamente; la semilla incluye tres tripulantes.
- Si existían datos de la versión anterior en `localStorage`, se importan una
  sola vez a SQLite.
- Para producción: `cd frontend && npm run build` y luego `cd backend && npm start`
  sirve la consola y la API en `http://127.0.0.1:4000`.
- Pruebas del backend: `cd backend && npm test`.

---

## 📊 Diccionario de Datos Resumido

| Indicador | Símbolo | Unidad | Rango Nominal | Umbral de Alerta | Riesgo NASA Asociado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frecuencia Cardíaca** | HR | bpm | 60 – 100 | > 120 o < 50 | G — Desacondicionamiento miocárdico en 0g |
| **Presión Arterial** | PA | mmHg | 100–120 / 60–80 | > 140/90 o < 90/60 | G — Desplazamiento cefálico de 2L de sangre |
| **Glucosa en Sangre** | GLUC | mg/dL | 70 – 110 | > 140 o < 65 | G / E — Resistencia a insulina y metabolismo |
| **Saturación de Oxígeno** | SpO2 | % | 95 – 100 | < 90 | E — Despresurización o fallo de escafandra |
| **Temperatura Corporal** | TEMP | °C | 36.1 – 37.2 | > 38.0 | E — Fallo del refrigerante LCVG o infección |
| **Frecuencia Respiratoria** | RR | rpm | 12 – 20 | > 24 | E — Acumulación de CO2 (hipercapnia) |
| **Horas de Sueño** | SLEEP | h | 7.0 – 8.5 | < 6.0 | I — Desincronización circadiana (16 amaneceres/día) |
| **Estrés y Salud Mental** | STRESS | % | 0 – 35 | > 65 | I / D — Aislamiento extremo y confinamiento |
| **Ultrasonido Ocular** | ONSD | mm | 4.5 – 5.4 | > 5.8 | G — Síndrome Neuro-Ocular SANS (edema papilar) |
| **Pérdida Ósea Mensual** | BMD | %/mes | < 0.35 | > 0.90 | G — Osteopenia por falta de carga mecánica |

---

## 📄 Licencia y Reconocimientos

Desarrollado para el **NASA International Space Apps Challenge**. Basado en los estándares y publicaciones científicas del **NASA Human Research Program (HRP)** y las directrices de medicina espacial de la misión Artemis.
