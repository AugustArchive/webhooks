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

import 'reflect-metadata';

import { Application } from '@augu/lilith';
import { join } from 'path';
import logger from './singletons/logger';

async function main() {
  logger.log('Booting up server...');

  const app = new Application();

  app.on('singleton.loaded', singleton => logger.log('Registered singleton', singleton.constructor?.name ?? '<unknown>'));
  app.on('component.loaded', component => logger.log(`Component ${component.name} has been initialized`));

  app.findComponentsIn(join(process.cwd(), 'components'));
  app.findSingletonsIn(join(process.cwd(), 'singletons'));

  try {
    logger.log('Verifying current application state...');
    await app.verify();
  } catch(ex) {
    logger.error('Unable to verify application state\n', ex);
    process.exit(1);
  }

  logger.log('Application has started up!');
}

main();
