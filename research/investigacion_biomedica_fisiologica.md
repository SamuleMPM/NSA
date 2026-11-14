# Equipo 1: Ciencias e Investigación
## Entregable Integrante 1: Investigación Biomédica y Fisiológica Aeroespacial

---

## 1. Introducción y Marco Teórico

El monitoreo de la salud humana en entornos aeroespaciales requiere comprender cómo las condiciones extremas alteran la homeostasis fisiológica. En misiones espaciales (órbita baja terrestre - LEO, estaciones orbitales, misiones lunares Artemis y futuras misiones tripuladas a Marte), los astronautas están expuestos a un conjunto único de factores estresores ambientales:

1. **Microgravedad (\(0\ g\)) y Gravedad Parcial** (Lunar: \(0.166\ g\), Marte: \(0.38\ g\)).
2. **Radiación Ionizante** (Radiación Cósmica Galáctica - GCR y Eventos de Partículas Solares - SPE).
3. **Ambiente Confinado y Aislado** (Atmósferas artificiales, presión reducida, hipercapnia relativa).
4. **Disrupción de Ritmos Circadianos** (16 amaneceres/puestas de sol cada 24 horas en LEO).
5. **Cargas de Trabajo Físico y Cognitivo Extremas** (Actividades Extravehiculares - EVA, protocolos de ejercicio diario obligatorio).

Dado que esta plataforma opera **exclusivamente mediante simulación computacional (datos sintéticos)** sin adquisición de sensores físicos directos, la investigación biomédica debe proveer:
- La caracterización fisiopatológica de cada sistema del cuerpo humano en el espacio.
- Rangos clínicos basales, de esfuerzo y de riesgo vital.
- Modelos matemáticos dinámicos y algoritmos de transferencia para el **Motor de Simulación (Equipo 2)**.
- El contrato de variables fisiológicas y biomarcadores para la telemetría y el dashboard del **Frontend (Equipo 3)**.

---

## 2. Fisiopatología por Sistemas en el Entorno Espacial

### 2.1. Sistema Cardiovascular y Hemodinámica

#### Mecanismos Principales
* **Desplazamiento Cefálico de Fluidos (*Cephalic Fluid Shift*):**
  Al eliminarse la columna hidrostática por gravedad, entre 1.5 y 2.0 litros de líquido intravascular e intersticial migran desde las extremidades inferiores hacia el tórax, cuello y cabeza ("síndrome de piernas de pájaro y cara de luna llena").
* **Respuesta de Volumen y Reflejo de Gauer-Henry:**
  El estiramiento de los barorreceptores auriculares centrales simula una hipervolemia, desencadenando inhibición de la hormona antidiurética (ADH/Vasopresina) y del sistema Renina-Angiotensina-Aldosterona (RAAS), incrementando el péptido natriurético auricular (ANP). Esto provoca diuresis y natriuresis en las primeras 24-72 horas, reduciendo el volumen plasmático total entre un 10% y un 20%.
* **Remodelado Cardíaco y Atrofia Miocárdica:**
  Al no tener que vencer la fuerza de gravedad para el retorno venoso, disminuye la poscarga sistémica y el trabajo miocárdico general. En misiones de larga duración (>30 días), esto induce una pérdida de masa ventricular izquierda de hasta un 8-10% si no se implementan contramedidas ergométricas.
* **Intolerancia Ortostática:**
  Al regresar a un pozo gravitatorio (1 g en la Tierra, o 0.38 g en Marte), el cuerpo sufre una rápida acumulación de sangre en las extremidades inferiores (*venous pooling*), taquicardia refleja y caída abrupta de la presión arterial sistémica (hipotensión ortostática), con riesgo crítico de presíncope/síncope.
* **Arritmogénesis Espacial:**
  Los cambios hemodinámicos, las alteraciones electrolíticas (pérdida de potasio y magnesio) y el tono autonómico alterado elevan la incidencia de extrasístoles ventriculares, prolongación del intervalo QTc y taquicardias supraventriculares, especialmente durante EVAs con estrés adrenérgico elevado.

---

