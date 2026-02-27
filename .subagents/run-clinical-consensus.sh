#!/bin/bash
#
# run-clinical-consensus.sh - Clinical Expert Consensus Panel for Hospital Apps
# Executes a 5-turn MoE deliberation with clinical role overlays,
# passing each agent's output as context to the next.
#
# Usage:
#   ./run-clinical-consensus.sh "Descripcion de la necesidad clinica"
#
# Example:
#   ./run-clinical-consensus.sh "Necesitamos una app para gestion de farmacia hospitalaria"
#
# Output:
#   docs/temp/clinical-consensus-YYYYMMDD-HHmmss.md
#

set -e

# =============================================================================
# CONFIGURATION
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"
DISPATCH_SCRIPT="$SCRIPT_DIR/dispatch.sh"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="$WORKSPACE_ROOT/docs/temp"
OUTPUT_FILE="$OUTPUT_DIR/clinical-consensus-$TIMESTAMP.md"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# =============================================================================
# FUNCTIONS
# =============================================================================

log_info() { echo -e "${CYAN}[PANEL]${NC} $1"; }
log_turn() { echo -e "${MAGENTA}[TURNO $1]${NC} $2"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }

# =============================================================================
# CLINICAL ROLE PROMPTS
# =============================================================================

role_1_prompt() {
    cat << 'ROLE_EOF'
## Tu Rol: Analista de Necesidades Clinicas

Eres un analista senior de requerimientos clinicos hospitalarios. Tu trabajo es elaborar la necesidad clinica en detalle estructurado.

Debes cubrir:
1. **Usuarios**: Quienes usaran la app (medicos, enfermeras, tecnologos, administrativos) y sus roles especificos
2. **Contexto asistencial**: En que servicio/unidad se usa (urgencia, hospitalizacion, consulta, pabellon)
3. **Problema**: Que problema clinico resuelve o que flujo de trabajo manual reemplaza
4. **Volumetria**: Pacientes/dia, registros/turno, usuarios concurrentes estimados
5. **Restricciones**: Turnos (7x24?), conectividad (WiFi estable?), dispositivos (PC, tablet, movil)
6. **Integraciones**: Sistemas existentes que deben consultarse (ALMA, TrakCare, laboratorio)

Output: Documento de Necesidad Clinica estructurado con secciones claras.
ROLE_EOF
}

role_2_prompt() {
    cat << 'ROLE_EOF'
## Tu Rol: Medico Experto de Dominio

Eres un medico con experiencia en informatica clinica. Revisa el documento de necesidad clinica y valida:

1. **Precision clinica**: La terminologia es correcta? (CIE-10, SNOMED CT, CIE-O-3 si aplica)
2. **Flujos realistas**: Los flujos asistenciales descritos reflejan como realmente funciona un hospital? No idealizar.
3. **Seguridad del paciente**: Hay escenarios criticos? (errores de medicacion, identificacion incorrecta, alergias)
4. **Alertas necesarias**: Valores criticos, interacciones medicamentosas, alergias
5. **Campos obligatorios vs opcionales**: Segun el contexto clinico real
6. **Casos borde**: Urgencias, pacientes pediatricos, embarazadas, adultos mayores

Output: Validacion clinica con correcciones, advertencias de seguridad y campos criticos.
ROLE_EOF
}

role_3_prompt() {
    cat << 'ROLE_EOF'
## Tu Rol: Especialista en Informatica Medica

Eres un ingeniero en informatica biomedica. Revisa la necesidad y validacion clinica, evalua:

1. **Modelo de datos**: Entidad-relacion apropiado, normalizacion, tipos de datos
2. **Estandares de codificacion**: CIE-10, SNOMED CT, LOINC, HL7 FHIR si aplica
3. **Cumplimiento normativo**: Ley 20.584 (derechos del paciente), Ley 19.628 (datos personales)
4. **Interoperabilidad**: Integracion con ALMA/TrakCare (campos ZEN), APIs existentes
5. **Trazabilidad**: Auditoria de acciones clinicas, log de modificaciones
6. **Retencion de datos**: Politicas de respaldo y retencion de registros clinicos

Output: Evaluacion de informatica medica con modelo de datos propuesto y gaps normativos identificados.
ROLE_EOF
}

