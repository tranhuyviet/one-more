import { db } from './admin';
import { migration as m001 } from './001_initial_schema';
import { migration as m002 } from './002_rename_loggedAt_to_createdAt';
import type { Migration } from './types';

// Register all migrations here in order
const ALL_MIGRATIONS: Migration[] = [
  m001,
  m002,
];

const COL = '_migrations';

async function getApplied(): Promise<Set<string>> {
  const snap = await db.collection(COL).get();
  return new Set(snap.docs.map(d => d.id));
}

async function status() {
  const applied = await getApplied();
  console.log('\nMigration status:');
  console.log('─'.repeat(60));
  for (const m of ALL_MIGRATIONS) {
    const mark = applied.has(m.id) ? '✓' : '○';
    const state = applied.has(m.id) ? 'applied ' : 'pending ';
    console.log(`  [${m.id}] ${mark} ${state}  ${m.name}`);
    console.log(`              ${m.description}`);
  }
  console.log('─'.repeat(60) + '\n');
}

async function up(targetId?: string) {
  const applied = await getApplied();
  const pending = targetId
    ? ALL_MIGRATIONS.filter(m => m.id === targetId && !applied.has(m.id))
    : ALL_MIGRATIONS.filter(m => !applied.has(m.id));

  if (pending.length === 0) {
    console.log(targetId ? `Migration ${targetId} is already applied or not found.` : 'Nothing to migrate.');
    return;
  }
  for (const m of pending) {
    console.log(`▶  [${m.id}] ${m.name}`);
    await m.up(db);
    await db.collection(COL).doc(m.id).set({
      name: m.name,
      description: m.description,
      appliedAt: Date.now(),
    });
    console.log(`   ✓ Applied\n`);
  }
}

async function down(targetId: string) {
  const applied = await getApplied();
  const m = ALL_MIGRATIONS.find(m => m.id === targetId);
  if (!m) { console.error(`Migration ${targetId} not found.`); return; }
  if (!applied.has(targetId)) { console.error(`Migration ${targetId} is not applied.`); return; }

  console.log(`◀  [${m.id}] ${m.name} — rolling back...`);
  await m.down(db);
  await db.collection(COL).doc(m.id).delete();
  console.log(`   ✓ Rolled back\n`);
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  try {
    if (cmd === 'status') await status();
    else if (cmd === 'up') await up(arg);
    else if (cmd === 'down' && arg) await down(arg);
    else {
      console.log([
        '',
        'Usage:',
        '  pnpm migrate status              — show all migrations and their state',
        '  pnpm migrate up                  — apply all pending migrations',
        '  pnpm migrate up <id>             — apply one migration (e.g. up 001)',
        '  pnpm migrate down <id>           — rollback one migration (e.g. down 001)',
        '',
      ].join('\n'));
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
  process.exit(0);
}

main();
