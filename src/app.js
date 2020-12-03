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
const { existsSync } = require('fs');
const { join } = require('path');
const dotenv = require('@augu/dotenv');
const Server = require('./structures/Server');
const util = require('./utils');

const logger = createLogger({ namespace: 'Master', transports: [] });
const envPath = join(__dirname, '..', '.env');
const argv = process.argv.slice(2);

async function main() {
  logger.info(`:mag: Looking for .env in "${envPath}"...`);

  if (!existsSync(envPath)) {
    logger.warn('No file exists, assuming first installation');
    try {
      await util.createConfigFile();
      logger.info(`Created .env file in "${envPath}"`);
    } catch(ex) {
      logger.error(`Unable to create .env file in "${envPath}"`, ex);
      process.exit(1);
    }
  } else {
    logger.info(':thumbsup: Found the .env file, now booting...');
  }

  if (argv[0] === '--config' || argv[0] === '-c') {
    if (existsSync(envPath)) {
      logger.warn(`.env file is located at "${envPath}", run this without \`--config\` or \`-c\` arg(s).`);
      process.exit(0);
    }

    try {
      await util.createConfigFile();
      logger.info(`Created .env file in "${envPath}"`);
    } catch(ex) {
      logger.error(`Unable to create .env file in "${envPath}"`, ex);
      process.exit(1);
    }
  }

  dotenv.parse({
    populate: true,
    file: join(__dirname, '..', '.env'),
    schema: {
      DISCORD_WEBHOOK_URL: {
        type: 'string',
        default: undefined
      },
      NODE_ENV: {
        type: 'string',
        oneOf: ['development', 'production'],
        default: 'development'
      },
      SECRET: 'string',
      PORT: {
        default: 3621,
        type: 'int'
      }
    }
  });

  const server = new Server();

  try {
    await server.load();
  } catch(ex) {
    logger.error('Unable to initialize server', ex);
    process.exit(1);
  }

  process.on('SIGINT', () => {
    logger.warn('Received SIGINT, now closing...');
    server.close();

    process.exit(0);
  });
}

main();
