/** Build and release metadata - populate via CI in production */
export const BUILD_INFO = {
  version: '0.1.0-beta',
  releaseChannel: 'beta' as const,
  buildDate: import.meta.env.VITE_BUILD_DATE ?? new Date().toISOString().slice(0, 10),
  environment: import.meta.env.MODE,
  commitHash: import.meta.env.VITE_COMMIT_HASH ?? 'local-dev',
};