### 2.2. Sistema Respiratorio y Dinámica Gasométrica

#### Mecanismos Principales
* **Mecánica Pulmonar en Microgravedad:**
  En microgravedad desaparece el gradiente gravitatorio pleural. La relación ventilación/perfusión (\(V/Q\)) se homogeniza parcialmente, pero la capacidad residual funcional (CRF) se reduce entre un 10% y 15% debido a la elevación cefálica del diafragma empujado por las vísceras abdominales.
* **Riesgo de Hipercapnia (\(CO_2\) elevado en hábitats cerrados):**
  Sin convección natural por gravedad, el aire exhalado por los astronautas forma bolsas locales ricas en \(CO_2\) alrededor de la cabeza ("burbujas de \(CO_2\)"), requiriendo constante ventilación forzada. Concentraciones ambientales de \(CO_2\) superiores al 0.5% (frente al ~0.04% terrestre) causan cefalea espacial, acidosis respiratoria leve, vasodilatación cerebral y aumento de la presión intracraneal.
* **Riesgo de Hipoxia y Despresurización:**
  En caso de fuga en el habitáculo o perforación por micrometeoritos, la presión barométrica (\(P_B\)) desciende. Si la presión parcial de oxígeno alveolar (\(P_A O_2\)) cae por debajo de 60 mmHg, la saturación arterial de oxígeno (\(SpO_2\)) cae en picado, provocando deterioro del tiempo de consciencia útil (TUC: *Time of Useful Consciousness*), taquipnea refleja, confusión cognitiva y arritmias terminales.

---

### 2.3. Termorregulación y Metabolismo Energético

#### Mecanismos Principales
* **Ausencia de Convección Natural y Evaporación Disminuida:**
  En la Tierra, el calor corporal se disipa por radiación, conducción, evaporación del sudor y convección natural (el aire caliente asciende). En ingravidez no hay convección natural; el sudor no gotea ni fluye eficazmente, sino que forma una película líquida sobre la piel que entorpece la evaporación eficiente si no hay flujo de aire activo.
* **"Fiebre Espacial" (*Space Fever*):**
  Estudios de la ESA y NASA han demostrado que la temperatura corporal central (\(T_{core}\)) de los astronautas en reposo se incrementa gradualmente en ~1.0 °C durante los primeros 2 meses en el espacio, situando la temperatura basal en ~37.5 °C a 38.0 °C. Este fenómeno se atribuye a una inflamación sistémica de bajo grado, estrés circadiano y menor eficiencia en la disipación térmica.
* **Gasto Energético en Actividad Extravehicular (EVA):**
  Los trajes espaciales (EMU / xEMU) funcionan como naves espaciales personales presurizadas a 4.3 psi (29.6 kPa) con 100% \(O_2\). Moverse dentro de un traje rígido presurizado exige un enorme trabajo metabólico contra la resistencia mecánica de las articulaciones del traje, demandando entre 200 y 500 kcal/hora, con picos de hasta 800 kcal/hora en tareas de alta exigencia motriz. El sistema de refrigeración por agua líquida (LCVG) del traje debe compensar esta carga para evitar golpe de calor (*heat stroke*).

---

### 2.4. Sistema Musculoesquelético y Metabolismo Óseo

#### Mecanismos Principales
* **Desmineralización Ósea Acelerada:**
  La ausencia de carga mecánica sobre los huesos largos y el esqueleto axial desregula el balance entre osteoblastos y osteoclastos. Los astronautas pierden entre 1.0% y 1.5% de densidad mineral ósea (DMO) por mes en fémur, pelvis y vértebras lumbares (equivalente a 10-15 veces la tasa de osteoporosis postmenopáusica severa).
* **Hipercalciuria y Litiasis Renal:**
  El calcio liberado del hueso satura el torrente sanguíneo y se excreta por vía renal. Junto con la deshidratación relativa y el pH urinario modificado, el riesgo de nefrolitiasis (cálculos de oxalato o fosfato de calcio) aumenta significativamente, constituyendo una emergencia urológica grave en el espacio.
