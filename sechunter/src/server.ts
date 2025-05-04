import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderApplication } from '@angular/platform-server';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

import authRouter from './app/core/services/auth-backend';

const app = express();

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Mount auth backend router under /api/auth
app.use('/api/auth', authRouter);

/**
 * Handle all other requests by rendering the Angular application with hydration support.
 */
app.get('*', async (req, res, next) => {
  try {
    const html = await renderApplication(() => bootstrapApplication(AppComponent, config), {
      url: req.url,
    });
    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export { app };
