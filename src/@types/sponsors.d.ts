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

/* eslint-disable camelcase */

/** definition for GitHub Sponsors (docs: https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads#sponsorship) */
declare namespace Sponsors {
  // event data
  export interface GenericSponsorEvent {
    sponsorship: Sponsors.Sponsorship;
    sender: Sponsors.UserMetadata;
    action: string;
  }

  export interface SponsorCreatedEvent extends Sponsors.GenericSponsorEvent {
    action: 'created';
  }

  export interface SponsorCancelledEvent extends Sponsors.GenericSponsorEvent {
    action: 'cancelled';
  }

  export interface SponsorTierChangedEvent extends Sponsors.GenericSponsorEvent {
    action: 'tier_changed';
  }

  interface Sponsorship {
    privacy_level: 'public' | 'private';
    sponsorable: Sponsors.UserMetadata;
    created_at: string;
    sponsor: Sponsors.UserMetadata;
    node_id: string;
    tier: Sponsors.SponsorTier;
  }

  interface UserMetadata {
    avatar_url: string;
    node_id: string;
    login: string;
    id: number;
  }

  interface SponsorTier {
    monthly_price_in_dollars: number;
    monthly_price_in_cents: number;
    description: string;
    created_at: string;
    node_id: string;
    name: string;
  }
}
