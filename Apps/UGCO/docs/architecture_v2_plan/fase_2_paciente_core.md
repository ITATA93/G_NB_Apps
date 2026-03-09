# FASE 2: Capa Maestra (Paciente + Caso Oncológico + GES)

## 1. Justificación Arquitectónica

El diseño previo cometía el error de mezclar la identidad del paciente con los datos del cáncer. Un mismo paciente puede tener **más de un cáncer primario** (Ej: Pulmón + Próstata). Además, el diseño técnico preexistente (`DISEÑO-TECNICO-NOCOBASE.md`) ya separaba correctamente `alma_paciente` de `ugco_casooncologico`, y debemos respetar esa decisión de diseño válida.

**Regla de Oro**: Un Paciente tiene UN registro. Un Caso Oncológico tiene UN registro por cáncer primario.

---

## 2. Colecciones

### 2.1 `ugco_pacientes` (Identidad Pura)

Datos demográficos del ser humano. **No contiene información oncológica.**

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `rut` | String | Unique, Required | Llave natural |
| `pasaporte_otro` | String | Nullable | Para pacientes extranjeros sin RUT |
| `nombres` | String | Required | — |
| `apellido_paterno` | String | Required | — |
| `apellido_materno` | String | Nullable | — |
| `fecha_nacimiento` | Date | Required | Para cálculo dinámico de edad |
| `sexo_biologico` | Enum | Required | M, F, Otro (Estándar MINSAL) |
| `nacionalidad` | String | Nullable | — |
| `comuna_residencia` | String | Nullable | — |
| `telefono_contacto` | String | Nullable | Para gestión de enfermería |
| `correo` | String | Nullable | — |
| `pueblo_originario` | String | Nullable | Variable MPI requerida |
| `prevision` | Enum | Nullable | FONASA_A, FONASA_B, FONASA_C, FONASA_D, ISAPRE, Otro |
| `created_at` | Datetime | Auto | Auditoría |
| `updated_at` | Datetime | Auto | Auditoría |
| `created_by` | BelongsTo → `users` | Auto | Auditoría |
| `updated_by` | BelongsTo → `users` | Auto | Auditoría |

> [!NOTE]
> NocoBase genera automáticamente `createdAt`, `updatedAt`, `createdBy`, `updatedBy` si se habilita en la configuración de la colección. Se documenta aquí explícitamente para que no se omita en la implementación.

### 2.2 `ugco_casos` (El Problema Oncológico)

Cada fila es un cáncer primario diagnosticado. Un paciente con 2 cánceres tiene 2 filas aquí.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| **Relaciones** | | | |
| `paciente_id` | BelongsTo → `ugco_pacientes` | Required | El ser humano |
| `especialidad_id` | BelongsTo → `ugco_cat_especialidades` | Required | Tórax, Digestivo, etc. |
| **Trazabilidad Institucional** | | | |
| `fecha_ingreso_ugco` | Date | Required | Cuándo se pesquisó en la unidad |
| `origen_sospecha` | Enum | Required | Derivacion_APS, Urgencia, Hallazgo_Incidental, Traslado_Extra |
| **Diagnóstico RHC** | | | |
| `fecha_confirmacion_dx` | Date | Nullable | Cuándo se tuvo certeza |
| `base_diagnostica` | Enum | Nullable | Histologia_Primario, Citologia, Clinico, Imagenologia, Marcadores |
| `cod_topografia_cie_o` | String | Nullable | Sitio anatómico (Ej: C34.9) |
| `cod_morfologia_cie_o` | String | Nullable | Tipo celular (Ej: 8500/3) |
| `comportamiento` | Enum | Nullable | Benigno_0, Incierto_1, InSitu_2, Maligno_3, Metastasico_6 |
| `lateralidad` | Enum | Nullable | Derecha, Izquierda, Bilateral, No_Aplica |
| `grado_diferenciacion` | Enum | Nullable | G1, G2, G3, G4, GX |
| **Estadificación TNM (Snapshot Actual)** | | | |
| `clase_tnm` | Enum | Nullable | cTNM, pTNM, ypTNM |
| `tnm_t` | String | Nullable | T1c, T2, T3, etc. |
| `tnm_n` | String | Nullable | N0, N1, N2, etc. |
| `tnm_m` | String | Nullable | M0, M1, M1a, etc. |
| `etapa_clinica` | Enum | Nullable | 0, I, IA, IB, II, IIA, IIB, III, IIIA, IIIB, IV, IVA, IVB, Oculta, NA |
| **Estado Dinámico (State Machine)** | | | |
| `estado_viaje` | Enum | Default: Sospecha | Sospecha_Estudio, Pendiente_Comite, Tto_Activo_Curativo, Tto_Activo_Paliativo, Seguimiento_Clinico, Egresado |
| `fecha_egreso` | Date | Nullable | — |
| `causa_egreso` | Enum | Nullable | Alta_Curado, Alta_Administrativa, Traslado, Fallecimiento, Abandono |
| `fecha_defuncion` | Date | Nullable | Si aplica |

> [!IMPORTANT]
> **Re-estadificación**: El TNM en esta tabla es un "snapshot actual". Cuando un paciente es re-estadificado (Ej: Post-cirugía, el cTNM pasa a pTNM), el cambio se registra como un **Evento** en `ugco_eventos` con `tipo_evento` = `RE_ESTADIFICACION` y el payload JSON contiene el TNM anterior y el nuevo. Un Workflow actualiza el snapshot de `ugco_casos`. Nunca se pierde el TNM original.

### 2.3 `ugco_garantias_ges` (GES Multi-Garantía)

Un paciente GES puede tener múltiples garantías activas simultáneamente (Diagnóstico, Tratamiento, Seguimiento), cada una con su propio plazo legal.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `caso_id` | BelongsTo → `ugco_casos` | Required | — |
| `tipo_garantia` | Enum | Required | Sospecha_Confirmacion, Tratamiento, Seguimiento |
| `problema_salud_ges` | String | Required | "Cáncer de Pulmón", "Linfoma" |
| `fecha_notificacion` | Date | Required | Cuando se activó la garantía |
| `fecha_vencimiento` | Date | Required | Plazo legal límite |
| `estado_garantia` | Enum | Default: Vigente | Vigente, Cumplida, Incumplida |
| `dias_restantes` | Formula | Calculado | `fecha_vencimiento - NOW()` |

---

## 3. Diagrama de Relaciones (Fase 2)

```
ugco_pacientes (1) ──────< (M) ugco_casos
                                    │
                                    ├──< (M) ugco_garantias_ges
                                    ├──< (M) ugco_eventos        [Fase 3]
                                    ├──< (M) ugco_tareas         [Fase 4]
                                    └──< (M) ugco_comite_presentaciones [Fase 1]
```

## 4. Beneficios

- **Multi-cáncer primario**: Un paciente con Pulmón + Próstata tiene 1 registro en `ugco_pacientes` y 2 registros en `ugco_casos`.
- **GES real**: Múltiples garantías con semáforos independientes.
- **Re-estadificación trazable**: Nunca se sobrescribe un TNM sin dejar huella en la línea de tiempo.
- **Auditoría automática**: Campos `created_at/by` y `updated_at/by` habilitados en todas las colecciones.
