import axios, { AxiosInstance } from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { LogEntry, ChalkColor } from './types';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logging configuration
const LOG_DIR = path.resolve(__dirname, '../../.claude/logs');
const getLogFile = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return path.join(LOG_DIR, `nocobase-api-${date}.log`);
};

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logToFile = (entry: LogEntry) => {
    try {
        const logLine = JSON.stringify(entry) + '\n';
        fs.appendFileSync(getLogFile(), logLine);
    } catch {
        // Silent fail for logging
    }
};

// Load environment variables from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class ApiClient {
    private client: AxiosInstance;
    private baseUrl: string;

    constructor() {
        const apiUrl = process.env.NOCOBASE_BASE_URL;
        const apiToken = process.env.NOCOBASE_API_KEY;

        if (!apiUrl || !apiToken) {
            console.error(chalk.red('❌ Error: NOCOBASE_BASE_URL or NOCOBASE_API_KEY not found in .env'));
            process.exit(1);
        }

        this.baseUrl = apiUrl;

        this.client = axios.create({
            baseURL: apiUrl,
            timeout: 15000,
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'X-Role': 'root',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Request interceptor for logging
        this.client.interceptors.request.use(request => {
            // console.log(chalk.gray(`[REQ] ${request.method?.toUpperCase()} ${request.url}`));
            return request;
        });

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => {
                if (error.response) {
                    console.error(chalk.red(`❌ API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`));
                } else if (error.request) {
                    console.error(chalk.red('❌ Network Error: No response received'));
                } else {
                    console.error(chalk.red(`❌ Request Error: ${error.message}`));
                }
                return Promise.reject(error);
            }
        );
    }

    public async get(endpoint: string, params: Record<string, unknown> = {}): Promise<unknown> {
        const timestamp = new Date().toISOString();
        try {
            const response = await this.client.get(endpoint, { params });
            logToFile({
                timestamp,
                action: 'GET',
                endpoint,
                method: 'GET',
                data: params,
                result: 'success'
            });
            return response.data;
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            logToFile({
                timestamp,
                action: 'GET',
                endpoint,
                method: 'GET',
                data: params,
                error: errMsg
            });
            throw error;
        }
    }

    public async post(endpoint: string, data: Record<string, unknown>): Promise<unknown> {
        const timestamp = new Date().toISOString();
        try {
            const response = await this.client.post(endpoint, data);
            logToFile({
                timestamp,
                action: 'POST',
                endpoint,
                method: 'POST',
                data: this.sanitizeData(data),
                result: 'success'
            });
            return response.data;
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            logToFile({
                timestamp,
                action: 'POST',
                endpoint,
                method: 'POST',
                data: this.sanitizeData(data),
                error: errMsg
            });
            throw error;
        }
    }

    private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
        if (!data) return data;
        const sanitized = { ...data };
        // Remove sensitive fields from logs
        if (sanitized.password) sanitized.password = '***';
        if (sanitized.apiKey) sanitized.apiKey = '***';
        if (sanitized.token) sanitized.token = '***';
        return sanitized;
    }

    public async put(endpoint: string, data: Record<string, unknown>): Promise<unknown> {
        try {
            const response = await this.client.put(endpoint, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    public async patch(endpoint: string, data: Record<string, unknown>): Promise<unknown> {
        try {
            const response = await this.client.patch(endpoint, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    public async delete(endpoint: string, params: Record<string, unknown> = {}): Promise<unknown> {
        try {
            const response = await this.client.delete(endpoint, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /** Fetch all pages of a paginated endpoint */
    public async listAll(endpoint: string, params: Record<string, unknown> = {}): Promise<unknown[]> {
        const pageSize = 100;
        let page = 1;
        let allData: unknown[] = [];
        let hasMore = true;

        while (hasMore) {
            const response = (await this.get(endpoint, {
                ...params,
                page,
                pageSize
            })) as { data?: unknown[] };
            const items = response.data || [];
            allData = allData.concat(items);
            hasMore = items.length === pageSize;
            page++;
        }
        return allData;
    }

    public getClient(): AxiosInstance {
        return this.client;
    }

    public getBaseUrl(): string {
        return this.baseUrl;
    }
}

export const log = (msg: string, color: ChalkColor = 'white') => {
    const colorFn = (chalk as unknown as Record<string, (s: string) => string>)[color] || chalk.white;
    console.log(colorFn(msg));
};

/**
 * Log an action to the log file with details
 * @param action - Description of the action (e.g., "Created collection", "Deleted page")
 * @param details - Additional details about the action
 */
export const logAction = (action: string, details?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    const scriptName = path.basename(process.argv[1] || 'unknown');

    const entry = {
        timestamp,
        script: scriptName,
        action,
        ...details
    };

    logToFile(entry);

    // Also log to console in a nice format
    const detailStr = details ? ` | ${JSON.stringify(details)}` : '';
    log(`📝 [LOG] ${action}${detailStr}`, 'gray');
};

/**
 * Get today's log file path
 */
export const getLogFilePath = () => getLogFile();

export const createClient = () => new ApiClient();
