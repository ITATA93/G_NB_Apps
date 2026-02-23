/**
 * Shared type definitions for NocoBase API scripts.
 *
 * These types replace `any` throughout the codebase to improve
 * type safety while remaining flexible for the NocoBase REST API.
 */

// ─── API Response Types ────────────────────────────────────────────

/** Generic NocoBase API response wrapper */
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    count?: number;
    page?: number;
    pageSize?: number;
    totalPage?: number;
  };
}

/** Generic NocoBase list response */
export interface ApiListResponse<T = Record<string, unknown>> {
  data: T[];
  meta?: {
    count: number;
    page: number;
    pageSize: number;
    totalPage: number;
  };
}

// ─── NocoBase Entity Types ─────────────────────────────────────────

/** NocoBase Collection definition */
export interface NbCollection {
  name: string;
  title?: string;
  description?: string;
  category?: string;
  fields?: NbField[];
  inherits?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** NocoBase Field definition */
export interface NbField {
  name: string;
  type: string;
  interface?: string;
  title?: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  defaultValue?: unknown;
  uiSchema?: Record<string, unknown>;
  [key: string]: unknown;
}

/** NocoBase Role definition */
export interface NbRole {
  name: string;
  title?: string;
  description?: string;
  default?: boolean;
  hidden?: boolean;
  snippets?: string[];
  strategy?: NbRoleStrategy | null;
  resources?: NbRoleResource[];
  menuUiSchemas?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** NocoBase Role permission strategy */
export interface NbRoleStrategy {
  actions?: string[];
  [key: string]: unknown;
}

/** NocoBase Role-Resource permission */
export interface NbRoleResource {
  name: string;
  usingActionsConfig: boolean;
  actions?: NbResourceAction[];
  [key: string]: unknown;
}

/** NocoBase Resource Action */
export interface NbResourceAction {
  name: string;
  fields?: string[];
  scope?: Record<string, unknown>;
  [key: string]: unknown;
}

/** NocoBase User definition */
export interface NbUser {
  id: number;
  nickname?: string;
  username?: string;
  email?: string;
  phone?: string;
  roles?: NbRole[];
  createdAt?: string;
  [key: string]: unknown;
}

/** NocoBase Workflow definition */
export interface NbWorkflow {
  id: number;
  key: string;
  title: string;
  description?: string;
  type: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

/** NocoBase UI Schema node */
export interface NbUiSchema {
  'x-uid'?: string;
  'x-component'?: string;
  'x-component-props'?: Record<string, unknown>;
  'x-decorator'?: string;
  'x-decorator-props'?: Record<string, unknown>;
  title?: string;
  properties?: Record<string, NbUiSchema>;
  [key: string]: unknown;
}

/** NocoBase Plugin definition */
export interface NbPlugin {
  name: string;
  version?: string;
  enabled?: boolean;
  installed?: boolean;
  builtIn?: boolean;
  [key: string]: unknown;
}

/** NocoBase Datasource definition */
export interface NbDatasource {
  key: string;
  displayName?: string;
  type?: string;
  options?: Record<string, unknown>;
  enabled?: boolean;
  [key: string]: unknown;
}

// ─── CLI Utility Types ─────────────────────────────────────────────

/** Parsed CLI arguments */
export interface ParsedArgs {
  flags: Record<string, string>;
  positional: string[];
}

/** Log entry for file logging */
export interface LogEntry {
  timestamp: string;
  action: string;
  endpoint?: string;
  method?: string;
  data?: unknown;
  result?: string;
  error?: string;
  script?: string;
  [key: string]: unknown;
}

// ─── Chalk Color Names ─────────────────────────────────────────────

/** Valid chalk color names for the log() function */
export type ChalkColor =
  | 'white'
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'gray'
  | 'grey'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright';
