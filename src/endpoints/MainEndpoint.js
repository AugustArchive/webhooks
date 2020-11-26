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
  // just close it when we don't have it
  if (!req.headers.hasOwnProperty('sentry-hook-signature')) return res.status(204).end();

  // for resolve / ignore errors
  const body = req.body;
  if (body.hasOwnProperty('action')) {
    switch (body.action) {
      case 'resolved': {
        const {
          actor,
          data: {
            issue: data
          }
        } = req.body;

        const content = {
          content: `:umbrella2: Issue has been resolved in project **${data.project.name}** by **${actor.name}**${actor.type === 'application' ? ' (automatic)' : ''}`,
          embeds: [
            {
              title: `[ ${data.title} ]`,
              color: 0xE35D6A,
              fields: [
                {
                  name: '❯   Platform',
                  value: data.platform,
                  inline: true
                },
                {
                  name: '❯   Culprit',
                  value: `**${data.culprit}** (${data.metadata.filename})`,
                  inline: false
                }
              ]
            }
          ]
        };

        await utils.sendWebhook(content);
      } break;

      case 'ignored': {
        const {
          actor,
          data: {
            issue: data
          }
        } = req.body;

        const content = {
          content: `:umbrella2: Issue has been ignored in project **${data.project.name}** by **${actor.name}**${actor.type === 'application' ? ' (automatic)' : ''}`,
          embeds: [
            {
              title: `[ ${data.title} ]`,
              color: 0xE35D6A,
              fields: [
                {
                  name: '❯   Platform',
                  value: data.platform,
                  inline: true
                },
                {
                  name: '❯    Occured',
                  value: Number(data.count).toLocaleString('en-US'),
                  inline: true
                },
                {
                  name: '❯   Culprit',
                  value: `**${data.culprit}** (${data.metadata.filename})`,
                  inline: false
                }
              ]
            }
          ]
        };

        await utils.sendWebhook(content);
      } break;
    }

    // do not go after this block
    return res.status(200).json({ ok: true });
  }

  const {
    project_name: project,
    event: data,
    url
  } = body;

  const content = {
    content: `:umbrella2: New issue has occured on Sentry in project **${project}**`,
    embeds: [
      {
        title: `[ ${data.title} ]`,
        url,
        fields: [
          {
            name: '❯   Release (Environment)',
            value: `${data.release} (**${data.environment}**)`,
            inline: true
          },
          {
            name: '❯   Platform',
            value: data.platform,
            inline: true
          },
          {
            name: '❯   SDK',
            value: `**${data.sdk.name}** v${data.sdk.version}`,
            inline: true
          },
          {
            name: '❯   Culprit',
            value: `**${data.culprit}** (${data.metadata.filename})`,
            inline: false
          }
        ]
      }
    ]
  };

  await utils.sendWebhook(content);
  return res.status(200).json({ ok: true });
});

module.exports = router;
