import { copyFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import '../src/catalog.js';

mkdirSync('public', { recursive: true });
copyFileSync('node_modules/htmx.org/dist/htmx.min.js', 'public/htmx.min.js');
execFileSync(process.execPath, ['node_modules/@tailwindcss/cli/dist/index.mjs', '-i', 'src/styles.css', '-o', 'public/styles.css', '--minify'], { stdio: 'inherit' });
