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

/* eslint-disable camelcase */

const { HttpClient } = require('@augu/orchid');
const { createHmac } = require('crypto');
const { version } = require('../package.json');

const http = new HttpClient({
  defaults: {
    headers: {
      'User-Agent': `webhook.floofy.dev (v${version})`
    }
  }
});

/**
 * Extra utilities used in this application
 */
module.exports = {

  /**
   * Validates a SHA1-encoded string to check if it equals the same
   * @param {string} signature The signature to use
   * @param {string} body The body to check
   */
  validateSignature(signature, body) {
    const sig = `sha1=${createHmac('sha1', process.env.SECRET).update(body).digest('hex')}`;
    return signature === sig;
  },

  /**
   * If the data contains a [Sponsorship] event
   * @returns {boolean}
   */
  isSponsorshipEvent(data) {
    return data.hasOwnProperty('action') && data.hasOwnProperty('sponsorship');
  },

  /**
   * Sends a webhook to Discord
   * @param {any} data The data
   */
  sendWebhook(data) {
    if (!process.env.DISCORD_WEBHOOK_URL) return;
    return http.post(`${process.env.DISCORD_WEBHOOK_URL}?wait=true`, { data });
  },

  /**
   * Ran when a sponsorship is created
   */
  async onSponsorCreate(data) {
    const res1 = await http.get(data.sponsorship.sponsor.url);
    const sponsor = res1.json();

    const res2 = await http.get(data.sponsorship.sponsorable.url);
    const sponsorable = res2.json();

    const webhook = {
      username: sponsor.name === null ? sponsor.login : sponsor.name,
      avatar_url: data.sponsor.avatar_url,
      embeds: [
        {
          title: `[ 🎉 Sponsored ${sponsorable.name === null ? sponsorable.login : sponsorable.name} ]`,
          color: 0x4D4F9C,
          description: [
            `• **Joined At**: ${new Date(data.sponsorship.created_at)}`,
            `• **Tier**: ${data.sponsorship.tier.name} ($${data.sponsorship.tier.monthly_price_in_dollars})`
          ].join('\n')
        }
      ]
    };

    await this.sendWebhook(webhook);
  },

  /**
   * Ran when a sponsor has a pending cancellation
   */
  async onSponsorPendingCancel(data) {
    const res1 = await http.get(data.sponsorship.sponsor.url);
    const sponsor = res1.json();

    const res2 = await http.get(data.sponsorship.sponsorable.url);
    const sponsorable = res2.json();

    const webhook = {
      username: sponsor.name === null ? sponsor.login : sponsor.name,
      avatar_url: data.sponsor.avatar_url,
      embeds: [
        {
          title: `[ ✏️ Cancelling Sponsorship with ${sponsorable.name === null ? sponsorable.login : sponsorable.name} ]`,
          color: 0x4D4F9C,
          description: [
            `• **Effective Date**: ${new Date(data.sponsorship.effective_date)}`,
            `• **Joined At**: ${new Date(data.sponsorship.created_at)}`,
            `• **Tier**: ${data.sponsorship.tier.name} ($${data.sponsorship.tier.monthly_price_in_dollars})`
          ].join('\n')
        }
      ]
    };

    await this.sendWebhook(webhook);
  },

  /**
   * Ran when a sponsor entity is pending on their tier change
   */
  async onSponsorPendingTierChange(data) {
    const res = await http.get(data.sponsorship.sponsor.url);
    const sponsor = res.json();

    const webhook = {
      username: sponsor.name === null ? sponsor.login : sponsor.name,
      avatar_url: data.sponsor.avatar_url,
      embeds: [
        {
          title: '[ ✏️ Pending Tier Change ]',
          color: 0x4D4F9C,
          description: [
            `• **Effective Date**: ${new Date(data.sponsorship.effective_date)}`,
            `• **Joined At**: ${new Date(data.sponsorship.created_at)}`,
            `• **From -> To Tier**: ${data.sponsorship.changes.tier.from.name} ($${data.sponsorship.changes.tier.from.monthly_price_in_dollars}) -> ${data.sponsorship.tier.name} ($${data.sponsorship.tier.monthly_price_in_dollars})`
          ].join('\n')
        }
      ]
    };

    await this.sendWebhook(webhook);
  },

  /**
   * Ran when a sponsor entity has stopped sponsoring
   */
  async onSponsorCancel(data) {
    const res1 = await http.get(data.sponsorship.sponsor.url);
    const sponsor = res1.json();

    const res2 = await http.get(data.sponsorship.sponsorable.url);
    const sponsorable = res2.json();

    const webhook = {
      username: sponsor.name === null ? sponsor.login : sponsor.name,
      avatar_url: data.sponsor.avatar_url,
      embeds: [
        {
          title: `[ ✏️ Cancelled Sponsorship with ${sponsorable.name === null ? sponsorable.login : sponsorable.name} ]`,
          color: 0x4D4F9C,
          description: [
            `• **Joined At**: ${new Date(data.sponsorship.created_at)}`,
            `• **Tier**: ${data.sponsorship.tier.name} ($${data.sponsorship.tier.monthly_price_in_dollars})`
          ].join('\n')
        }
      ]
    };

    await this.sendWebhook(webhook);
  },

  /**
   * Ran when a sponsor entity has changed their tier
   */
  async onSponsorTierChange(data) {
    const res = await http.get(data.sponsorship.sponsor.url);
    const sponsor = res.json();

    const webhook = {
      username: sponsor.name === null ? sponsor.login : sponsor.name,
      avatar_url: data.sponsor.avatar_url,
      embeds: [
        {
          title: '[ ✏️ Tier Changed ]',
          color: 0x4D4F9C,
          description: [
            `• **Joined At**: ${new Date(data.sponsorship.created_at)}`,
            `• **From -> To Tier**: ${data.sponsorship.changes.tier.from.name} ($${data.sponsorship.changes.tier.from.monthly_price_in_dollars}) -> ${data.sponsorship.tier.name} ($${data.sponsorship.tier.monthly_price_in_dollars})`
          ].join('\n')
        }
      ]
    };

    await this.sendWebhook(webhook);
  }

};
