import { app } from './app.js';

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, '0.0.0.0', () => console.log(`Softwareisms listening on port ${port}`));

for (const signal of ['SIGINT', 'SIGTERM']) {
   process.on(signal, () => {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
   });
}
