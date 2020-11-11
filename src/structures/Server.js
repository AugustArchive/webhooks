/**
 * Copyright (c) 2020 August
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

const { createLogger } = require('@augu/logging');
const { promises: fs } = require('fs');
const express = require('express');
const { join } = require('path');

module.exports = class Server {
  constructor() {
    /**
     * The logger
     * @type {import('@augu/logging').ILogger}
     */
    this.logger = createLogger({
      namespace: 'Server',
      transports: [],
      levels: {
        success: 'green'
      }
    });

    /**
     * The application
     * @type {import('express').Express}
     */
    this.app = express();
  }

  async load() {
    this.logger.info(':information_source: Now booting up server...');
    this.app.use((_, res, next) => {
      res.setHeader('X-Powered-By', 'auguwu tehc');
      next();
    });

    await this.loadEndpoints();
    this._server = this.app.listen(process.env.PORT || 3621, () => this.logger.success(`:sparkles: Now listening at http://localhost:${process.env.PORT || 3621}`));
  }

  close() {
    this._server.close();
    this.logger.warn(':pencil2: Server closed.');
  }

  async loadEndpoints() {
    const files = await fs.readdir(join(process.cwd(), 'endpoints'));
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const router = require(join(process.cwd(), 'endpoints', file));

      this.app.use(router);
      this.logger.success(`:white_check_mark: Loaded route "${file.split('.').shift()}"`);
    }
  }
};