* **Atrofia Muscular (Sarcopenia Espacial):**
  Pérdida preferencial de miofibrillas lentas (tipo I, posturales/antigravitatorias en sóleo y gastrocnemio). En 180 días sin ejercicio correctivo, la masa muscular puede reducirse hasta un 20% y la fuerza máxima hasta un 30-40%.

---

### 2.5. Sistema Neurovestibular y Sensoriomotor

#### Mecanismos Principales
* **Síndrome de Adaptación al Espacio (SAS / *Space Adaptation Syndrome*):**
  Afecta a entre el 60% y el 80% de los astronautas durante las primeras 48 a 72 horas. Se produce por un conflicto sensorial agudo entre las señales de los otolitos vestibulares (que ya no detectan aceleración gravitatoria constante), los canales semicirculares (que sí detectan aceleraciones angulares de la cabeza), el sistema visual y los propioceptores somatosensoriales.
* **Sintomatología:**
  Náuseas, emesis, cefalea frontal, mareo, desorientación espacial, letargia y sudores fríos. Requiere administración profiláctica de fármacos (e.g., prometazina) y restricción de movimientos bruscos de cabeza.

---

### 2.6. Hematología e Inmunología ("Anemia Espacial")

#### Mecanismos Principales
* **Hemólisis Inducida por Microgravedad:**
  Investigaciones recientes (Trudel et al., 2022) demostraron que el organismo en el espacio destruye aproximadamente un 54% más de glóbulos rojos que en la Tierra (~3 millones de eritrocitos/segundo destruidos vs. 2 millones en Tierra). Esto genera una anemia hemolítica persistente durante toda la estancia espacial. Al regresar a gravedad, los niveles de hemoglobina y hematocrito tardan entre 1 y 3 meses en recuperarse.
* **Desregulación Inmune y Reactivación Viral:**
  La microgravedad, el estrés crónico, el aislamiento y la radiación debilitan la respuesta de linfocitos T y células NK (*Natural Killer*). Se observa reactivación asintomática o leve de virus latentes de la familia Herpesviridae (Epstein-Barr, Varicela-Zóster, Citomegalovirus).

---

### 2.7. Radiobiología Espacial

#### Fuentes y Efectos
* **Radiación Cósmica Galáctica (GCR):** Iones pesados de alta energía (partículas HZE, como núcleos de Hierro \(^{56}Fe\)), altamente penetrantes y difíciles de blindar. Exposición continua de fondo (\(0.5 - 1.5\ mSv/día\) en espacio profundo).
* **Eventos de Partículas Solares (SPE):** Emisiones masivas de protones energéticos expulsados por eyecciones de masa coronal del Sol. Dosis agudas que pueden superar los \(500 - 1000\ mSv\) en pocas horas sin refugio de tormenta (*storm shelter*).
* **Efectos Clínicos:**
  - *Agudos (SPE sin blindaje):* Síndrome de radiación aguda (ARS): náuseas, vómitos, caída leucocitaria (linfopenia severa), daño endotelial.
  - *Crónicos / Estocásticos:* Riesgo elevado de carcinogénesis, cataratas inducidas por radiación en cristalino y daño al sistema nervioso central.
* **Límites de Dosis:**
  Límites recomendados por la NASA para carrera profesional: dosis efectiva acumulada máxima de \(600\ mSv\) (ajustada para mantener el riesgo atribuible de muerte por cáncer por debajo del 3% con un 95% de intervalo de confianza).

---

### 2.8. Psicofisiología, Estrés Autónomo y Ciclos Circadianos

* **Estrés y Tono Neurovegetativo:**
  La hiperactividad simpática sostenida reduce la Variabilidad de la Frecuencia Cardíaca (HRV). Índices temporales como el RMSSD (*Root Mean Square of Successive Differences*) y frecuencias espectrales (LF/HF ratio) sirven como biomarcadores matemáticos de fatiga psicofisiológica, estrés agudo y sobreentrenamiento.
