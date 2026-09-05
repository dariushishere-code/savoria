/**
 * SAVORIA Production Check
 * Runs a battery of production-readiness checks and reports PASS/WARNING/FAIL.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const results = [];

function check(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS', detail: '' });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    const detail = err.message?.split('\n')[0] || String(err);
    results.push({ name, status: 'FAIL', detail });
    console.log(`  ✗ ${name} — ${detail}`);
  }
}

function warn(name, detail) {
  results.push({ name, status: 'WARN', detail });
  console.log(`  ⚠ ${name} — ${detail}`);
}

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'pipe', encoding: 'utf-8' });
}

console.log('\n🔍 SAVORIA Production Check\n');

// ─── 1. Dependencies ─────────────────────────────────────────
console.log('\n[1/7] Dependencies');
check('pnpm-lock.yaml exists', () => {
  if (!existsSync(join(root, 'pnpm-lock.yaml'))) throw new Error('pnpm-lock.yaml missing');
});
check('node_modules installed', () => {
  if (!existsSync(join(root, 'node_modules'))) throw new Error('node_modules missing — run pnpm install');
});

// ─── 2. Lint ─────────────────────────────────────────────────
console.log('\n[2/7] Lint');
check('pnpm lint', () => run('pnpm lint'));

// ─── 3. Typecheck ────────────────────────────────────────────
console.log('\n[3/7] Typecheck');
check('pnpm typecheck', () => run('pnpm typecheck'));

// ─── 4. Tests ────────────────────────────────────────────────
console.log('\n[4/7] Tests');
check('pnpm test', () => run('pnpm test'));

// ─── 5. Prisma ───────────────────────────────────────────────
console.log('\n[5/7] Prisma');
check('prisma schema exists', () => {
  if (!existsSync(join(root, 'packages/database/prisma/schema.prisma'))) throw new Error('schema.prisma missing');
});
check('migrations directory exists', () => {
  if (!existsSync(join(root, 'packages/database/prisma/migrations'))) throw new Error('migrations/ missing');
});
check('pnpm db:generate', () => run('pnpm db:generate'));

// ─── 6. Build ────────────────────────────────────────────────
console.log('\n[6/7] Build');
check('pnpm build', () => run('pnpm build'));

// ─── 7. Configuration ────────────────────────────────────────
console.log('\n[7/7] Configuration');

// Check .env.example exists
check('.env.example exists', () => {
  if (!existsSync(join(root, '.env.example'))) throw new Error('.env.example missing');
});

// Check for insecure defaults in production
const envExample = readFileSync(join(root, '.env.example'), 'utf-8');
if (envExample.includes('change-me') || envExample.includes('dev-')) {
  warn('Insecure dev defaults in .env.example', 'Replace with real values in production');
}

// Check for hardcoded localhost in source
try {
  const matches = execSync(
    `node -e "const fs=require('fs');const path=require('path');function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(f==='node_modules'||f==='.git'||f==='dist'||f==='.turbo')continue;if(fs.statSync(p).isDirectory())walk(p);else if(/\\.(ts|tsx|js|jsx)$/.test(f)){const c=fs.readFileSync(p,'utf-8');if(/localhost:3001/.test(c)&&!p.includes('env.example'))console.log(p)}}}walk('.')"`,
    { cwd: root, encoding: 'utf-8' }
  ).trim();
  if (matches) {
    warn('Hardcoded localhost:3001 in source', matches.split('\n').slice(0, 3).join(', '));
  }
} catch {
  // ignore
}

// ─── Summary ─────────────────────────────────────────────────
const passCount = results.filter((r) => r.status === 'PASS').length;
const warnCount = results.filter((r) => r.status === 'WARN').length;
const failCount = results.filter((r) => r.status === 'FAIL').length;

console.log('\n──────────────────────────────────────────');
console.log(`  ${passCount} PASS  ${warnCount} WARN  ${failCount} FAIL`);
console.log('──────────────────────────────────────────\n');

if (failCount > 0) {
  console.log('❌ Production check FAILED — fix the failures above.\n');
  process.exit(1);
} else if (warnCount > 0) {
  console.log('⚠ Production check passed with warnings.\n');
} else {
  console.log('✅ Production check passed.\n');
}