export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  roles: string[];
}

export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface TradeRequest {
  symbol: string;
  quantity: number;
  price: number;
}

export interface StockSearchResult {
  symbol: string;
  name?: string;
  [key: string]: any;
}

export interface StockDataResponse {
  symbol?: string;
  interval?: string;
  [key: string]: any;
}

export interface UserDto {
  id: number;
  username: string;
  role: string;
}

export interface ApiKeyRequest {
  apiKey: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}
