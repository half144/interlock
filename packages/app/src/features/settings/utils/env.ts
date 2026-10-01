export interface EnvVar {
  id: number;
  name: string;
  value: string;
}

export type EnvRow = [name: string, value: string];

const VALID_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/u;

const isValidName = (name: string) => VALID_NAME.test(name);

/** What is worth saving: named rows only, and a name that appears twice keeps its last value. */
export function savableEnv(rows: EnvRow[]): EnvRow[] {
  const byName = new Map<string, string>();
  for (const [name, value] of rows) if (name.trim()) byName.set(name.trim(), value);
  return [...byName];
}

/** The name that cannot be an environment variable, if any. */
export const badName = (rows: EnvRow[]): string | undefined =>
  rows.map(([name]) => name.trim()).find((name) => name && !isValidName(name));
