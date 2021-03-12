/**
 * Copyright (c) 2020-2021 August
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { ConstructorReturnType } from '@augu/utils';
import { Component, Inject } from '@augu/lilith';
import { HttpServer, Router } from '@augu/http';
import type Loggaby from 'loggaby';

import SponsorsRouter from '../routers/SponsorsRouter';
import SentryRouter from '../routers/SentryRouter';

export default class HttpServerComponent implements Component {
  public priority = 1;
  public name = 'server';

  @Inject
  private logger!: ConstructorReturnType<typeof Loggaby>;

  #server!: HttpServer;

  load() {
    this.logger.debug('Booting up http server...');

    const port = Number(process.env.PORT ?? '3621');
    this.#server = new HttpServer({
      port
    });

    const sponsors = new SponsorsRouter();
    const sentry = new SentryRouter();

    this._addEvents();
    this.#server.router(sponsors.router);
    this.#server.router(sentry.router);

    const router = new Router('/');
    router.get('/', (_, res) => res.status(200).json({ hello: 'world' }));

    this.#server.router(router);
    return this.#server.start();
  }

  dispose() {
    this.logger.warn('Server has closed down :(');
    this.#server.close();
  }

  private _addEvents() {
    this.#server.once('listening', networks =>
      this.logger.log('Server has started up on networks:\n', networks.map(net => `• ${net.host} (${net.type})`).map(s => s.trim()).join('\n'))
    );

    this.#server.on('request', (props) => {
      if (process.env.NODE_ENV !== 'development')
        return;

      this.logger.debug(`${props.method} ${props.path} (${props.status}) | ~${props.time}ms`);
    });

    this.#server.on('error', (error) => this.logger.error('Unhandled error has occured\n', error));
  }
}
