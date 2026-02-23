-- Table: BUHO_Pacientes

CREATE TABLE IF NOT EXISTS BUHO_Pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(20),
    cama VARCHAR(50),
    episodio VARCHAR(50),
    servicio VARCHAR(100),
    sala VARCHAR(50),
    fecha_ingreso TIMESTAMP,
    tipo_cama VARCHAR(50),
    categorizacion VARCHAR(50),
    diagnostico_principal TEXT,
    especialidad_medico VARCHAR(100),
    fecha_probable_alta TIMESTAMP,
    estudios_pendientes TEXT,
    
    -- Campos del Plan de Trabajo Transversal
    estado_plan        VARCHAR(50), -- Ej: 'Pendiente', 'En Curso', 'Listo para Alta'
    proxima_accion     TEXT,        -- Acción sugerida por el sistema
    riesgo_detectado   VARCHAR(50), -- Ej: 'Alto', 'Medio', 'Bajo'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_buho_pacientes_rut ON BUHO_Pacientes(rut);
