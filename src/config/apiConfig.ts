import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';
import { ensureInternetConnection } from '../utils/checkInternetConnection';
import { getSavedToken } from '../utils/secureStorage';

/** From .env `BASE_URL` via app.config.js → extra.baseUrl */
const API_BASE_URL =
  (Constants.expoConfig?.extra?.baseUrl as string | undefined)?.trim() ||
  process.env.EXPO_PUBLIC_BASE_URL?.trim() ||
  'https://sis.zuselab.dev/api/v1';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'current_password',
  'new_password',
]);

const SENSITIVE_HEADER_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
]);

function redactForLog(data: unknown): unknown {
  if (data == null) return data;
  if (Array.isArray(data)) {
    return data.map((item) => redactForLog(item));
  }
  if (typeof data === 'object') {
    const out: Record<string, unknown> = { ...(data as Record<string, unknown>) };
    for (const key of Object.keys(out)) {
      const lower = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lower)) {
        out[key] = '***';
      } else if (typeof out[key] === 'object' && out[key] !== null) {
        out[key] = redactForLog(out[key]);
      }
    }
    return out;
  }
  return data;
}

function headersForDevLog(
  headers: InternalAxiosRequestConfig['headers'],
): Record<string, unknown> | undefined {
  if (headers == null) {
    return undefined;
  }

  const raw =
    typeof (headers as { toJSON?: () => Record<string, unknown> }).toJSON ===
    'function'
      ? (headers as { toJSON: () => Record<string, unknown> }).toJSON()
      : (headers as Record<string, unknown>);

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) {
      continue;
    }
    const lower = key.toLowerCase();
    if (lower === 'authorization') {
      out[key] = value;
      continue;
    }
    out[key] = SENSITIVE_HEADER_KEYS.has(lower) ? '***' : value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function getAuthorizationHeader(
  headers: InternalAxiosRequestConfig['headers'],
): string | undefined {
  if (headers == null) {
    return undefined;
  }
  const raw =
    typeof (headers as { get?: (name: string) => string }).get === 'function'
      ? (headers as { get: (name: string) => string }).get('Authorization') ??
        (headers as { get: (name: string) => string }).get('authorization')
      : (headers as Record<string, unknown>).Authorization ??
        (headers as Record<string, unknown>).authorization;

  return typeof raw === 'string' ? raw : undefined;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Dev logger registered first so it runs after auth (axios request interceptors are LIFO).
if (__DEV__) {
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const fullUrl = axios.getUri(config);
    const method = (config.method ?? 'get').toUpperCase();
    const authHeader = getAuthorizationHeader(config.headers);

    console.log(`[API] → ${method} ${fullUrl}`);
    console.log(
      `[API]   Bearer token: ${authHeader ?? 'missing'}`,
    );
    if (config.baseURL) {
      console.log('[API]   baseURL:', config.baseURL);
    }
    const loggedHeaders = headersForDevLog(config.headers);
    if (loggedHeaders != null) {
      console.log('[API]   headers:', loggedHeaders);
    }
    if (config.params != null) {
      console.log('[API]   params:', redactForLog(config.params));
    }
    if (config.data != null) {
      console.log('[API]   body:', redactForLog(config.data));
    }
    return config;
  });
}

// Attach Bearer token after network check (runs before dev logger above).
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const [, token] = await Promise.all([
      ensureInternetConnection(),
      getSavedToken(),
    ]);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (__DEV__) {
      console.log('[API]   saved token: not found in secure storage');
    }
    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      const fullUrl = axios.getUri(response.config);
      const method = (response.config.method ?? 'get').toUpperCase();
      console.log(
        `[API] ← ${response.status} ${method} ${fullUrl}`,
      );
    }
    return response;
  },
  (error: AxiosError) => {
    if (__DEV__ && error.config) {
      const fullUrl = axios.getUri(error.config);
      const method = (error.config.method ?? 'get').toUpperCase();
      const status = error.response?.status ?? '—';
      console.log(`[API] ← error ${status} ${method} ${fullUrl}`);
      if (error.response?.data != null) {
        console.log('[API]   error body:', error.response.data);
      }
    }
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message ||
      'Something went wrong while calling API.';

    return Promise.reject(new Error(message));
  },
);
