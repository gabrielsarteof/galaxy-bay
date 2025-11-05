interface ErrorContext {
  user?: {
    id?: string;
    address?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

class ErrorTracker {
  private enabled: boolean = false;

  init() {
    if (typeof window === 'undefined') return;

    this.enabled = process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true';

    if (this.enabled) {
      // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      //   Sentry.init({
      //     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      //     environment: process.env.NODE_ENV,
      //     tracesSampleRate: 0.1,
      //     beforeSend(event) {
      //       if (event.exception) {
      //         console.error('Error tracked:', event);
      //       }
      //       return event;
      //     },
      //   });
      // }

      window.addEventListener('error', (event) => {
        this.captureException(event.error, {
          tags: { type: 'uncaught' },
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureException(event.reason, {
          tags: { type: 'unhandledRejection' },
        });
      });
    }
  }

  captureException(error: Error, context?: ErrorContext) {
    if (!this.enabled) {
      console.error('Error:', error, context);
      return;
    }

    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(error, {
    //     tags: context?.tags,
    //     extra: context?.extra,
    //     user: context?.user,
    //   });
    // }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (!this.enabled) {
      console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](message, context);
      return;
    }

    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureMessage(message, {
    //     level,
    //     tags: context?.tags,
    //     extra: context?.extra,
    //   });
    // }
  }

  setUser(user: { id: string; address: string }) {
    if (!this.enabled) return;

    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.setUser({
    //     id: user.id,
    //     username: user.address,
    //   });
    // }
  }

  clearUser() {
    if (!this.enabled) return;

    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.setUser(null);
    // }
  }

  addBreadcrumb(message: string, data?: Record<string, any>) {
    if (!this.enabled) return;

    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.addBreadcrumb({
    //     message,
    //     data,
    //     timestamp: Date.now() / 1000,
    //   });
    // }
  }
}

export const errorTracker = new ErrorTracker();
