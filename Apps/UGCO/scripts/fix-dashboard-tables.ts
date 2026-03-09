/**
 * fix-dashboard-tables.ts
 * Fix all broken Dashboard table blocks in UGCO
 *
 * Dashboard table blocks and their fixes:
 *   252gccm8p8i  Comités Oncológicos → change UGCO_comiteoncologico → onco_comite_sesiones
 *   qfnwl0tr3qu  Últimos Episodios   → keep onco_episodios, fix wrong columns
 *   z88y0z4h15q  Tareas Pendientes   → repurpose UGCO_tarea → onco_comite_casos
 *   kupdp4nyxuh  Contactos Pacientes → repurpose UGCO_contactopaciente → onco_casos (activos)
 *   o4udvyhr9gd  Equipos Seguimiento → repurpose UGCO_equiposeguimiento → onco_casos (seguimiento)
 */

import { randomBytes } from "crypto";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;

function uid(): string {
  return randomBytes(5).toString("hex").slice(0, 10);
}

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

/** Patch x-decorator-props and x-acl-action on a block */
async function patchBlock(blockUid: string, patch: object): Promise<void> {
  await api("POST", `uiSchemas:patch`, { "x-uid": blockUid, ...patch });
  console.log(`  ✓ patched block ${blockUid}`);
}

/** Delete a column schema node */
async function deleteColumn(colUid: string): Promise<void> {
  try {
    await api("POST", `uiSchemas:remove/${colUid}`);
    console.log(`    - deleted col ${colUid}`);
  } catch (e: any) {
    console.warn(`    ⚠ delete ${colUid}: ${e.message}`);
  }
}

/** Insert a column before the Actions column (fixed="right") */
async function insertColumn(
  actionsColUid: string,
  fieldName: string,
  collectionField: string,
  title?: string
): Promise<void> {
  const colUid  = uid();
  const fldUid  = uid();

  const schema: any = {
    type: "void",
    "x-uid": colUid,
    "x-component": "TableV2.Column",
    "x-decorator": "TableV2.Column.Decorator",
    "x-component-props": title ? { title } : {},
    properties: {
      [fieldName]: {
        type: "string",
        "x-uid": fldUid,
        "x-component": "CollectionField",
        "x-decorator": null,
        "x-read-pretty": true,
        "x-component-props": {},
        "x-decorator-props": {},
        "x-collection-field": collectionField,
        _isJSONSchemaObject: true,
        version: "2.0",
        "x-async": false,
        "x-index": 1,
      },
    },
    _isJSONSchemaObject: true,
    version: "2.0",
    "x-async": false,
  };

  await api("POST", `uiSchemas:insertBeforeBegin/${actionsColUid}`, { schema });
  console.log(`    + inserted col ${fieldName} (uid=${colUid})`);
}

// ──────────────────────────────────────────────────────────────────────────────
// TABLE DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────

interface TableFix {
  name: string;
  blockUid: string;
  actionsColUid: string;        // uid of actions column (fixed=right)
  colsToDelete: string[];       // uids of columns to delete (not actions)
  newCollection: string;
  newTitle: string;
  newAclAction: string;
  newSort: string[];
  newFilter?: object;
  newPageSize?: number;
  newColumns: Array<{ field: string; collectionField: string; title?: string }>;
}

