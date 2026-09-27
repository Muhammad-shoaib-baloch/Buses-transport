'use server';

import bcrypt from 'bcryptjs';
import { unlink } from 'node:fs/promises';
import { logActivity, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/notify';
import { saveSettingsGroup } from '@/lib/settings';
import { SETTINGS_GROUPS, type Settings, type SettingsGroup } from '@/lib/settings-defaults';
import { resolveUpload } from '@/lib/uploads';
import { escapeHtml } from '@/lib/utils';
import { bool, optInt, run, str, type ActionResult } from './helpers';

type V = Record<string, unknown>;

/* ---------------- quote requests ---------------- */
const QUOTE_STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'closed', 'spam'];

export async function updateQuote(id: number, v: { status?: string; notes?: string }): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const data: { status?: string; notes?: string } = {};
    if (v.status !== undefined) {
      if (!QUOTE_STATUSES.includes(v.status)) throw new Error('Unknown status.');
      data.status = v.status;
    }
    if (v.notes !== undefined) data.notes = String(v.notes).slice(0, 5000);
    const q = await db.quoteRequest.update({ where: { id }, data });
    if (data.status) await logActivity(`Quote <b>${q.ref}</b> marked <b>${data.status}</b>`, 'i-inbox', me.name);
  });
}

export async function deleteQuote(id: number): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const q = await db.quoteRequest.delete({ where: { id } });
    await logActivity(`Deleted quote request <b>${q.ref}</b>`, 'i-trash', me.name);
  });
}

/* ---------------- settings ---------------- */
export async function saveSettings(group: string, value: V): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin({ role: 'admin' });
    if (!SETTINGS_GROUPS.includes(group as SettingsGroup)) throw new Error('Unknown settings group.');
    if (group === 'email' && typeof value.smtpPass === 'string' && value.smtpPass === '••••••••') {
      // keep the stored password when the masked placeholder comes back unchanged
      const cur = await db.setting.findUnique({ where: { key: 'email' } });
      value.smtpPass = cur ? JSON.parse(cur.value).smtpPass || '' : '';
    }
    await saveSettingsGroup(group as SettingsGroup, value as unknown as Settings[SettingsGroup]);
    await logActivity(`Updated <b>${group}</b> settings`, 'i-settings', me.name);
    return { ok: true, message: 'Settings saved.' };
  });
}

export async function sendTestEmail(): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const row = await db.setting.findUnique({ where: { key: 'email' } });
    const e = row ? JSON.parse(row.value) : {};
    const to = e.notifyTo || me.email;
    await sendMail({ to, subject: 'Test email from your website', html: '<p>Email notifications are working.</p>', text: 'Email notifications are working.' });
    return { ok: true, message: `Test email sent to ${to}.` };
  });
}

/* ---------------- media ---------------- */
export async function deleteMedia(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const m = await db.media.delete({ where: { id } });
    const full = resolveUpload(m.url.replace(/^\/media\//, ''));
    if (full) await unlink(full).catch(() => {});
  });
}

export async function updateMediaAlt(id: number, alt: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await db.media.update({ where: { id }, data: { alt: String(alt).slice(0, 200) } });
  });
}

/* ---------------- users ---------------- */
export async function saveUser(v: V): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin({ role: 'admin' });
    const name = str(v, 'name', 120);
    const email = str(v, 'email', 200).toLowerCase();
    const password = String(v.password ?? '');
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Add a name and a valid email.');
    const role = str(v, 'role') === 'editor' ? 'editor' : 'admin';
    const id = optInt(v, 'id');
    if (!id && password.length < 8) throw new Error('Set a password of at least 8 characters.');
    if (password && password.length < 8) throw new Error('Passwords need at least 8 characters.');
    if (id === me.uid && (role !== 'admin' || !bool(v, 'active'))) throw new Error('You cannot remove your own admin access.');
    const data = { name, email, role, active: bool(v, 'active'), ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) };
    const row = id
      ? await db.user.update({ where: { id }, data })
      : await db.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 12) } });
    await logActivity(`${id ? 'Updated' : 'Added'} user <b>${escapeHtml(row.name)}</b>`, 'i-user', me.name);
    return { ok: true, id: row.id };
  });
}

export async function deleteUser(id: number): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin({ role: 'admin' });
    if (id === me.uid) throw new Error('You cannot delete your own account.');
    await db.user.delete({ where: { id } });
  });
}

export async function changePassword(v: V): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const current = String(v.current ?? '');
    const next = String(v.next ?? '');
    const confirm = String(v.confirm ?? '');
    if (next.length < 8) throw new Error('The new password needs at least 8 characters.');
    if (next !== confirm) throw new Error('The two new passwords do not match.');
    const u = await db.user.findUnique({ where: { id: me.uid } });
    if (!u || !(await bcrypt.compare(current, u.passwordHash))) throw new Error('Your current password is not correct.');
    await db.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
    await logActivity(`<b>${escapeHtml(u.name)}</b> changed their password`, 'i-lock', u.name);
    return { ok: true, message: 'Password updated.' };
  });
}
