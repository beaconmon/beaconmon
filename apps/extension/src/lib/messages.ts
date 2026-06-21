// Message contracts shared across the three contexts (content script,
// service worker, popup). Keeping them in one typed union means a new message
// can't be added on one side without the other side failing to compile.

import type { Snapshot } from './snapshot.js';

/** Sent by the content script when it locally detects a Shopify storefront.
 * Carries only a boolean verdict + the bare domain — never page content. The
 * service worker does the privileged products.json read; nothing is phoned home. */
export interface ShopifyDetectedMessage {
  type: 'SHOPIFY_DETECTED';
  domain: string;
}

/** Popup -> service worker: give me the snapshot for the active tab's store. */
export interface GetSnapshotMessage {
  type: 'GET_SNAPSHOT';
  domain: string;
}

/** Popup -> service worker: start watching this store in Beaconmon. */
export interface TrackMessage {
  type: 'TRACK';
  domain: string;
  name: string;
}

/** Popup -> service worker: current auth + (optionally) trigger the connect flow. */
export interface GetAuthMessage {
  type: 'GET_AUTH';
}
export interface ConnectMessage {
  type: 'CONNECT';
}

/** beaconmon.com -> service worker, via externally_connectable. The connect page
 * mints a long-lived token after magic-link auth and hands it back here. */
export interface ExternalTokenMessage {
  type: 'EXT_TOKEN';
  token: string;
  teamName?: string;
}

export type RuntimeMessage =
  | ShopifyDetectedMessage
  | GetSnapshotMessage
  | TrackMessage
  | GetAuthMessage
  | ConnectMessage;

// --- Response shapes -------------------------------------------------------

export type SnapshotState =
  | { status: 'none' }
  | { status: 'loading' }
  | { status: 'ready'; snapshot: Snapshot }
  | { status: 'unusable' }; // Shopify detected but feed blocked/absent

export interface AuthState {
  connected: boolean;
  teamName?: string;
}

export type TrackResult =
  | { ok: true; alreadyTracking?: boolean }
  | { ok: false; reason: 'unauthenticated' | 'limit' | 'error'; message: string };
