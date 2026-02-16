export interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  errorCode?: string;
}
