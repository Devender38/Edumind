// ResolveX Phase 22 — Config & Metadata Index Exporter

export * from './env.js';
export * from './validation.js';

export interface RuntimeMetadata {
  service: string;
  version: string;
  environment: string;
  commitSha: string;
  buildTimestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
}

const buildTimestamp = new Date().toISOString();

export function getRuntimeMetadata(env: string, version: string, commitSha: string): RuntimeMetadata {
  return {
    service: 'ResolveX Autonomous Customer Resolution Agent Engine',
    version: version || '22.0.0',
    environment: env || 'development',
    commitSha: commitSha || 'development-local-build',
    buildTimestamp,
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
  };
}
