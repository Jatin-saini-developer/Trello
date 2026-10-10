// Dev: the main app runs on its own port. Production (Vercel): same domain, under /app.
export const APP_URL = import.meta.env.DEV ? 'http://localhost:5174/app' : '/app'