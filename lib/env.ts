export function getRuntimeEnv(name: string): string | undefined {
  const direct = process.env[name];
  if (direct) return direct;

  // Amplify Gen 1 can expose encrypted environment secrets through process.env.secrets.
  const rawSecrets = process.env.secrets;
  if (!rawSecrets) return undefined;

  try {
    const secrets = JSON.parse(rawSecrets) as Record<string, unknown>;
    const value = secrets[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

export function hasRuntimeEnv(name: string): boolean {
  return Boolean(getRuntimeEnv(name));
}
