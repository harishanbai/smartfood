/**
 * env.js — Must be the FIRST import in server.js.
 *
 * In ES Modules, all imports are hoisted and executed before any code in the
 * importing file runs. This means a regular `dotenv.config()` call placed after
 * imports has no effect — the env vars are already undefined when the other
 * modules first execute.
 *
 * Solution: Put dotenv loading inside its own module and import IT first.
 * ES Module import order IS deterministic: imports resolve top-to-bottom,
 * so importing this file before anything else guarantees .env is loaded first.
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve .env from the server/ root (one level above this config/ file)
const result = dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

if (result.error) {
  console.error('❌ Failed to load .env file:', result.error.message);
} else {
  const loaded = Object.keys(result.parsed || {}).length;
  console.log(`✅ .env loaded successfully (${loaded} variables) from: ${path.resolve(__dirname, '.env')}`);
}
