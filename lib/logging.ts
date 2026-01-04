/**
 * Production-safe logging utilities
 * 
 * In production, these functions log minimal information to avoid
 * exposing sensitive data in logs. In development, full details are shown.
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Log an error safely - full details in dev, sanitized in production
 */
export function logError(context: string, error?: unknown): void {
  if (isDev) {
    console.error(`[${context}]`, error);
  } else {
    // In production, only log the context, not error details
    console.error(`[${context}] An error occurred`);
    
    // TODO: Send to external monitoring service (Sentry, LogRocket, etc.)
    // if (error instanceof Error) {
    //   Sentry.captureException(error, { tags: { context } });
    // }
  }
}

/**
 * Log a warning safely
 */
export function logWarn(context: string, message?: string): void {
  if (isDev) {
    console.warn(`[${context}]`, message);
  } else {
    console.warn(`[${context}] Warning`);
  }
}

/**
 * Log info - only in development
 * 
 * SECURITY NOTE: Never pass sensitive data (PII, tokens, passwords) to this function.
 * While it's dev-only, logs could be captured by development tools/extensions.
 */
export function logInfo(context: string, message?: string): void {
  if (isDev) {
    console.log(`[${context}]`, message ?? '');
  }
  // Silent in production
}

/**
 * Validate request origin for CSRF protection
 * Use for critical server actions (delete, password change, etc.)
 */
export function validateOrigin(requestOrigin: string | null): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!appUrl) {
    // If app URL not configured, allow in development
    return isDev;
  }
  
  if (!requestOrigin) {
    return false;
  }
  
  try {
    const originHost = new URL(requestOrigin).host;
    const appHost = new URL(appUrl).host;
    return originHost === appHost;
  } catch {
    return false;
  }
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitive(value: string, visibleChars = 4): string {
  if (!value || value.length <= visibleChars) {
    return '***';
  }
  return value.substring(0, visibleChars) + '***';
}
