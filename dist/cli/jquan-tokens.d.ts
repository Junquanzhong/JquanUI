import type { JquanConfig, TokenObject } from '../index';

export function exportTokens(config: JquanConfig): TokenObject;
export function importTokens(tokens: TokenObject): JquanConfig;
export function main(argv?: string[]): { ok: boolean; output?: unknown; error?: string };