* **Trastornos del Sueño:**
  En LEO, el ciclo solar de 90 minutos desincroniza los marcapasos circadianos endógenos (núcleo supraquiasmático). Los astronautas duermen en promedio entre 5.5 y 6.0 horas diarias, con fragmentación del sueño MOR y fases de onda lenta (NREM etapa 3), lo que incrementa el riesgo de error humano en maniobras críticas de vuelo o acoplamiento.

---

## 3. Catálogo de Variables Fisiológicas y Rangos Clínicos

Para permitir una monitorización estructurada y alimentar el **Diccionario de Datos** y el **Motor de Simulación**, se establecen las siguientes matrices de parámetros.

### 3.1. Signos Vitales Primarios

| Variable | Identificador JSON | Unidad | Reposo Nominal | Ejercicio / EVA | Alerta Amarilla (Warning) | Alerta Roja (Critical) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frecuencia Cardíaca** | `heart_rate` | bpm | \(60 - 85\) | \(90 - 160\) | \(< 50\) o \(121 - 150\) (en reposo) | \(< 40\) o \(> 160\) (en reposo) / \(> 185\) (en EVA) |
| **Presión Arterial Sistólica** | `blood_pressure_systolic` | mmHg | \(100 - 125\) | \(130 - 180\) | \(90 - 99\) o \(135 - 149\) | \(< 85\) o \(> 160\) (en reposo) |
| **Presión Arterial Diastólica** | `blood_pressure_diastolic`| mmHg | \(60 - 80\) | \(70 - 95\) | \(50 - 59\) o \(85 - 94\) | \(< 45\) o \(> 95\) |
| **Saturación de Oxígeno** | `spo2` | % | \(95 - 99\) | \(93 - 98\) | \(90 - 94\) | \(< 90\) (Hipoxia crítica) |
| **Frecuencia Respiratoria** | `respiration_rate` | rpm | \(12 - 18\) | \(20 - 35\) | \(8 - 11\) o \(21 - 25\) | \(< 8\) o \(> 28\) |
| **Temperatura Corporal Central** | `core_temperature` | °C | \(36.5 - 37.5\) | \(37.2 - 38.3\) | \(37.6 - 38.2\) (en reposo) | \(< 35.0\) (Hipotermia) o \(> 38.5\) (Hipertermia severa) |

---

### 3.2. Biomarcadores Avanzados y Métricas Especializadas

| Variable | Identificador JSON | Unidad | Nominal | Estrés / EVA | Warning | Critical |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HRV (RMSSD)** | `hrv_rmssd` | ms | \(35 - 75\) | \(15 - 30\) | \(15 - 24\) (en reposo) | \(< 15\) (Agotamiento autonómico severo) |
| **Presión \(CO_2\) Espirado** | `etco2` | mmHg | \(35 - 45\) | \(38 - 48\) | \(46 - 52\) (Hipercapnia leve) | \(> 53\) o \(< 25\) |
| **Consumo de Oxígeno (\(VO_2\))** | `vo2` | mL/kg/min | \(3.5 - 5.0\) | \(15.0 - 45.0\) | N/A | \(> 50.0\) (Agotamiento anaeróbico inminente) |
| **Tasa de Dosis de Radiación** | `radiation_rate` | \(\mu Sv/h\) | \(15 - 50\) | \(15 - 80\) | \(100 - 500\) (Alerta solar) | \(> 1000\) (\(> 1\ mSv/h\), SPE masivo) |
| **Dosis Acumulada de Misión** | `cumulative_radiation` | mSv | \(< 150\) | \(< 300\) | \(300 - 500\) | \(> 600\) (Límite ALARA superado) |
| **Índice de Tensión Fisiológica** | `psi_index` | Escala 0-10 | \(0.0 - 2.9\) | \(3.0 - 6.5\) | \(6.6 - 8.4\) (Alto estrés) | \(8.5 - 10.0\) (Riesgo inminente de colapso) |
| **Nivel de Hidratación** | `hydration_loss_pct`| % peso | \(< 1.0\%\) | \(1.0 - 2.5\%\) | \(2.6 - 4.0\%\) | \(> 4.0\%\) (Deshidratación crítica) |

---

