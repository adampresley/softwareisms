import { catalog, randomIsm, search } from '../catalog.js';

const pageSize = 6;
const numberRegex = /^\d+$/;

export function home(req, res) {
   const query = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 200) : '';

   /*
    * Get search results, then page them
    */
   const searchResults = search(query);
   const numPages = Math.max(1, Math.ceil(searchResults.length / pageSize));

   const requestedPage = typeof req.query.page === 'string' && numberRegex.test(req.query.page) ?
      Number(req.query.page) : 1;
   const page = Math.min(numPages, Math.max(1, requestedPage));
   const pageUrl = number => `/?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(number > 1 ? { page: String(number) } : {}) })}`;

   res.set('Cache-Control', 'no-store');

   res.render('index', {
      title: 'Softwareisms — A field guide to building software',
      description: 'Discover the laws, principles, and occasional uncomfortable truths of building software.',
      query: query,
      matches: searchResults.slice((page - 1) * pageSize, page * pageSize),
      total: searchResults.length,
      catalogTotal: catalog.length,
      page: page,
      pages: numPages,
      pageUrl: pageUrl,
      featured: randomIsm(),
   });
}

export function ismDetails(req, res, next) {
   const ism = catalog.find(entry => entry.slug === req.params.slug);
   if (!ism) return next();

   res.render('detail', {
      title: `${ism.name} — Softwareisms`,
      description: ism.statement,
      ism: ism,
   });
}
