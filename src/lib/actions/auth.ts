'use server';

import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSession, destroySession, logActivity, rateLimit } from '@/lib/auth';
import { db } from '@/lib/db';
import { escapeHtml } from '@/lib/utils';

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const next = String(form.get('next') || '');
  const ip = ((await headers()).get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) return { error: 'Too many attempts. Wait 15 minutes and try again.' };
  if (!email || !password) return { error: 'Enter your email and password.' };
  const user = await db.user.findUnique({ where: { email } });
  const ok = user && user.active && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !ok) return { error: 'That email and password do not match.' };
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user);
  await logActivity(`<b>${escapeHtml(user.name)}</b> signed in to the dashboard`, 'i-user', user.name);
  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}
