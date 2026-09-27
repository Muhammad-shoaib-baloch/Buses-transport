/* Set (or create) a dashboard login from the command line.
   npm run admin:password -- you@example.com "New password here" */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const [emailArg, password] = process.argv.slice(2);
  const email = String(emailArg || '').trim().toLowerCase();
  if (!email || !password) {
    console.log('Usage: npm run admin:password -- you@example.com "New password"');
    process.exit(1);
  }
  if (password.length < 8) throw new Error('Use at least 8 characters.');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, active: true },
    create: { email, name: 'Site Admin', role: 'admin', passwordHash },
  });
  console.log(`Password set for ${user.email} (${user.role}). Sign in at /admin/login`);
}

main()
  .catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
