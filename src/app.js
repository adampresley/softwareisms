import express from 'express';
import { fileURLToPath } from 'node:url';
import { catalog, randomIsm, search } from './catalog.js';

const pageSize = 6;
export const app = express();

app.disable('x-powered-by');
app.set('query parser', 'simple');
app.set('view engine', 'ejs');
app.set('views', fileURLToPath(new URL('../views', import.meta.url)));

app.use((_, res, next) => {
   res.set('X-Content-Type-Options', 'nosniff');
   res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
   next();
});

app.use('/assets', express.static(fileURLToPath(new URL('../public', import.meta.url))));
app.get('/healthz', (_, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) => {
   const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 200) : '';
   const matches = search(query);
   const pages = Math.max(1, Math.ceil(matches.length / pageSize));
   const requestedPage = typeof req.query.page === 'string' && /^\d+$/.test(req.query.page) ? Number(req.query.page) : 1;
   const page = Math.min(pages, Math.max(1, requestedPage));
   const pageUrl = number => `/?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(number > 1 ? { page: String(number) } : {}) })}`;

   res.set('Cache-Control', 'no-store');
   res.render('index', {
      title: 'Softwareisms — A field guide to building software',
      description: 'Discover the laws, principles, and occasional uncomfortable truths of building software.',
      query,
      matches: matches.slice((page - 1) * pageSize, page * pageSize),
      total: matches.length,
      catalogTotal: catalog.length,
      page,
      pages,
      pageUrl,
      featured: randomIsm()
   });
});

app.get('/isms/:slug', (req, res, next) => {
   const ism = catalog.find(entry => entry.slug === req.params.slug);

   if (!ism) return next();

   res.render('detail', { title: `${ism.name} — Softwareisms`, description: ism.statement, ism });
});

app.use((_, res) => res.status(404).render('error', { title: 'Not found — Softwareisms', description: 'This page could not be found.', status: '404', heading: 'This one escapes us.', message: 'That ism or page isn’t in the collection. Head back and find another idea.' }));

app.use((error, _, res) => {
   console.error(error);
   res.status(500).render('error', { title: 'Something went wrong — Softwareisms', description: 'An unexpected error occurred.', status: '500', heading: 'Even software has its moments.', message: 'Something went wrong. Please try again.' });
});
