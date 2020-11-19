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

const { Router } = require('express');
const utils = require('../utils');

const router = Router();

router.get('/', (_, res) => res.status(200).json({ hello: 'world' }));

router.post('/github', async (req, res) => {
  if (!req.headers.hasOwnProperty('x-hub-signature')) return res.status(406).json({ message: 'Missing `X-Hub-Signature` signature header' });

  const valid = utils.validateSignature(req.headers['x-hub-signature'], JSON.stringify(req.body));
  if (!valid) return res.status(403).json({ message: 'Invalid `X-Hub-Signature` signature.' });

  const data = req.body;
  if (data.hasOwnProperty('hook')) {
    const type = data.hook.type;
    if (type === 'SponsorsListing') {
      await utils.sendWebhook({
        content: `[**GitHub Sponsors Webhook | ${data.sender.login}**]: Webhook linked successfully :thumbsup:`
      });

      return res.status(200).json({ ok: true });
    }
  }

  // For sponsorships
  if (utils.isSponsorshipEvent(data)) {
    switch (data.action) {
      case 'pending_tier_change':
        await utils.onSponsorPendingTierChange(req.body);
        break;

      case 'pending_cancellation':
        await utils.onSponsorPendingCancel(req.body);
        break;

      case 'tier_changed':
        await utils.onSponsorTierChange(req.body);
        break;

      case 'cancelled':
        await utils.onSponsorCancel(req.body);
        break;

      case 'created':
        await utils.onSponsorCreate(req.body);
        break;
    }
  }

  return res.status(200).json({ ok: true });
});

router.post('/sentry', async (req, res) => {
  console.log(req.body.event.stacktrace.frames);

  const event = req.body.event;
  const webhook = {
    content: ':umbrella2: **| Received new event from Sentry, view below for trace**',
    embeds: [
      {
        title: `[ Error: ${event.metadata.title || 'Unknown'} ]`,
        color: 0xE35D6A,
        fields: [
          {
            name: '❯   Project',
            value: req.body.project || 'unknown',
            inline: true
          },
          {
            name: '❯   Environment',
            value: event.environment || 'unknown',
            inline: true
          },
          {
            name: '❯   Platform SDK',
            value: event.platform || 'unknown',
            inline: true
          }
        ]
      }
    ]
  };

  const tags = [];
  if (event.tags)
    for (let i = 0; i < event.tags.length; i++) {
      const [name, value] = event.tags[i];
      tags.push(`• **${name}**: ${value}`);
    }

  if (tags.length) webhook.embeds[0].fields.push({
    name: '❯   Tags',
    value: tags.join('\n'),
    inline: true
  });

  const frames = event.stacktrace.frames;
  if (frames.length) {
    let description = ['> :umbrella: **| This is under a seperate embed to not bleed in the main embed.**', ''];
    const other = [];

    const w = {
      color: 0xE35D6A
    };

    const frame = frames[i];
    const contexts = ['```py'];

    if (frame.pre_context) contexts.push(
      '# Pre Context',
      frame.pre_context.join('\n'),
      ''
    );

    if (frame.post_context) contexts.push(
      '# Post Context',
      frame.post_context.join('\n'),
      ''
    );

    contexts.push('```');

    other.push(
      `❯ **Under "${frame.function}"**`,
      '',
      `• **Module**: ${frame.module || 'unknown'}`,
      `• **Absolute Path**: ${frame.abs_path}`
    );

    if (contexts.length !== 2) other.push(
      '',
      contexts.join('\n')
    );

    w.description = description.join('\n');
    webhook.embeds.push(w);
  }

  await utils.sendWebhook(webhook);
  return res.status(200).json({ ok: true });
});

module.exports = router;
