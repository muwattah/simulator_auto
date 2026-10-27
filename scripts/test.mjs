import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, '.test-build');
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'package.json'), '{"type":"commonjs"}\n');
const tests = ['pricing', 'configurator', 'setupPresentation'];
const compile = spawnSync(process.execPath, [
  resolve(root, 'node_modules/typescript/bin/tsc'),
  ...tests.map(name => `src/lib/${name}.test.ts`),
  '--module', 'commonjs', '--moduleResolution', 'node', '--target', 'ES2020',
  '--esModuleInterop', '--skipLibCheck', '--outDir', output,
], { cwd: root, stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status ?? 1);
for (const name of tests) {
  const result = spawnSync(process.execPath, [resolve(output, `lib/${name}.test.js`)], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
