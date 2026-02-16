export interface ErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  path: string;
  errorCode?: string;
  stack?: string;
}