## 4. Modelos Matemáticos para el Motor de Simulación (Equipo 2)

Para que el **Motor de Simulación** genere series temporales realistas de signos vitales sintéticos, no basta con números pseudoaleatorios estáticos. Se definen las ecuaciones diferenciales y modelos de respuesta dinámica a continuación.

### 4.1. Dinámica Cardiorrespiratoria ante Carga de Trabajo (Ejercicio / EVA)

La frecuencia cardíaca en función del tiempo \(HR(t)\) responde a la intensidad de trabajo físico o metabólico \(W(t)\) (en Watts o METs) según un modelo diferencial de primer orden con asimetría en fases de activación y recuperación:

$$\frac{d HR(t)}{dt} = \begin{cases} 
\frac{HR_{target}(W) - HR(t)}{\tau_{on}} & \text{si } HR_{target}(W) > HR(t) \quad (\text{ascenso}) \\
\frac{HR_{target}(W) - HR(t)}{\tau_{off}} & \text{si } HR_{target}(W) \le HR(t) \quad (\text{recuperación})
\end{cases}$$

Donde:
- \(HR_{rest}\): Frecuencia en reposo (ej. \(70\ bpm\)).
- \(HR_{max}\): Frecuencia cardíaca máxima estimada (\(HR_{max} = 220 - \text{edad}\)).
- \(HR_{target}(W) = HR_{rest} + (HR_{max} - HR_{rest}) \cdot \left(\frac{W}{W_{max}}\right)^{\gamma}\), con \(\gamma \approx 0.9 - 1.1\).
- Constantes de tiempo fisiológicas: \(\tau_{on} \approx 20 - 35\ s\), \(\tau_{off} \approx 45 - 75\ s\).

La **Frecuencia Respiratoria** \(RR(t)\) se acopla a la demanda metabólica y al gasto de \(CO_2\):
$$RR(t) = RR_{rest} + \kappa_{rr} \cdot (HR(t) - HR_{rest}) + \xi_{rr}(t)$$
donde \(\kappa_{rr} \approx 0.18 - 0.25\), y \(\xi_{rr}(t)\) representa ruido biológico respiratorio.

---

### 4.2. Dinámica de Desaturación de Oxígeno (\(SpO_2\)) en Eventos de Hipoxia

Cuando ocurre una caída en la fracción inspirada de oxígeno (\(FiO_2\)) o una despresurización de cabina:
1. La presión parcial alveolar de \(O_2\) (\(P_A O_2\)) disminuye:
   $$P_A O_2(t) = (P_B(t) - P_{H_2O}) \cdot FiO_2 - \frac{PaCO_2}{RER}$$
   donde \(P_B\) es la presión barométrica (nominal \(760\ mmHg\)), \(P_{H_2O} = 47\ mmHg\), y \(RER \approx 0.8\).

2. La saturación arterial estimada \(SaO_2\) (\(\approx SpO_2\)) se modela mediante la **ecuación de Hill para la curva de disociación oxihemoglobínica**:
   $$SpO_2(t) = \frac{(P_A O_2(t))^n}{(P_A O_2(t))^n + (P_{50})^n} \times 100\%$$
   donde \(n \approx 2.7\) (coeficiente de Hill) y \(P_{50} \approx 26.8\ mmHg\).

3. **Respuesta compensatoria autonómica a la hipoxia:**
   Si \(SpO_2(t) < 92\%\), se activa taquicardia refleja y taquipnea:
   $$\Delta HR_{hypoxia} = \alpha_{hyp} \cdot \max(0, 95 - SpO_2(t))^{1.5}$$

---

### 4.3. Dinámica de Hipercapnia (\(CO_2\) Elevado)

En caso de fallo en los cartuchos de hidróxido de litio (\(LiOH\)) o aminas regenerativas del soporte vital (ECLSS):
$$EtCO_2(t) = EtCO_2^{(0)} + \beta_{co2} \cdot \int_0^t [P_{env}CO_2(u) - P_{clearance}(u)] \, du$$
Efectos fisiológicos simulados:
- Si \(EtCO_2 > 45\ mmHg\): Elevación de la presión arterial sistólica (\(\Delta SBP = 1.2 \cdot (EtCO_2 - 45)\)).
- Si \(EtCO_2 > 50\ mmHg\): Cefalea, letargia y aumento de la frecuencia cardíaca refleja.