role_4_prompt() {
    cat << 'ROLE_EOF'
## Tu Rol: Evaluador de Usabilidad Clinica

Eres un experto en UX para entornos clinicos hospitalarios. Revisa todo lo anterior y evalua:

1. **Carga cognitiva**: Personal en turnos de 12h, bajo presion, multiples pacientes
2. **Targets tactiles**: Botones grandes para uso con guantes o en movimiento
3. **Contraste y legibilidad**: Ambientes con iluminacion variable, pantallas de distintos tamanos
4. **Prevencion de errores**: Confirmaciones en acciones criticas, sin eliminacion accidental
5. **Flujo minimo**: Menor cantidad de clicks para tareas frecuentes (80/20)
6. **Emergencias**: Acceso rapido sin navegacion profunda, modo urgencia
7. **Accesibilidad**: WCAG 2.1 AA minimo

Output: Evaluacion de usabilidad con recomendaciones UX y wireframes conceptuales (texto).
ROLE_EOF
}

role_5_prompt() {
    cat << 'ROLE_EOF'
## Tu Rol: Integrador Tecnico NocoBase

Eres un arquitecto de soluciones especializado en NocoBase para hospitales. Sintetiza TODOS los turnos anteriores en una especificacion implementable:

1. **Collections y fields**: Lista completa para app-spec/app.yaml
2. **Roles y permisos**: Mapeo a roles hospitalarios reales (medico, enfermera, admin, jefe servicio)
3. **Paginas UI**: Bloques NocoBase necesarios (tablas, formularios, detalles, kanban, calendario)
4. **Workflows**: Automatizaciones NocoBase (notificaciones, cambios de estado, validaciones)
5. **Integraciones**: Campos ZEN de ALMA/TrakCare, APIs externas
6. **Checklist DoD**: Definition of Done para la app

Output: Borrador de app-spec/app.yaml en formato YAML + documento de consenso final con resumen ejecutivo.
ROLE_EOF
}

# =============================================================================
# MAIN
# =============================================================================

