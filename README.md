# Softwareisms

A small, curated field guide to software laws, principles, and aphorisms. Express and EJS render the pages; htmx enhances search and infinite scrolling. Tailwind compiles a local stylesheet. No database, external fonts, or runtime CDN dependencies.

## Run locally

Requires Node.js 24 or newer.

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. `PORT` overrides the default port. `npm run dev` builds assets and watches server files; run `npm run build` again after CSS changes. EJS templates update on refresh in development.

## Curate entries

Edit `data/isms.json`. Each entry has a unique permanent `slug`, `name`, `kind`, `statement`, `explanation`, `category`, an `aliases` array, and a nonempty `references` array of `{ "title", "url" }` objects. Entries are validated during build and startup. Restart or redeploy after changing content.

Statements are editorial paraphrases, not purported original quotations. Keep attribution and caveats in the explanation and link to sources. Reuse category names where possible. The initial categories are Organizations, Planning, API design, Complexity, Design, and Learning.

Search matches all entered words across names, aliases, statements, explanations, kinds, and categories, ignoring case and punctuation. The catalog is sorted alphabetically and paginated in batches of six. Without JavaScript, the same links navigate ordinary pages. With htmx, new rows append automatically; the Load more link also supports retrying a failed request. Search state lives in the URL. The featured entry is chosen randomly on full page requests and stays unchanged during table updates.

## Verify

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

The tests cover catalog validation, search, routes, escaping, pagination, explicit search submission, hero stability, details, browser history, infinite scrolling, mobile overflow, and operation without JavaScript.

## Docker

```sh
docker build -t softwareisms .
docker run --rm -p 3000:3000 --name softwareisms softwareisms
```

The multi-stage image compiles assets, removes development dependencies, runs as a non-root user, and checks `/healthz`. The server binds to `0.0.0.0`, respects `PORT`, and handles termination signals.