---

### 4.4. Índice de Tensión Fisiológica (Physiological Strain Index - PSI)

Implementación del estándar clínico de **Moran et al. (1998)** para evaluar de forma unificada el estrés térmico y cardiovascular en tiempo real:

$$PSI(t) = 5.0 \cdot \left(\frac{T_{core}(t) - T_{core,0}}{39.5 - T_{core,0}}\right) + 5.0 \cdot \left(\frac{HR(t) - HR_0}{180 - HR_0}\right)$$

*Interpretación en la plataforma:*
- \(0.0 - 2.9\): Tensión nula a leve (Estado nominal).
- \(3.0 - 4.9\): Tensión moderada (Esfuerzo sostenible).
- \(5.0 - 6.9\): Tensión alta (Monitorear fatiga, límite de EVA).
- \(7.0 - 8.4\): Tensión muy alta (Pausa obligatoria / abortar tarea).
- \(\ge 8.5\): Tensión crítica (Riesgo inminente de golpe de calor o fallo cardíaco).

---

### 4.5. Generación de Ruido Fisiológico y Variabilidad Sintética

Para evitar que las señales parezcan artificiales o rectilíneas, el motor debe superponer:
1. **Ruido Rosa (\(1/f\)):** Característico de la variabilidad biológica sana de la frecuencia cardíaca (HRV).
2. **Arritmias sinusales respiratorias (RSA):** Modulación de alta frecuencia (\(\sim 0.25\ Hz\)) del intervalo RR acoplada al ciclo respiratorio.
3. **Fluctuaciones ortostáticas/barorreflejas:** Ondas de Mayer de baja frecuencia (\(\sim 0.1\ Hz\)) en la presión arterial.

---

## 5. Escenarios de Simulación Biomédica para Validación

Se proponen 5 escenarios clínicos estandarizados que el **Equipo 2 (Simulación)** y el **Equipo 3 (Frontend)** deben admitir:

### Escenario A: Reposo Nominal en Microgravedad (\(0\ g\))
- Duración: Continuo.
- Estado general: Paciente adaptado (misión día > 5).
- Signos: HR \(65 \pm 5\ bpm\), BP \(115/75\ mmHg\), \(SpO_2\) \(98 \pm 1\%\), Temp \(37.4 \pm 0.2\ °C\), PSI \(1.2\).

### Escenario B: Actividad Extravehicular (EVA) de Alta Demanda
- Duración: 6 horas.
- Estado: Trabajo mecánico con guantes y herramientas presurizadas.
- Signos: HR \(125 - 155\ bpm\), BP \(145/85\ mmHg\), Temp \(37.9 - 38.3\ °C\), \(VO_2\) elevado, PSI oscilando entre \(5.5\) y \(7.2\).

### Escenario C: Despresurización / Hipoxia Accidental de Cabina
- Duración: 15 minutos (o hasta intervención de emergencia).
- Evento: Microfuga reduce presión de cabina.
- Signos: Caída progresiva de \(SpO_2\) de \(98\%\) a \(84\%\), taquicardia refleja compensatoria (HR asciende a \(135\ bpm\)), taquipnea (RR \(26\ rpm\)), seguida de bradicardia si no se restaura la presión.

### Escenario D: Falla de Depurador de \(CO_2\) (Hipercapnia)
- Duración: Acumulativa en 4 horas.
- Evento: Fallo de ventilación o saturación de filtros de hidróxido de litio.
- Signos: \(EtCO_2\) asciende a \(52\ mmHg\), cefalea reportada, elevación gradual de SBP a \(148\ mmHg\), HR levemente acelerado, somnolencia.