if [ $# -lt 1 ]; then
    echo "Usage: $(basename "$0") \"Descripcion de la necesidad clinica\""
    exit 1
fi

CLINICAL_NEED="$1"

# Check dependencies
if ! command -v jq &> /dev/null; then
    log_error "jq is required. Install: apt install jq (Linux) or brew install jq (macOS)"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Initialize output file
cat > "$OUTPUT_FILE" << EOF
---
type: clinical-consensus
date: $(date +%Y-%m-%d)
timestamp: $TIMESTAMP
need: "$CLINICAL_NEED"
---
# Clinical Consensus Panel — $(date +%Y-%m-%d)

## Necesidad Clinica
$CLINICAL_NEED

---

EOF

log_info "=========================================="
log_info "  MESA DE CONSENSO CLINICO"
log_info "  5 expertos, ejecucion secuencial"
log_info "=========================================="
log_info "Necesidad: $CLINICAL_NEED"
log_info "Output: $OUTPUT_FILE"
echo ""

# Temporary files for inter-turn context
TURN_OUTPUT=$(mktemp)
ACCUMULATED_CONTEXT=""

# ─── TURNO 1: Analista de Necesidades Clinicas ───────────────────────────────

log_turn 1 "Analista de Necesidades Clinicas (researcher)"

TURN1_PROMPT="$(role_1_prompt)

---
## Necesidad clinica del usuario:
$CLINICAL_NEED"

"$DISPATCH_SCRIPT" researcher "$TURN1_PROMPT" > "$TURN_OUTPUT" 2>/dev/null
TURN1_RESULT=$(cat "$TURN_OUTPUT")
ACCUMULATED_CONTEXT="## Turno 1 — Analista de Necesidades Clinicas
$TURN1_RESULT"

echo "## Turno 1 — Analista de Necesidades Clinicas" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "$TURN1_RESULT" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

log_success "Turno 1 completado"
echo ""

# ─── TURNO 2: Medico Experto de Dominio ──────────────────────────────────────

log_turn 2 "Medico Experto de Dominio (code-analyst)"

TURN2_PROMPT="$(role_2_prompt)

---
## Contexto de turnos anteriores:
$ACCUMULATED_CONTEXT

---
## Necesidad clinica original:
$CLINICAL_NEED"

"$DISPATCH_SCRIPT" code-analyst "$TURN2_PROMPT" > "$TURN_OUTPUT" 2>/dev/null
TURN2_RESULT=$(cat "$TURN_OUTPUT")
ACCUMULATED_CONTEXT="$ACCUMULATED_CONTEXT

## Turno 2 — Medico Experto de Dominio
$TURN2_RESULT"

echo "## Turno 2 — Medico Experto de Dominio" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "$TURN2_RESULT" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

log_success "Turno 2 completado"
echo ""

# ─── TURNO 3: Especialista en Informatica Medica ─────────────────────────────

log_turn 3 "Especialista en Informatica Medica (db-analyst)"

TURN3_PROMPT="$(role_3_prompt)

---
## Contexto de turnos anteriores:
$ACCUMULATED_CONTEXT

---
## Necesidad clinica original:
$CLINICAL_NEED"

"$DISPATCH_SCRIPT" db-analyst "$TURN3_PROMPT" > "$TURN_OUTPUT" 2>/dev/null
TURN3_RESULT=$(cat "$TURN_OUTPUT")
ACCUMULATED_CONTEXT="$ACCUMULATED_CONTEXT

## Turno 3 — Especialista en Informatica Medica
$TURN3_RESULT"

echo "## Turno 3 — Especialista en Informatica Medica" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "$TURN3_RESULT" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

log_success "Turno 3 completado"
echo ""

# ─── TURNO 4: Evaluador de Usabilidad Clinica ────────────────────────────────

log_turn 4 "Evaluador de Usabilidad Clinica (ui-designer)"

TURN4_PROMPT="$(role_4_prompt)

---
## Contexto de turnos anteriores:
$ACCUMULATED_CONTEXT

---
## Necesidad clinica original:
$CLINICAL_NEED"

"$DISPATCH_SCRIPT" ui-designer "$TURN4_PROMPT" > "$TURN_OUTPUT" 2>/dev/null
TURN4_RESULT=$(cat "$TURN_OUTPUT")
ACCUMULATED_CONTEXT="$ACCUMULATED_CONTEXT

## Turno 4 — Evaluador de Usabilidad Clinica
$TURN4_RESULT"

echo "## Turno 4 — Evaluador de Usabilidad Clinica" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "$TURN4_RESULT" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

log_success "Turno 4 completado"
echo ""

# ─── TURNO 5: Integrador Tecnico NocoBase ────────────────────────────────────

log_turn 5 "Integrador Tecnico NocoBase (code-reviewer)"

TURN5_PROMPT="$(role_5_prompt)

---
## Contexto COMPLETO de los 4 turnos anteriores:
$ACCUMULATED_CONTEXT

---
## Necesidad clinica original:
$CLINICAL_NEED

IMPORTANTE: Tu output es el documento FINAL del consenso. Sintetiza todo en una especificacion app-spec/app.yaml y un resumen ejecutivo."

"$DISPATCH_SCRIPT" code-reviewer "$TURN5_PROMPT" > "$TURN_OUTPUT" 2>/dev/null
TURN5_RESULT=$(cat "$TURN_OUTPUT")

echo "## Turno 5 — Integrador Tecnico NocoBase (Sintesis Final)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "$TURN5_RESULT" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

log_success "Turno 5 completado"
echo ""

# ─── CLEANUP ─────────────────────────────────────────────────────────────────

rm -f "$TURN_OUTPUT"

log_info "=========================================="
log_success "CONSENSO CLINICO COMPLETADO"
log_info "Output: $OUTPUT_FILE"
log_info "=========================================="
echo ""
echo "Siguiente paso: Revisa el documento de consenso y ejecuta el pipeline:"
echo "  bash .subagents/dispatch-team.sh clinical-app-pipeline \"$(basename "$OUTPUT_FILE")\""
