import 'server-only';
import { cache } from 'react';
import { db } from './db';
import { SETTINGS_DEFAULTS, SETTINGS_GROUPS, type Settings, type SettingsGroup } from './settings-defaults';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Deep merge where arrays and primitives from `over` replace `base`. */
export function mergeDeep<T>(base: T, over: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(over)) return (over === undefined ? base : over) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined) continue;
    const b = (base as Record<string, unknown>)[k];
    out[k] = isPlainObject(b) && isPlainObject(v) ? mergeDeep(b, v) : v;
  }
  return out as T;
}

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const stored: Partial<Record<SettingsGroup, unknown>> = {};
  for (const r of rows) {
    try {
      stored[r.key as SettingsGroup] = JSON.parse(r.value);
    } catch {
      /* ignore a corrupt row and fall back to defaults */
    }
  }
  const out = {} as Record<SettingsGroup, unknown>;
  for (const g of SETTINGS_GROUPS) out[g] = mergeDeep(SETTINGS_DEFAULTS[g], stored[g]);
  return out as Settings;
});

export async function saveSettingsGroup<G extends SettingsGroup>(group: G, value: Settings[G]) {
  const merged = mergeDeep(SETTINGS_DEFAULTS[group], value);
  await db.setting.upsert({
    where: { key: group },
    create: { key: group, value: JSON.stringify(merged) },
    update: { value: JSON.stringify(merged) },
  });
  return merged;
}

/** Absolute base URL for canonical links and sitemaps. */
export function siteUrl(s: Settings) {
  const u = (s.general.siteUrl || process.env.SITE_URL || 'http://localhost:3000').trim();
  return u.replace(/\/+$/, '');
}
