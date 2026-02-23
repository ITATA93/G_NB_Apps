---
name: nocobase-charts
description: Consultar y visualizar datos de colecciones NocoBase. Ejecutar queries con agregaciones, dimensiones y filtros para dashboards.
argument-hint: <command> [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Visualización de Datos en NocoBase

Consulta datos para gráficos y dashboards via API.

## Script Principal

```bash
npx tsx shared/scripts/manage-charts.ts <comando> [opciones]
```

## Comandos Disponibles

### Consultar datos con agregaciones

```bash
# Contar registros
npx tsx shared/scripts/manage-charts.ts query --collection users --measures id:count

# Contar registros agrupados por campo
npx tsx shared/scripts/manage-charts.ts query --collection onco_casos --measures id:count --dimensions estado

# Múltiples medidas y dimensiones
npx tsx shared/scripts/manage-charts.ts query --collection onco_casos \
  --measures id:count,fecha_ingreso:max \
  --dimensions especialidad_id

# Con filtro
npx tsx shared/scripts/manage-charts.ts query --collection onco_casos \
  --measures id:count \
  --filter '{"estado":"activo"}'

# Limitar y ordenar
npx tsx shared/scripts/manage-charts.ts query --collection onco_casos \
  --measures id:count \
  --dimensions especialidad_id \
  --limit 10 \
  --orderBy especialidad_id
```

### Consulta SQL directa

> **NOTA**: Las consultas SQL raw pueden no funcionar en todas las versiones de NocoBase.
> Se recomienda usar measures/dimensions en su lugar.

```bash
# Puede no funcionar - usar measures en su lugar
npx tsx shared/scripts/manage-charts.ts query-sql --sql "SELECT COUNT(*) as total FROM users"

# RECOMENDADO: Usar measures para lo mismo
npx tsx shared/scripts/manage-charts.ts query --collection users --measures id:count
```

### Listar colecciones disponibles

```bash
npx tsx shared/scripts/manage-charts.ts collections
```

### Ver campos de una colección

```bash
npx tsx shared/scripts/manage-charts.ts fields onco_casos
```

## Funciones de Agregación

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `count` | Contar registros | `id:count` |
| `sum` | Sumar valores | `monto:sum` |
| `avg` | Promedio | `edad:avg` |
| `min` | Valor mínimo | `fecha:min` |
| `max` | Valor máximo | `fecha:max` |

## Formato de Query

```typescript
{
    collection: 'nombre_coleccion',
    measures: [
        {
            field: ['campo'],
            aggregation: 'count',  // count, sum, avg, min, max
            alias: 'nombre_resultado'
        }
    ],
    dimensions: [
        { field: ['campo_agrupar'] }
    ],
    filter: { campo: valor },  // opcional
    limit: 100,                 // opcional
    orders: [                   // opcional
        { field: 'campo', order: 'ASC' }
    ]
}
```

## API Endpoints

| Operación | Endpoint |
|-----------|----------|
| Query | `POST /charts:query` |
| SQL | `POST /charts:query` con `sql` |

## Ejemplo: Dashboard de Casos Oncológicos

```typescript
import { createClient } from './ApiClient';
const client = createClient();

// 1. Total de casos por estado
const porEstado = await client.post('/charts:query', {
    collection: 'onco_casos',
    measures: [{ field: ['id'], aggregation: 'count', alias: 'total' }],
    dimensions: [{ field: ['estado'] }]
});

// 2. Casos por especialidad
const porEspecialidad = await client.post('/charts:query', {
    collection: 'onco_casos',
    measures: [{ field: ['id'], aggregation: 'count', alias: 'casos' }],
    dimensions: [{ field: ['especialidad_id'] }],
    orders: [{ field: 'casos', order: 'DESC' }],
    limit: 10
});

// 3. Casos por mes
const porMes = await client.post('/charts:query', {
    collection: 'onco_casos',
    measures: [{ field: ['id'], aggregation: 'count', alias: 'ingresos' }],
    dimensions: [{ field: ['fecha_ingreso'], format: 'YYYY-MM' }]
});

// 4. Consulta SQL personalizada
const sqlResult = await client.post('/charts:query', {
    sql: `
        SELECT
            DATE_TRUNC('month', fecha_ingreso) as mes,
            COUNT(*) as total_casos,
            COUNT(DISTINCT paciente_id) as pacientes_unicos
        FROM onco_casos
        WHERE fecha_ingreso >= NOW() - INTERVAL '12 months'
        GROUP BY 1
        ORDER BY 1
    `
});
```

## Ejemplo: KPIs

```typescript
// Total activos
const activos = await client.post('/charts:query', {
    collection: 'onco_casos',
    measures: [{ field: ['id'], aggregation: 'count', alias: 'total' }],
    filter: { estado: 'activo' }
});

// Promedio de días en tratamiento
const promedioDias = await client.post('/charts:query', {
    collection: 'onco_casos',
    measures: [{ field: ['dias_tratamiento'], aggregation: 'avg', alias: 'promedio' }]
});
```

## Agregar Chart a Página

Una vez que tienes la query funcionando, puedes agregar un bloque de chart a una página:

```typescript
const chartBlock = {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
        col: {
            type: 'void',
            'x-component': 'Grid.Col',
            properties: {
                chart: {
                    type: 'void',
                    'x-decorator': 'ChartBlockProvider',
                    'x-decorator-props': {
                        collection: 'onco_casos',
                        config: {
                            chartType: 'bar',  // bar, line, pie, area, etc.
                            xField: 'estado',
                            yField: 'total',
                            query: {
                                measures: [{ field: ['id'], aggregation: 'count', alias: 'total' }],
                                dimensions: [{ field: ['estado'] }]
                            }
                        }
                    },
                    'x-component': 'CardItem',
                    properties: {}
                }
            }
        }
    }
};
```

## Tipos de Gráficos

| Tipo | Uso |
|------|-----|
| `bar` | Comparación de categorías |
| `line` | Tendencias temporales |
| `pie` | Proporciones |
| `area` | Evolución con volumen |
| `scatter` | Correlación |
| `table` | Datos tabulares |

## Plugin Requerido

Requiere el plugin `data-visualization` habilitado en NocoBase.

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
