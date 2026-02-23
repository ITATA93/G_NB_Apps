/**
 * Cliente API Reutilizable para NocoBase - [NOMBRE_APP]
 *
 * Proporciona una interfaz consistente para interactuar con NocoBase API.
 * Incluye reintentos automáticos, logging y manejo de errores estandarizado.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface ApiClientConfig {
  baseURL?: string;
  token?: string;
  role?: string;
  timeout?: number;
  maxRetries?: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private maxRetries: number;

  constructor(config?: ApiClientConfig) {
    const baseURL = config?.baseURL || process.env.NOCOBASE_BASE_URL;
    const token = config?.token || process.env.NOCOBASE_API_KEY;
    const role = config?.role || process.env.NOCOBASE_ROLE || '';
    const timeout = config?.timeout || 30000;

    if (!baseURL) {
      throw new Error('NOCOBASE_BASE_URL no está configurada');
    }

    if (!token) {
      throw new Error('NOCOBASE_API_KEY no está configurada');
    }

    this.maxRetries = config?.maxRetries || 3;

    // Configurar cliente axios
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(role && { 'X-Role': role })
      }
    });

    // Interceptor para logging (opcional)
    this.client.interceptors.request.use(
      (config) => {
        // console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // console.error(`[API Error] ${error.response?.status}: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Request con reintentos automáticos
   */
  private async requestWithRetry<T>(config: AxiosRequestConfig, retries = 0): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      if (retries < this.maxRetries && this.shouldRetry(error)) {
        console.log(`⚠️  Reintentando (${retries + 1}/${this.maxRetries})...`);
        await this.delay(1000 * (retries + 1)); // Backoff exponencial
        return this.requestWithRetry(config, retries + 1);
      }
      throw error;
    }
  }

  /**
   * Determina si un error debe ser reintentado
   */
  private shouldRetry(error: any): boolean {
    // Reintentar en errores de red o 5xx
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT'
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test de conexión
   */
  async testConnection(): Promise<any> {
    try {
      // Intentar obtener información del usuario actual
      const response = await this.client.get('/users:check');
      return {
        success: true,
        user: response.data?.data,
        version: response.headers['x-nocobase-version']
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Listar colecciones
   */
  async listCollections(): Promise<any[]> {
    const response = await this.requestWithRetry<any>({
      method: 'GET',
      url: '/collections:list',
      params: {
        paginate: false
      }
    });
    return response.data || [];
  }

  /**
   * Verificar si una colección existe
   */
  async collectionExists(collectionName: string): Promise<boolean> {
    try {
      await this.requestWithRetry<any>({
        method: 'GET',
        url: `/collections:get`,
        params: { filterByTk: collectionName }
      });
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Listar registros de una colección
   */
  async list(collection: string, params: any = {}): Promise<any> {
    return this.requestWithRetry<any>({
      method: 'GET',
      url: `/${collection}:list`,
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        ...params
      }
    });
  }

  /**
   * Obtener un registro por ID
   */
  async get(collection: string, id: number | string): Promise<any> {
    const response = await this.requestWithRetry<any>({
      method: 'GET',
      url: `/${collection}:get`,
      params: { filterByTk: id }
    });
    return response.data;
  }

  /**
   * Crear un registro
   */
  async create(collection: string, data: any): Promise<any> {
    const response = await this.requestWithRetry<any>({
      method: 'POST',
      url: `/${collection}:create`,
      data
    });
    return response.data;
  }

  /**
   * Actualizar un registro
   */
  async update(collection: string, id: number | string, data: any): Promise<any> {
    const response = await this.requestWithRetry<any>({
      method: 'PUT',
      url: `/${collection}:update`,
      params: { filterByTk: id },
      data
    });
    return response.data;
  }

  /**
   * Eliminar un registro
   */
  async destroy(collection: string, id: number | string): Promise<void> {
    await this.requestWithRetry<any>({
      method: 'DELETE',
      url: `/${collection}:destroy`,
      params: { filterByTk: id }
    });
  }

  /**
   * Crear o actualizar (upsert)
   * TODO: Implementar lógica de upsert real
   */
  async upsert(collection: string, data: any, options: { uniqueField: string }): Promise<any> {
    // Buscar por campo único
    const existing = await this.list(collection, {
      filter: { [options.uniqueField]: data[options.uniqueField] },
      pageSize: 1
    });

    if (existing.data && existing.data.length > 0) {
      // Actualizar
      return this.update(collection, existing.data[0].id, data);
    } else {
      // Crear
      return this.create(collection, data);
    }
  }

  /**
   * Eliminar todos los registros (usar con precaución)
   */
  async deleteAll(collection: string): Promise<void> {
    // TODO: Implementar eliminación por lotes
    console.warn('⚠️  deleteAll no implementado aún');
  }
}

export default ApiClient;
