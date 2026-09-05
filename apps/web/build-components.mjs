import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const BASE = 'c:/Users/alireza/Desktop/savoria/apps/web/src';
function w(rel, content) {
  const fp = join(BASE, rel);
  try { mkdirSync(join(fp, '..'), { recursive: true }); } catch {}
  writeFileSync(fp, content, 'utf-8');
  console.log('  written: ' + rel);
}
console.log('Building web components…');

// will be populated by subsequent append calls
const files = globalThis.__files || (globalThis.__files = {});

// Export for chaining
export { w, files };
