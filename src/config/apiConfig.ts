import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
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

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

if (__DEV__) {
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const fullUrl = axios.getUri(config);
    const method = (config.method ?? 'get').toUpperCase();
    console.log(`[API] → ${method} ${fullUrl}`);
    if (config.baseURL) {
      console.log('[API]   baseURL:', config.baseURL);
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
