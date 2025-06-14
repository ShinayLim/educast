/// <reference types="vite/client" />

/**
 * Extend Vite’s default ImportMetaEnv with your custom VITE_*
 * variables so TypeScript knows their names and types.
 */
interface ImportMetaEnv {
   readonly VITE_API_BASE:        string
  readonly VITE_SUPABASE_URL:     string
  readonly VITE_SUPABASE_ANON_KEY: string

  // If you add more VITE_*.env vars in the future, list them here:
  // readonly VITE_API_BASE: string
  // readonly VITE_FEATURE_FLAG: 'on' | 'off'
}

/**
 * Tell TS that `import.meta.env` is of the above shape.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv
}
