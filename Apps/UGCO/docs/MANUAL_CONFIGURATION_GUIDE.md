# Guía de Configuración Manual - NocoBase

Dado que la generación automática de interfaz no es visible en el navegador, sigue estos pasos para configurar tus vistas en menos de 10 minutos.

## 1. Configuración de BUHO (Gestión de Pacientes)

### Paso 1: Crear el Menú
1.  Entra a NocoBase como **Super Admin**.
2.  En el menú lateral, haz clic en **"Add menu item"** (o el icono `+`).
3.  Selecciona **"Group"** y nómbralo `BUHO`.
4.  Dentro de `BUHO`, añade un sub-ítem tipo **"Page"**.
5.  Nómbralo `Gestión de Camas`.

### Paso 2: Crear la Tabla de Pacientes
1.  En la página blanca nueva, haz clic en **"Add block"**.
2.  Selecciona **"Table"** -> **"buho_pacientes"**.
3.  En "Configure columns", selecciona:
    *   `nombre`
    *   `rut`
    *   `cama`
    *   `servicio`
    *   `estado_plan` (Este es clave).
    *   `riesgo_detectado`
4.  Haz clic en **"Add action"** (arriba de la tabla) y activa:
    *   `Filter`, `Add new`, `Delete`, `Refresh`.
5.  En la columna de "Actions" (dentro de la tabla), añade:
    *   `View`, `Edit`.

### Paso 3: Configurar el Formulario (Drawer)
1.  Haz clic en el botón **"Add new"** que acabas de crear.
2.  Se abrirá un panel lateral (Drawer). Haz clic en **"Configure form"**.
3.  Añade todos los campos relevantes (`diagnostico_principal`, `proxima_accion`, etc.).
4.  Organízalos usando **"Grid"** (filas y columnas) para que se vea ordenado.

---

## 2. Configuración de UGCO (Oncología)

### Paso 1: Crear el Menú
1.  Añade un nuevo Grupo de Menú llamado `UGCO`.
2.  Añade una página llamada `Casos Oncológicos`.

### Paso 2: Crear la Tabla de Casos
1.  Añade un bloque **"Table"** conectado a `ugco_casooncologico`.
2.  Configura las columnas:
    *   `paciente` (Asociación) -> Muestra `nombre` y `rut`.
    *   `clinical_status` (Estado Clínico).
    *   `proximo_control`.
    *   `diagnostico_cie10` -> Muestra `descripcion`.
3.  Activa las acciones `Add new`, `Filter`, `View`, `Edit`.

### Paso 3: Crear la Vista de Eventos (Sub-tabla)
1.  Entra al formulario de "Ver/Editar" de un Caso Oncológico.
2.  Debajo de los datos del caso, añade un nuevo bloque.
3.  Selecciona **"Table"** -> **"Eventos"** (Relación `ugco_casooncologico.eventos`).
4.  Esto mostrará solo los eventos (biopsias, controles) de ESE paciente específico.

## 3. Verificación
*   Crea un paciente de prueba en BUHO.
*   Crea un caso de prueba en UGCO.
*   Verifica que los datos se guarden correctamente.
