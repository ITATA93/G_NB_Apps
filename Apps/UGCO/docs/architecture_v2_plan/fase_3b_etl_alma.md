# FASE 3B: Capa de Integración ALMA (Read-Only ETL)

## 1. Justificación Arquitectónica

La Fase 3 define la estructura de `ugco_eventos`. Esta Fase 3B define **cómo se pueblan esos eventos desde el RCE (TrakCare/ALMA)** y, críticamente, **qué datos NO están disponibles en ALMA** y por lo tanto deben ser ingresados manualmente en NocoBase.

El flujo es estrictamente **Unidireccional y de Solo Lectura**: extraemos datos de la base InterSystems IRIS (ALMA) y los insertamos en NocoBase. Jamás escribimos de vuelta.

---

## 2. Matriz de Disponibilidad de Datos (ALMA vs Manual)

> [!CAUTION]
> **Realidad Operativa del Hospital de Ovalle**: Muchos procesos clínicos oncológicos **aún no se registran en ALMA**. NocoBase será el registro primario para esos procesos. El ETL solo cubre un subconjunto de datos.

### ✅ Datos EXTRAÍBLES desde ALMA (ETL Automático)

| Dato | Tabla ALMA | Tipo Evento UGCO | Notas |
|------|-----------|------------------|-------|
| Datos demográficos del paciente | `PA_Patient` | Pobla `ugco_pacientes` | RUT, nombre, fecha nacimiento, sexo, comuna |
| Episodios ambulatorios (atenciones) | `PA_Episode` | `CONTROL_MEDICO` | Fecha, médico, servicio |
| Hospitalizaciones | `PA_Adm` | `HOSPITALIZACION` | Ingreso, alta, servicio |
| Diagnósticos registrados (CIE-10) | `MR_Diagnos` | `CONFIRMACION_DX` | Código CIE-10, fecha |
| Resultados de laboratorio | `LB_Episode` → `LB_TestSet` → `LB_TestSetItem` | `RESULTADO_LAB` | Hemogramas, marcadores tumorales |
| Medicamentos dispensados | `ARC_ItmMast` + `PHC_DrgForm` | `FARMACO_DISPENSADO` | Si aplica QT ambulatoria |

### ❌ Datos NO disponibles en ALMA (Ingreso Manual en NocoBase)

| Dato | Por qué no está en ALMA | Cómo se registra en UGCO |
|------|------------------------|--------------------------|
| **Biopsias y resultados de anatomía patológica** | Proceso externo, no digitalizado en ALMA | Evento manual: `BIOPSIA_SOLICITUD`, `BIOPSIA_RESULTADO`. Enfermera o médico ingresa en NocoBase. |
| **Resultados de exámenes externos** | Provienen de labs privados o extrasistema | Evento manual con archivo adjunto (PDF) |
| **Comités Oncológicos** | Proceso propio de UGCO, no existe en ALMA | Colección propia `ugco_comite_sesiones` + `ugco_comite_presentaciones`. Workflow genera el evento en la timeline. |
| **Notificación GES** (si el paciente está notificado, problema de salud GES, etapa) | No implementado en ALMA para oncología | Colección `ugco_garantias_ges`. Ingreso manual por Enfermera Navegadora. |
| **IPD** (Informe de Presupuesto y Derivación) | Proceso administrativo externo | Campo o evento manual en NocoBase |
| **Indicación de Cirugía / Solicitud de Pabellón** | Aún no implementado en ALMA | Evento manual: `SOLICITUD_CIRUGIA`. Relación potencial con módulo SGQ si existe. |
| **Resultado de EDA** (Endoscopía Digestiva Alta) | No se registra resultado en ALMA | Evento manual: `RESULTADO_EDA`. Médico o enfermera ingresa resumen y adjunta informe. |
| **Estadificación TNM** | No se maneja en ALMA | Campo en `ugco_casos`. Re-estadificación como evento. |
| **Estado del viaje del paciente** | Concepto propio de UGCO | Campo automático/manual en `ugco_casos` |

---

## 3. Arquitectura del ETL (Solo para datos disponibles)

```
┌──────────────────┐       SQL Query        ┌──────────────────┐
│   InterSystems    │ ──────────────────────> │  Script ETL      │
│   IRIS (ALMA)     │   (Read-Only, ODBC)    │  (TypeScript/tsx) │
│                   │                         │                   │
│  PA_Patient       │                         │  1. Extraer       │
│  PA_Episode       │                         │  2. Transformar   │
│  PA_Adm           │                         │  3. De-duplicar   │
│  MR_Diagnos       │                         │  4. Insertar      │
│  LB_Episode       │                         │                   │
└──────────────────┘                         └────────┬──────────┘
                                                      │ POST /api/ugco_eventos:create
                                                      ▼
                                             ┌──────────────────┐
                                             │   NocoBase API    │
                                             │   (ugco_eventos)  │
                                             └──────────────────┘
```

### 3.1 Frecuencia y Ejecución

| Parámetro | Valor |
|-----------|-------|
| Frecuencia | Diaria (02:00 AM) o Bajo Demanda |
| Ventana temporal | Últimas 48 horas |
| De-duplicación | `id_episodio_rce` + `tipo_evento_id` |
| Herramienta | `npx tsx shared/scripts/etl-alma-ugco.ts` |
| Conexión | ODBC a InterSystems IRIS |

### 3.2 Manejo de Errores

- Si el paciente no existe en UGCO, el ETL lo **crea** en `ugco_pacientes` pero **NO crea** un caso oncológico (requiere clasificación humana).
- Eventos que no puedan ser insertados se loguean en `tmp/etl_errors.log`.

---

## 4. Impacto en la Experiencia de Usuario

Dado que la **mayoría de los procesos oncológicos críticos se ingresan manualmente**, el diseño de UI (Fase 5) cobra aún más importancia:

- El botón **"+ Registrar Evento"** en la Ficha 360 del Paciente se convierte en la herramienta principal de trabajo.
- Los formularios de ingreso de eventos deben ser **rápidos y adaptativos**: al seleccionar el tipo de evento (Biopsia, EDA, Comité), el formulario muestra solo los campos relevantes.
- Los eventos importados desde ALMA aparecen en la timeline con una etiqueta visual distinta (`origen_dato: ETL_ALMA`) para que el usuario sepa que fue automático.

---

## 5. Seguridad

- El ETL **nunca ejecuta** DELETE, UPDATE ni TRUNCATE contra ALMA.
- Las credenciales ODBC están en `.env` (nunca en código).
- El script solo tiene permisos SELECT sobre las tablas de ALMA.
