import { createClient, log } from '../../../../../shared/scripts/ApiClient';
import logger from './logger';

interface Patient {
    id: number;
    nombre: string;
    fecha_ingreso: string;
    fecha_probable_alta: string;
    estudios_pendientes: string;
    categorizacion: string;
    estado_plan?: string;
    proxima_accion?: string;
    riesgo_detectado?: string;
    [key: string]: any; // Allow other fields from API
}

export class PlanService {
    private isProcessing: boolean = false;
    private client = createClient();

    async processPlan() {
        if (this.isProcessing) {
            logger.warn('Plan processing already in progress. Skipping.');
            return;
        }

        this.isProcessing = true;
        logger.info('Starting Transversal Work Plan processing via NocoBase API...');

        try {
            // 1. Fetch patients from NocoBase API
            // Using appends to get related data if needed, but for now just flat fields
            const response = await this.client.get('/BUHO_Pacientes:list', {
                paginate: false, // Fetch all for analysis
                sort: '-updatedAt'
            });

            const patients: Patient[] = response.data?.data || [];

            if (!patients.length) {
                logger.info('No patients found to process.');
                return;
            }

            // 2. Analyze and Update each patient
            for (const patient of patients) {
                await this.analyzeAndUpdatePatient(patient);
            }

            logger.info(`Plan processing completed. Analyzed ${patients.length} patients.`);
        } catch (error: any) {
            logger.error('Error during plan processing:', error.message);
            if (error.response) {
                logger.error('API Response:', JSON.stringify(error.response.data));
            }
        } finally {
            this.isProcessing = false;
        }
    }

    private async analyzeAndUpdatePatient(patient: Patient) {
        let estadoPlan = 'En Curso';
        let proximaAccion = 'Continuar monitoreo';
        let riesgo = 'Bajo';

        // --- LOGIC PLACEHOLDERS (To be refined with specific medical rules) ---

        // Example Rule 1: High Risk if categorization is C1 or C2
        if (patient.categorizacion === 'C1' || patient.categorizacion === 'C2') {
            riesgo = 'Alto';
            proximaAccion = 'Evaluar ingreso a UCI/UTI si no hay mejora';
        }

        // Example Rule 2: Pending Studies
        // Note: API might return null or empty string
        if (patient.estudios_pendientes && patient.estudios_pendientes.length > 5) {
            estadoPlan = 'Pendiente Estudios';
            proximaAccion = 'Agilizar resultados de laboratorio/imagenología';
        }

        // Example Rule 3: Discharge approaching
        if (patient.fecha_probable_alta) {
            const today = new Date();
            const dischargeDate = new Date(patient.fecha_probable_alta);
            const diffDays = Math.ceil((dischargeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1 && diffDays >= 0) {
                estadoPlan = 'Pre-Alta';
                proximaAccion = 'Preparar epicrisis y recetas';
            } else if (diffDays < 0) {
                estadoPlan = 'Retraso Alta';
                riesgo = 'Medio';
                proximaAccion = 'Revisar motivos de retraso';
            }
        }

        // Update NocoBase if changes detected
        if (
            patient.estado_plan !== estadoPlan ||
            patient.proxima_accion !== proximaAccion ||
            patient.riesgo_detectado !== riesgo
        ) {
            try {
                await this.client.post(`/BUHO_Pacientes:update?filterByTk=${patient.id}`, {
                    estado_plan: estadoPlan,
                    proxima_accion: proximaAccion,
                    riesgo_detectado: riesgo
                });
                logger.info(`Updated plan for patient ${patient.id} (${patient.nombre}): ${estadoPlan}`);
            } catch (error: any) {
                logger.error(`Failed to update patient ${patient.id}:`, error.message);
            }
        }
    }
}

export const planService = new PlanService();
