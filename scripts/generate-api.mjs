// Generates src/generated/api.d.ts from the backend OpenAPI contract (the file is committed, spec §12.6).
//   node scripts/generate-api.mjs          write the file; keep the existing one if the backend is unreachable
//   node scripts/generate-api.mjs --check  fail if the committed file is out of date (CI); only warn if unreachable
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import openapiTS, { astToString } from 'openapi-typescript';

const source = process.env.API_DOCS_URL ?? 'https://app.coinsavekeeper.com/api/docs.json';
const outFile = new URL('../src/generated/api.d.ts', import.meta.url);
const check = process.argv.includes('--check');

let generated;
try {
  generated = astToString(await openapiTS(new URL(source)));
} catch (error) {
  if (check) {
    // A backend outage must not block frontend CI; the sync check simply can't run this time.
    console.warn(
      `::warning::api:check — ${source} unreachable, contract sync not verified (${error.message})`,
    );
    process.exit(0);
  }
  if (existsSync(outFile)) {
    console.warn(`api:generate — ${source} unreachable, keeping existing types (${error.message})`);
    process.exit(0);
  }
  console.error(`api:generate — ${source} unreachable and no types exist yet`);
  process.exit(1);
}

if (check) {
  const committed = existsSync(outFile) ? readFileSync(outFile, 'utf8') : '';
  if (committed !== generated) {
    console.error(
      `::error::src/generated/api.d.ts is out of date with ${source}. Run \`npm run api:generate\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log(`api:check — src/generated/api.d.ts matches ${source}`);
} else {
  mkdirSync(new URL('../src/generated/', import.meta.url), { recursive: true });
  writeFileSync(outFile, generated);
  console.log(`api:generate — types written from ${source}`);
}