### Escenario E: Tormenta Solar (SPE - Solar Particle Event)
- Duración: 12 horas.
- Evento: Eyección coronal masiva detectada; astronauta fuera o en módulo con poco blindaje.
- Signos: Tasa de radiación salta de \(30\ \mu Sv/h\) a \(1200\ \mu Sv/h\). Dosis acumulada supera \(250\ mSv\). Náuseas iniciales, fatiga aguda, linfopenia en analítica simulada.

---

## 6. Esquema de Telemetría JSON Ampliado (Contrato de Integración)

Para cumplir con la arquitectura del sistema (`docs/ARCHITECTURE.md`) y brindar soporte completo a los biomarcadores identificados, se define la siguiente especificación de payload JSON:

```json
{
  "metadata": {
    "source": "simulation_engine_v1",
    "is_synthetic": true,
    "mission_id": "artemis_mars_001",
    "scenario": "eva_high_metabolic_workload",
    "environmental": {
      "gravity_g": 0.0,
      "cabin_pressure_kpa": 101.3,
      "ambient_co2_pct": 0.08,
      "ambient_radiation_rate_usv_h": 42.5
    }
  },
  "astronaut": {
    "id": "ast_001",
    "name": "Neil Armstrong",
    "role": "Mission Commander",
    "age": 38,
    "gender": "male",
    "baseline": {
      "resting_hr": 64,
      "resting_bp_sys": 118,
      "resting_bp_dia": 76,
      "max_hr": 182
    }
  },
  "vital_signs": {
    "timestamp": "2026-11-14T16:35:00Z",
    "heart_rate": {
      "value": 138,
      "unit": "bpm",
      "status": "warning"
    },
    "blood_pressure": {
      "systolic": 142,
      "diastolic": 86,
      "unit": "mmHg",
      "status": "normal"
    },
    "oxygen_saturation": {
      "value": 97.2,
      "unit": "%",
      "status": "normal"
    },
    "respiration_rate": {
      "value": 24,
      "unit": "rpm",
      "status": "warning"
    },
    "core_temperature": {
      "value": 37.95,
      "unit": "°C",
      "status": "warning"
    },
    "hrv_rmssd": {
      "value": 22.4,
      "unit": "ms",
      "status": "warning"
    },
    "end_tidal_co2": {
      "value": 41.2,
      "unit": "mmHg",
      "status": "normal"
    },
    "radiation": {
      "instantaneous_rate_usv_h": 42.5,
      "cumulative_mission_msv": 78.4,
      "status": "normal"
    },
    "derived_metrics": {
      "psi_index": {
        "value": 5.8,
        "interpretation": "high_strain",
        "status": "warning"
      },
      "hydration_loss_pct": {
        "value": 1.8,
        "unit": "%",
        "status": "normal"
      },
      "overall_triage_status": "WARNING"
    }
  }
}
```

---

## 7. Conclusiones y Próximos Pasos de Integración

1. **Equipo 1 (Integrante 2 - Escenarios de Misión):**
   - Utilizar esta caracterización biomédica para estructurar los escenarios de vuelo: inyección translunar, tránsito a Marte, aterrizaje en regolito y actividades extravehiculares de 8 horas.
2. **Equipo 2 (Integrante 3 y 4 - Backend y Motor de Simulación):**
   - Implementar los modelos diferenciales de \(HR(t)\), \(SpO_2(t)\), \(PSI\) y generadores de ruido rosa estocástico en Python o Node.js.
   - Indexar la estructura de telemetría expandida en la base de datos (Firestore / JSON).
3. **Equipo 3 (Integrante 5 y 6 - Frontend y Dashboard):**
   - Incorporar visualizaciones en tiempo real para:
     - Gráfica temporal multicanal (ECG sintetizado, HR, \(SpO_2\), \(T_{core}\)).
     - Indicador tipo aguja o barra para el Índice de Tensión Fisiológica (PSI).
     - Tarjetas de estado con código semáforo (*Nominal*, *Warning*, *Critical*).
     - Contador de dosimetría de radiación acumulada respecto al límite permisible de la misión.

---
*Documento elaborado como parte del proyecto Plataforma de Monitorización de Salud Aeroespacial y Simulador de Misiones (Investigación Biomédica y Fisiológica - Integrante 1).*
