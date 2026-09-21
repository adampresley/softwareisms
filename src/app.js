import express from 'express';
import { fileURLToPath } from 'node:url';
import { home, ismDetails } from './controllers/home-controller.js';

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

/*
 * Application routes
 */
app.get('/', home);
app.get('/isms/:slug', ismDetails);


// 404 handler
app.use((_, res) => res.status(404).render('error', {
   title: 'Not found — Softwareisms',
   description: 'This page could not be found.',
   status: '404',
   heading: 'This one escapes us.',
   message: 'That ism or page isn’t in the collection. Head back and find another idea.'
}));

// 500 handler
app.use((error, _, res) => {
   console.error(error);
   res.status(500).render('error', {
      title: 'Something went wrong — Softwareisms',
      description: 'An unexpected error occurred.',
      status: '500',
      heading: 'Even software has its moments.',
      message: 'Something went wrong. Please try again.'
   });
});
