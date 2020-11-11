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

const { HttpClient } = require('@augu/orchid');
const { version } = require('../../package.json');
const { Router } = require('express');
const utils = require('../utils');

const router = Router();
const http = new HttpClient({
  defaults: {
    headers: {
      'User-Agent': `webhook.floofy.dev (v${version})`
    }
  }
});

router.get('/', (_, res) => res.status(200).json({ hello: 'world' }));

router.post('/github', (req, res) => {
  if (!req.headers.hasOwnProperty('x-hub-signature')) return res.status(406).json({ message: 'Missing `X-Hub-Signature` signature header' });

  const valid = utils.validateSignature(req.headers['x-hub-signature']);
  console.log(req.body);
  console.log(`valid: ${valid ? 'yes' : 'no'}.`);

  return res.status(204).send();
});

module.exports = router;
