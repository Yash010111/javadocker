import type {
  ApiKeyRequest,
  AuthRequest,
  AuthResponse,
  Holding,
  StockDataResponse,
  StockSearchResult,
  TradeRequest,
  UserDto
} from './types';
import { clearAuthData, getAuthToken } from './utils/auth';

const API_BASE = 'https://proud-wholeness-production-fc22.up.railway.app';

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json().catch(() => ({} as T));
  }

  let errorMessage = 'Server error. Please try again.';

  if (response.status === 401 || response.status === 403) {
    errorMessage = response.status === 401
      ? 'Session expired or login required. Please sign in again.'
      : 'Access denied. Admin permissions required.';
    clearAuthData();
    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 404) {
    errorMessage = 'Resource not found.';
  } else if (response.status === 400) {
    const payload = await response.json().catch(() => null);
    errorMessage = payload?.message || payload?.error || 'Bad request. Please check your input.';
  } else if (response.status >= 500) {
    errorMessage = 'Something went wrong on the server. Please try again later.';
  }

  throw new ApiError(response.status, errorMessage);
}

function createHeaders(includeAuth = false) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

async function fetchJson<T>(url: string, options: RequestInit = {}, includeAuth = false): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...createHeaders(includeAuth),
      ...(options.headers ?? {})
    }
  });
  return handleResponse<T>(response);
}

export function login(request: AuthRequest) {
  return fetchJson<AuthResponse>(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function register(request: AuthRequest) {
  return fetchJson<AuthResponse>(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function getPortfolio() {
  return fetchJson<Holding[]>(`${API_BASE}/api/portfolio`, {}, true);
}

export function searchStocks(keyword: string) {
  return fetchJson<StockSearchResult[]>(`${API_BASE}/api/stocks/search?keyword=${encodeURIComponent(keyword)}`, {}, true);
}

export function getStockData(symbol: string, interval: string) {
  return fetchJson<StockDataResponse>(`${API_BASE}/api/stocks?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`, {}, true);
}

export function buyStock(request: TradeRequest) {
  return fetchJson<Holding>(`${API_BASE}/api/portfolio/buy`, {
    method: 'POST',
    body: JSON.stringify(request)
  }, true);
}

export function sellStock(request: TradeRequest) {
  return fetchJson<Holding>(`${API_BASE}/api/portfolio/sell`, {
    method: 'POST',
    body: JSON.stringify(request)
  }, true);
}

export function getAdminUsers() {
  return fetchJson<UserDto[]>(`${API_BASE}/api/admin/users`, {}, true);
}

export function updateAdminUser(id: number, request: Partial<UserDto>) {
  return fetchJson<UserDto>(`${API_BASE}/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request)
  }, true);
}

export function deleteAdminUser(id: number) {
  return fetchJson<void>(`${API_BASE}/api/admin/users/${id}`, {
    method: 'DELETE'
  }, true);
}

export function getApiKeyConfig() {
  return fetchJson<ApiKeyRequest>(`${API_BASE}/api/admin/config`, {}, true);
}

export function updateApiKeyConfig(request: ApiKeyRequest) {
  return fetchJson<ApiKeyRequest>(`${API_BASE}/api/admin/config`, {
    method: 'PUT',
    body: JSON.stringify(request)
  }, true);
}
