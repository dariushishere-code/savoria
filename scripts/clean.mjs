/**
 * Cross-platform clean script.
 * Removes build artifacts and node_modules without relying on Unix-only commands.
 */
import { rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const targets = [
  'node_modules',
  'apps/web/dist',
  'apps/api/dist',
  'apps/mobile/dist',
  'packages/database/dist',
  'packages/ui/dist',
  'packages/types/dist',
  'packages/validation/dist',
  'packages/config/dist',
  '.turbo',
];

for (const target of targets) {
  const fullPath = join(root, target);
  if (existsSync(fullPath)) {
    console.log(`Removing ${target}...`);
    rmSync(fullPath, { recursive: true, force: true });
  }
}

console.log('Clean complete.');