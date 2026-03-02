#!/usr/bin/env python3
"""
sync_entrega_turno.py — ETL Script: Sincronizar Entrega de Turno

Extrae datos de censo desde ALMA/TrakCare (via API o DB),
transforma al formato de et_pacientes_censo y carga en NocoBase.

Este script se ejecuta como cronjob independiente o se invoca
desde el workflow sync_censo_alma en NocoBase.

Uso:
    python shared/scripts/sync_entrega_turno.py
    python shared/scripts/sync_entrega_turno.py --dry-run
    python shared/scripts/sync_entrega_turno.py --service MQ1
    python shared/scripts/sync_entrega_turno.py --verbose

Requiere:
    pip install requests python-dotenv

Variables de entorno (.env):
    NOCOBASE_BASE_URL  - URL base de NocoBase (ej: https://mira.hospitaldeovalle.cl/api)
    NOCOBASE_API_KEY   - Token API de NocoBase
    ALMA_API_URL       - URL de API ALMA/TrakCare (opcional, para fuente directa)
    ALMA_API_TOKEN     - Token API ALMA (opcional)

Nota cross-project:
    Este script se crea localmente en G_NB_Apps pero su logica de extraccion
    ALMA se coordina con G_Consultas (donde residen los queries TrakCare).
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

try:
    import requests
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: Dependencias faltantes. Ejecutar: pip install requests python-dotenv")
    sys.exit(1)

# ── Configuracion ────────────────────────────────────────────────────────────

# Cargar .env desde raiz del proyecto
ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(ENV_PATH)

NOCOBASE_BASE_URL = os.getenv("NOCOBASE_BASE_URL", "")
NOCOBASE_API_KEY = os.getenv("NOCOBASE_API_KEY", "")
ALMA_API_URL = os.getenv("ALMA_API_URL", "")
ALMA_API_TOKEN = os.getenv("ALMA_API_TOKEN", "")

DRY_RUN = "--dry-run" in sys.argv
VERBOSE = "--verbose" in sys.argv
SERVICE_FILTER = None

for i, arg in enumerate(sys.argv):
    if arg == "--service" and i + 1 < len(sys.argv):
        SERVICE_FILTER = sys.argv[i + 1]

# Logging
logging.basicConfig(
    level=logging.DEBUG if VERBOSE else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sync_entrega_turno")

# ── NocoBase API Client ─────────────────────────────────────────────────────


class NocoBaseClient:
    """Cliente simple para API NocoBase."""

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Role": "root",
            }
        )
        self.session.timeout = 30

    def get(self, endpoint: str, params: dict | None = None) -> dict[str, Any]:
        """GET request a NocoBase."""
        url = f"{self.base_url}{endpoint}"
        resp = self.session.get(url, params=params)
        resp.raise_for_status()
        return resp.json()

    def post(self, endpoint: str, data: dict[str, Any]) -> dict[str, Any]:
        """POST request a NocoBase."""
        url = f"{self.base_url}{endpoint}"
        resp = self.session.post(url, json=data)
        resp.raise_for_status()
        return resp.json()

    def upsert(
        self, collection: str, data: dict[str, Any], unique_field: str
    ) -> dict[str, Any]:
        """
        Upsert: buscar por campo unico, actualizar si existe, crear si no.
        """
        unique_value = data.get(unique_field)
        if not unique_value:
            raise ValueError(f"Campo unico '{unique_field}' no encontrado en data")

        # Buscar existente
        existing = self.get(
            f"/{collection}:list",
            params={
                "filter": json.dumps({unique_field: {"$eq": unique_value}}),
                "pageSize": 1,
            },
        )

        existing_items = existing.get("data", [])
        if existing_items:
            # Actualizar
            record_id = existing_items[0].get("id")
            return self.post(
                f"/{collection}:update?filterByTk={record_id}", data
            )
        else:
            # Crear
            return self.post(f"/{collection}:create", data)


# ── Extraccion de datos ALMA ────────────────────────────────────────────────


def extract_censo_alma(client_alma: requests.Session | None = None) -> list[dict[str, Any]]:
    """
    Extraer censo de pacientes hospitalizados desde ALMA/TrakCare.

    Si ALMA_API_URL esta configurado, consulta la API directamente.
    Si no, retorna datos de ejemplo para pruebas (modo mock).
    """
    if ALMA_API_URL and client_alma:
        logger.info(f"Extrayendo censo desde ALMA: {ALMA_API_URL}")
        try:
            resp = client_alma.get(
                f"{ALMA_API_URL}/api/censo/hospitalizados",
                headers={"Authorization": f"Bearer {ALMA_API_TOKEN}"},
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            pacientes = data.get("pacientes", data.get("data", []))
            logger.info(f"  Extraidos {len(pacientes)} pacientes de ALMA")
            return pacientes
        except Exception as e:
            logger.error(f"  Error consultando ALMA: {e}")
            return []

    # Modo mock — datos de ejemplo para desarrollo
    logger.warning("ALMA_API_URL no configurado. Usando datos mock.")
    return [
        {
            "id_episodio": "EP-2026-001",
            "rut": "12345678-9",
            "nro_ficha": "F-001",
            "nombre": "Juan Perez Lopez",
            "edad": 65,
            "sexo": "M",
            "sala": "MQ1-A",
            "cama": "101",
            "medico_tratante": "Dr. Carlos Gonzalez",
            "especialidad": "Medicina Interna",
            "f_ingreso": "2026-02-25T10:00:00",
            "dx_principal": "Neumonia adquirida en comunidad",
            "servicio_codigo": "MQ1",
        },
        {
            "id_episodio": "EP-2026-002",
            "rut": "98765432-1",
            "nro_ficha": "F-002",
            "nombre": "Maria Rodriguez Soto",
            "edad": 45,
            "sexo": "F",
            "sala": "MQ2-B",
            "cama": "205",
            "medico_tratante": "Dra. Ana Martinez",
            "especialidad": "Cirugia General",
            "f_ingreso": "2026-02-28T08:30:00",
            "dx_principal": "Colelitiasis sintomatica",
            "servicio_codigo": "MQ2",
        },
    ]


# ── Transformacion ───────────────────────────────────────────────────────────


def transform_paciente(raw: dict[str, Any]) -> dict[str, Any]:
    """
    Transforma un registro de ALMA al formato de et_pacientes_censo.
    """
    # Calcular dias de hospitalizacion
    dias_hosp = 0
    f_ingreso = raw.get("f_ingreso")
    if f_ingreso:
        try:
            ingreso_dt = datetime.fromisoformat(f_ingreso.replace("Z", "+00:00"))
            dias_hosp = (datetime.now() - ingreso_dt.replace(tzinfo=None)).days
        except (ValueError, TypeError):
            pass

    return {
        "id_episodio": raw.get("id_episodio", ""),
        "rut": raw.get("rut", ""),
        "nro_ficha": raw.get("nro_ficha", ""),
        "nombre": raw.get("nombre", ""),
        "edad": raw.get("edad"),
        "sexo": raw.get("sexo", ""),
        "sala": raw.get("sala", ""),
        "cama": raw.get("cama", ""),
        "medico_tratante_alma": raw.get("medico_tratante", ""),
        "especialidad_clinica": raw.get("especialidad", ""),
        "f_ingreso": f_ingreso,
        "dias_hospitalizacion": dias_hosp,
        "dx_principal": raw.get("dx_principal", ""),
        "alta_confirmada": False,
        "ultima_sync": datetime.now().isoformat(),
    }


# ── Carga a NocoBase ────────────────────────────────────────────────────────


def load_to_nocobase(
    nb_client: NocoBaseClient, pacientes: list[dict[str, Any]]
) -> tuple[int, int, int]:
    """
    Carga pacientes transformados a et_pacientes_censo via upsert.
    Retorna (creados, actualizados, errores).
    """
    created = 0
    updated = 0
    errors = 0

    for pac in pacientes:
        try:
            if DRY_RUN:
                logger.info(
                    f"  [DRY RUN] Upsert: {pac['nombre']} ({pac['id_episodio']})"
                )
                continue

            nb_client.upsert("et_pacientes_censo", pac, "id_episodio")
            logger.debug(f"  Upsert OK: {pac['nombre']} ({pac['id_episodio']})")
            # Contamos como creado/actualizado (API no distingue)
            created += 1
        except Exception as e:
            logger.error(f"  Error upsert {pac.get('id_episodio')}: {e}")
            errors += 1

    return created, updated, errors


# ── Main ─────────────────────────────────────────────────────────────────────


def main():
    logger.info("=" * 60)
    logger.info("  ETL: Sync Entrega de Turno — Censo ALMA -> NocoBase")
    logger.info("=" * 60)

    if DRY_RUN:
        logger.info("[DRY RUN] Simulacion sin aplicar cambios")

    if not NOCOBASE_BASE_URL or not NOCOBASE_API_KEY:
        logger.error(
            "NOCOBASE_BASE_URL y NOCOBASE_API_KEY deben estar configurados en .env"
        )
        sys.exit(1)

    # 1. EXTRACT — obtener censo desde ALMA
    logger.info("\n--- FASE 1: EXTRACT (ALMA/TrakCare) ---")
    alma_session = requests.Session() if ALMA_API_URL else None
    raw_pacientes = extract_censo_alma(alma_session)
    logger.info(f"  Extraidos: {len(raw_pacientes)} registros")

    # Filtrar por servicio si se especifico
    if SERVICE_FILTER:
        raw_pacientes = [
            p for p in raw_pacientes if p.get("servicio_codigo") == SERVICE_FILTER
        ]
        logger.info(
            f"  Filtrado por servicio '{SERVICE_FILTER}': {len(raw_pacientes)} registros"
        )

    if not raw_pacientes:
        logger.warning("  Sin pacientes para sincronizar. Finalizando.")
        return

    # 2. TRANSFORM — convertir al formato NocoBase
    logger.info("\n--- FASE 2: TRANSFORM ---")
    transformed = [transform_paciente(p) for p in raw_pacientes]
    logger.info(f"  Transformados: {len(transformed)} registros")

    # 3. LOAD — cargar a NocoBase
    logger.info("\n--- FASE 3: LOAD (NocoBase) ---")
    nb_client = NocoBaseClient(NOCOBASE_BASE_URL, NOCOBASE_API_KEY)
    created, updated, errors = load_to_nocobase(nb_client, transformed)

    # Resumen
    logger.info("\n" + "=" * 60)
    if DRY_RUN:
        logger.info(f"  [DRY RUN] {len(transformed)} registros simulados")
    else:
        logger.info(f"  Sync completado: {created} upserts, {errors} errores")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
