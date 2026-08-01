// Inject 'preview' command line argument for Vite
process.argv.push('preview');

// Load and execute Vite's CLI entry point dynamically using ESM import
import('./client/node_modules/vite/bin/vite.js').catch(err => {
  console.error("Failed to load Vite:", err);
  process.exit(1);
});
