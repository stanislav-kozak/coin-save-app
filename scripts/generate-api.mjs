// Generates src/generated/api.d.ts from the backend OpenAPI contract.
// If the backend is unreachable but types were generated before, keep them and warn.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import openapiTS, { astToString } from 'openapi-typescript';

const source = process.env.API_DOCS_URL ?? 'http://176.117.78.135/api/docs.json';
const outFile = new URL('../src/generated/api.d.ts', import.meta.url);

try {
  const ast = await openapiTS(new URL(source));
  mkdirSync(new URL('../src/generated/', import.meta.url), { recursive: true });
  writeFileSync(outFile, astToString(ast));
  console.log(`api:generate — types written from ${source}`);
} catch (error) {
  if (existsSync(outFile)) {
    console.warn(`api:generate — ${source} unreachable, keeping existing types (${error.message})`);
  } else {
    console.error(`api:generate — ${source} unreachable and no types exist yet`);
    process.exit(1);
  }
}
