# Arquitectura del Sistema

## Flujo de Datos
Investigación -> Motor de Simulación -> Backend -> Base de Datos -> Frontend

## Contrato de Integración (JSON)
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