const FIXES: TableFix[] = [
  // ── 1. Comités Oncológicos ─────────────────────────────────────────────────
  {
    name: "Comités Oncológicos",
    blockUid: "252gccm8p8i",
    actionsColUid: "rbt8ry6gsyr",
    colsToDelete: [
      "r8ij5ah3g5y", // fecha_sesion
      "532jt2l6z1x", // lugar
      "poiupg7ihy8", // estado
      "7n82jyxs6gp", // observaciones
    ],
    newCollection: "onco_comite_sesiones",
    newTitle: "Comités Oncológicos",
    newAclAction: "onco_comite_sesiones:list",
    newSort: ["-fecha"],
    newPageSize: 5,
    newColumns: [
      { field: "numero_sesion",  collectionField: "onco_comite_sesiones.numero_sesion", title: "N° Sesión" },
      { field: "tipo_comite",    collectionField: "onco_comite_sesiones.tipo_comite",   title: "Tipo" },
      { field: "fecha",          collectionField: "onco_comite_sesiones.fecha",          title: "Fecha" },
      { field: "estado_sesion",  collectionField: "onco_comite_sesiones.estado_sesion",  title: "Estado" },
    ],
  },

  // ── 2. Últimos Episodios ──────────────────────────────────────────────────
  {
    name: "Últimos Episodios Clínicos",
    blockUid: "qfnwl0tr3qu",
    actionsColUid: "nwr7qg9o7e0",
    colsToDelete: [
      "dqi0orylblr", // tipo_evento
      "u6zk7zrosrz", // subtipo_evento
      "30k5uh1je09", // fecha_solicitud
      "6rf8hv5qo69", // fecha_realizacion
      "tdptxd4v4u3", // resultado_resumen
    ],
    newCollection: "onco_episodios",      // already correct
    newTitle: "Últimos Episodios Clínicos",
    newAclAction: "onco_episodios:list",
    newSort: ["-fecha"],
    newPageSize: 5,
    newColumns: [
      { field: "tipo_episodio",   collectionField: "onco_episodios.tipo_episodio",   title: "Tipo" },
      { field: "fecha",           collectionField: "onco_episodios.fecha",            title: "Fecha" },
      { field: "descripcion",     collectionField: "onco_episodios.descripcion",      title: "Descripción" },
      { field: "estado_episodio", collectionField: "onco_episodios.estado_episodio",  title: "Estado" },
    ],
  },

  // ── 3. Tareas Pendientes → Casos en Comité ────────────────────────────────
  {
    name: "Tareas Pendientes → Casos en Comité",
    blockUid: "z88y0z4h15q",
    actionsColUid: "2jivovd6tfd",
    colsToDelete: [
      "wv86uj0sjla", // titulo
      "dvwqyx96ohc", // fecha_vencimiento
      "eadygebkg8e", // responsable_usuario
      "firalg5flxv", // comentarios
    ],
    newCollection: "onco_comite_casos",
    newTitle: "Casos en Comité",
    newAclAction: "onco_comite_casos:list",
    newSort: ["-fecha_presentacion"],
    newPageSize: 5,
    newColumns: [
      { field: "fecha_presentacion",   collectionField: "onco_comite_casos.fecha_presentacion",   title: "Fecha" },
      { field: "prioridad",            collectionField: "onco_comite_casos.prioridad",             title: "Prioridad" },
      { field: "decision",             collectionField: "onco_comite_casos.decision",              title: "Decisión" },
      { field: "seguimiento_requerido",collectionField: "onco_comite_casos.seguimiento_requerido", title: "Seguimiento" },
    ],
  },

  // ── 4. Contactos de Pacientes → Casos Activos ─────────────────────────────
  {
    name: "Contactos de Pacientes → Casos Activos",
    blockUid: "kupdp4nyxuh",
    actionsColUid: "j3wgid04ezn",
    colsToDelete: [
      "mp5fpz0vz2g", // tipo_contacto
      "qrc2hf2ftdh", // valor_contacto
      "fgvtj3q7ft6", // es_principal
      "5qfd63j39l6", // activo
    ],
    newCollection: "onco_casos",
    newTitle: "Casos Activos",
    newAclAction: "onco_casos:list",
    newSort: ["-fecha_ingreso"],
    newPageSize: 5,
    newFilter: { "$and": [{ "estado": { "$eq": "activo" } }] },
    newColumns: [
      { field: "paciente_nombre",     collectionField: "onco_casos.paciente_nombre",     title: "Paciente" },
      { field: "especialidad",        collectionField: "onco_casos.especialidad",         title: "Especialidad" },
      { field: "estadio_clinico",     collectionField: "onco_casos.estadio_clinico",      title: "Estadio" },
      { field: "estado",              collectionField: "onco_casos.estado",               title: "Estado" },
    ],
  },

  // ── 5. Equipos de Seguimiento → Casos en Seguimiento ─────────────────────
  {
    name: "Equipos de Seguimiento → Casos en Seguimiento",
    blockUid: "o4udvyhr9gd",
    actionsColUid: "83wjld6dzqx",
    colsToDelete: [
      "5x2520yfj4v", // nombre
      "ee1ksninlmy", // descripcion
      "dt3ff3xrvz1", // activo
    ],
    newCollection: "onco_casos",
    newTitle: "Casos en Seguimiento",
    newAclAction: "onco_casos:list",
    newSort: ["-fecha_ingreso"],
    newPageSize: 5,
    newFilter: { "$and": [{ "estado": { "$eq": "seguimiento" } }] },
    newColumns: [
      { field: "paciente_nombre",     collectionField: "onco_casos.paciente_nombre",     title: "Paciente" },
      { field: "especialidad",        collectionField: "onco_casos.especialidad",         title: "Especialidad" },
      { field: "fecha_ingreso",       collectionField: "onco_casos.fecha_ingreso",        title: "F. Ingreso" },
      { field: "estadio_clinico",     collectionField: "onco_casos.estadio_clinico",      title: "Estadio" },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────

async function fixTable(fix: TableFix): Promise<void> {
  console.log(`\n▶ ${fix.name} (${fix.blockUid})`);

  // 1. Patch block: collection, acl-action, sort, title, filter
  const decoratorPatch: any = {
    action: "list",
    params: {
      sort: fix.newSort,
      pageSize: fix.newPageSize ?? 5,
      ...(fix.newFilter ? { filter: fix.newFilter } : {}),
    },
    dragSort: false,
    showIndex: true,
    collection: fix.newCollection,
    dataSource: "main",
  };

  await patchBlock(fix.blockUid, {
    "x-acl-action": fix.newAclAction,
    "x-component-props": { title: fix.newTitle },
    "x-decorator-props": decoratorPatch,
  });

  // 2. Delete old columns
  console.log(`  Deleting ${fix.colsToDelete.length} old columns...`);
  for (const colUid of fix.colsToDelete) {
    await deleteColumn(colUid);
    await new Promise(r => setTimeout(r, 150));
  }

  // 3. Insert new columns (reverse order so they appear in correct sequence)
  console.log(`  Inserting ${fix.newColumns.length} new columns...`);
  const reversed = [...fix.newColumns].reverse();
  for (const col of reversed) {
    await insertColumn(fix.actionsColUid, col.field, col.collectionField, col.title);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`  ✅ Done: ${fix.name}`);
}

async function main(): Promise<void> {
  console.log("=== DASHBOARD TABLE FIX ===\n");
  console.log(`Instance: ${BASE}`);

  let ok = 0;
  let fail = 0;

  for (const fix of FIXES) {
    try {
      await fixTable(fix);
      ok++;
    } catch (e: any) {
      console.error(`  ❌ Failed ${fix.name}: ${e.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n=== RESULT: ${ok} fixed, ${fail} failed ===`);
}

main().catch(console.error);
