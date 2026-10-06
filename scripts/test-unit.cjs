/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const output = path.resolve(__dirname, '../.npm-cache/unit');
fs.mkdirSync(output, { recursive: true });
for (const name of ['library', 'discovery']) {
  const source = fs.readFileSync(path.resolve(__dirname, '../lib/' + name + '.ts'), 'utf8');
  fs.writeFileSync(path.join(output, name + '.cjs'), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
}
const result = spawnSync(process.execPath, ['--test', path.resolve(__dirname, '../tests/unit.test.cjs')], { stdio: 'inherit' });
process.exit(result.status ?? 1);
