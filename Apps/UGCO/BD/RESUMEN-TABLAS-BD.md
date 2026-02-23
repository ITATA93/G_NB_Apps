# Resumen de Tablas de Base de Datos - UGCO

**Generado automáticamente**: 2025-11-21

---

## 📊 Inventario de Tablas Definidas

Total de archivos `.md` encontrados en `C:\GIT\MIRA\UGCO\BD\`: **18 tablas**

---

## 🔵 Categorías de Tablas

### **1. Tablas de Referencia (REF_*)**
Catálogos/maestros con valores predefinidos

- `REF_OncoEspecialidad.md` - Especialidades oncológicas (Digestivo, Urología, Mama, etc.)
- `REF_OncoEstadoActividad.md` - Estados de actividades clínicas
- `REF_OncoEstadoAdm.md` - Estados administrativos
- `REF_OncoEstadoCaso.md` - Estados del caso oncológico
- `REF_OncoEstadoClinico.md` - Estados clínicos del paciente
- `REF_OncoIntencionTrat.md` - Intención de tratamiento (curativo, paliativo, etc.)
- `REF_OncoTipoActividad.md` - Tipos de actividades clínicas

**Total REF: 7 tablas**

---

### **2. Tablas Operacionales UGCO (UGCO_*)**
Datos transaccionales del sistema

- `UGCO_CasoOncologico.md` - **TABLA PRINCIPAL** - Caso oncológico por paciente
- `UGCO_CasoEspecialidad.md` - Relación caso → especialidades
- `UGCO_ComiteCaso.md` - Casos presentados en comité oncológico
- `UGCO_ComiteOncologico.md` - Sesiones de comité oncológico
- `UGCO_ContactoPaciente.md` - Contactos del paciente (teléfono, email, etc.)
- `UGCO_DocumentoCaso.md` - Documentos adjuntos al caso
- `UGCO_EquipoMiembro.md` - Miembros del equipo de seguimiento
- `UGCO_EquipoSeguimiento.md` - Equipos de seguimiento por especialidad
- `UGCO_EventoClinico.md` - Eventos clínicos del caso (cirugía, QT, RT, etc.)
- `UGCO_PersonaSignificativa.md` - Familiares/cuidadores del paciente
- `UGCO_Tarea.md` - Tareas/pendientes del caso

**Total UGCO: 11 tablas**

---

## 🎯 Identificación de Tablas para NocoBase

### ✅ **Tablas que SE DEBEN crear en NocoBase (instancia de prueba)**

Estas son las tablas operacionales de UGCO que se trabajarán activamente:

#### **Tablas REF (Catálogos)** - Crear primero
1. `REF_OncoEspecialidad` ← Necesaria para asignar casos
2. `REF_OncoEstadoCaso` ← Necesaria para estados de caso
3. `REF_OncoEstadoClinico` ← Necesaria para estados clínicos
4. `REF_OncoEstadoAdm` ← Necesaria para estados admin
5. `REF_OncoIntencionTrat` ← Necesaria para intención tratamiento
6. `REF_OncoTipoActividad` ← Necesaria para eventos clínicos
7. `REF_OncoEstadoActividad` ← Necesaria para eventos clínicos

#### **Tablas UGCO (Operacionales)** - Crear después
1. `UGCO_CasoOncologico` ← **TABLA PRINCIPAL** (crear primero)
2. `UGCO_CasoEspecialidad` ← Depende de CasoOncologico + REF_OncoEspecialidad
3. `UGCO_ContactoPaciente` ← Depende de CasoOncologico
4. `UGCO_PersonaSignificativa` ← Depende de CasoOncologico
5. `UGCO_EventoClinico` ← Depende de CasoOncologico
6. `UGCO_DocumentoCaso` ← Depende de CasoOncologico
7. `UGCO_Tarea` ← Depende de CasoOncologico
8. `UGCO_EquipoSeguimiento` ← Equipos de trabajo
9. `UGCO_EquipoMiembro` ← Depende de EquipoSeguimiento
10. `UGCO_ComiteOncologico` ← Sesiones de comité
11. `UGCO_ComiteCaso` ← Depende de ComiteOncologico + CasoOncologico

---

## ❌ **Tablas que NO crear ahora**

Estas tablas están en la carpeta pero **se usarán más adelante**:

### Archivos vacíos/auxiliares:
- `.Rhistory` ← Archivo de R Studio (ignorar)
- `lista.txt` ← Lista de archivos (ignorar)
- `UGCO_CasoOncologico.txt` ← Backup/borrador (ignorar)
- `UGCO_CasoOncologico_Diccionario.txt` ← Backup/borrador (ignorar)

---

## 🔄 Orden de Creación Recomendado

Para crear las tablas sin errores de foreign keys:

### **Fase 1: Tablas de Referencia (sin dependencias)**
```
1. REF_OncoEspecialidad
2. REF_OncoEstadoCaso
3. REF_OncoEstadoClinico
4. REF_OncoEstadoAdm
5. REF_OncoIntencionTrat
6. REF_OncoTipoActividad
7. REF_OncoEstadoActividad
```

### **Fase 2: Tabla Principal**
```
8. UGCO_CasoOncologico (depende de REF_*)
```

### **Fase 3: Tablas Secundarias (dependen de CasoOncologico)**
```
9.  UGCO_CasoEspecialidad
10. UGCO_ContactoPaciente
11. UGCO_PersonaSignificativa
12. UGCO_EventoClinico
13. UGCO_DocumentoCaso
14. UGCO_Tarea
```

### **Fase 4: Tablas de Equipo y Comité**
```
15. UGCO_EquipoSeguimiento
16. UGCO_EquipoMiembro (depende de EquipoSeguimiento)
17. UGCO_ComiteOncologico
18. UGCO_ComiteCaso (depende de ComiteOncologico + CasoOncologico)
```

---

## 📝 Notas Importantes

### **Sobre las tablas SQL de ALMA:**
- Las 8 tablas SQL ya conectadas (`PacientesData_`, `Admision_Pacientes`, etc.) son de **solo lectura**
- **NO están** en esta carpeta `BD/`
- Se usarán más adelante para **copiar/sincronizar** datos de pacientes

### **Sobre las referencias a ALMA en UGCO_CasoOncologico:**
```sql
paciente_id       INTEGER NOT NULL,  -- FK → alma_pacientes(id)
episodio_alma_id  INTEGER,           -- FK → alma_episodios(id)
diag_alma_id      INTEGER,           -- FK → alma_diagnosticos(id)
```

Estas foreign keys se configurarán **después** cuando:
1. Definas qué datos copiar de ALMA
2. Crees las tablas `alma_pacientes`, `alma_episodios`, `alma_diagnosticos` en NocoBase

Por ahora, estos campos se crearán como **integer simples** (sin FK).

---

## ✅ Resumen Ejecutivo

**Total tablas definidas**: 18
**Tablas REF (catálogos)**: 7
**Tablas UGCO (operacionales)**: 11
**Archivos ignorables**: 4

**Acción recomendada**:
- Crear las 18 tablas en NocoBase (instancia de prueba)
- Seguir el orden de creación para evitar errores de FK
- Probar funcionamiento
- Exportar configuración
- Importar a producción cuando esté listo

---

**Última actualización**: 2025-11-21
**Mantenido por**: Equipo UGCO
