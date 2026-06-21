// Content detector. Runs in the isolated world on every https page and decides,
// from DOM signals only, whether this looks like a Shopify storefront. It sends
// the service worker a single boolean verdict plus the bare host — never any page
// content. The authoritative confirmation is the worker's products.json read; a
// false positive there just degrades to the neutral "intel available" badge.
import type { ShopifyDetectedMessage } from '../lib/messages.js';

function looksLikeShopify(): boolean {
  // Shopify storefronts load assets from cdn.shopify.com and ship a handful of
  // identifying meta/link tags. Any one signal is enough to gate a feed read.
  if (document.querySelector('link[href*="cdn.shopify.com"], script[src*="cdn.shopify.com"]')) {
    return true;
  }
  if (document.querySelector('link[rel="dns-prefetch"][href*="shopify"]')) {
    return true;
  }
  if (document.querySelector('meta[id^="shopify-"], meta[name^="shopify-"]')) {
    return true;
  }
  // Cart endpoint form actions are a strong, theme-agnostic tell.
  if (document.querySelector('form[action="/cart/add"], form[action^="/cart/add"]')) {
    return true;
  }
  return false;
}

function bareHost(): string {
  return location.hostname.toLowerCase().replace(/^www\./, '');
}

if (looksLikeShopify()) {
  const message: ShopifyDetectedMessage = { type: 'SHOPIFY_DETECTED', domain: bareHost() };
  // Fire-and-forget; the worker owns the privileged feed read and the badge.
  void chrome.runtime.sendMessage(message).catch(() => {
    // Worker may be asleep mid-navigation; it re-derives on the popup's request.
  });
}
