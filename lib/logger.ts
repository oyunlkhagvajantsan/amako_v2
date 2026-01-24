/**
 * Centralized Logger Utility
 * Provides a standardized way to log errors, warnings, and info across the app.
 * Can be easily extended to integrate with Sentry, Logtail, etc.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogOptions {
    tags?: string[];
    context?: Record<string, any>;
}

const isProduction = process.env.NODE_ENV === 'production';

class Logger {
    private formatMessage(level: LogLevel, message: string, options?: LogOptions) {
        const timestamp = new Date().toISOString();
        const tags = options?.tags ? `[${options.tags.join(', ')}] ` : '';
        const context = options?.context ? `\nContext: ${JSON.stringify(options.context, null, 2)}` : '';

        return `${timestamp} ${level.toUpperCase()}: ${tags}${message}${context}`;
    }

    info(message: string, options?: LogOptions) {
        if (!isProduction) {
            console.log(this.formatMessage('info', message, options));
        }
    }

    warn(message: string, options?: LogOptions) {
        console.warn(this.formatMessage('warn', message, options));
        // TODO: Send to monitoring service in production
    }

    error(message: string | Error, options?: LogOptions) {
        const errorMessage = message instanceof Error ? message.message : message;
        const stack = message instanceof Error ? `\nStack: ${message.stack}` : '';

        console.error(this.formatMessage('error', errorMessage, options) + stack);

        // TODO: Integrate with Sentry/Logtail here
        // if (isProduction) {
        //     Sentry.captureException(message);
        // }
    }
}

export const logger = new Logger();
