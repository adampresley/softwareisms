import { readFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';

const validSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const catalog = validateCatalog(JSON.parse(readFileSync(new URL('../data/isms.json', import.meta.url), 'utf8')))
   .sort((a, b) => a.name.localeCompare(b.name, 'en'));


export function validateCatalog(entries) {
   const slugs = new Set();

   if (!Array.isArray(entries) || !entries.length) throw new Error('Catalog must contain entries.');

   for (const entry of entries) {
      for (const key of ['slug', 'name', 'kind', 'statement', 'explanation', 'category']) {
         if (typeof entry[key] !== 'string' || !entry[key].trim()) throw new Error(`Missing ${key}.`);
      }

      if (!validSlugRegex.test(entry.slug) || slugs.has(entry.slug)) throw new Error(`Invalid or duplicate slug: ${entry.slug}`);

      slugs.add(entry.slug);

      if (!Array.isArray(entry.aliases) || entry.aliases.some(alias => typeof alias !== 'string')) throw new Error(`Invalid aliases: ${entry.slug}`);

      if (!Array.isArray(entry.references) || !entry.references.length) throw new Error(`Missing references: ${entry.slug}`);

      for (const reference of entry.references) {
         if (typeof reference.title !== 'string' || !reference.title.trim() || !['https:', 'http:'].includes(new URL(reference.url).protocol)) throw new Error(`Invalid reference: ${entry.slug}`);
      }
   }

   return entries;
}

export function normalize(value) {
   return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const searchable = catalog.map(entry => ({ entry, text: normalize([entry.name, entry.statement, entry.explanation, entry.category, entry.kind, ...entry.aliases].join(' ')) }));

export function search(query) {
   const words = normalize(query).split(' ').filter(Boolean);
   return searchable.filter(({ text }) => words.every(word => text.includes(word))).map(({ entry }) => entry);
}

export function randomIsm() {
   return catalog[randomInt(catalog.length)];
}
