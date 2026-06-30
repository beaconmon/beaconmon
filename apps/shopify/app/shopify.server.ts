import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";

import { sessionStorage as customSessionStorage } from "./lib/session-storage.server";
import { provisionShopifyInstall } from "./lib/provision.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January26,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: customSessionStorage,
  distribution: AppDistribution.AppStore,
  // Non-expiring offline tokens: the ShopifyInstall-backed session storage only
  // persists the access token (no refreshToken/expires), so token refresh is
  // deliberately not enabled. See app/lib/session-storage.server.ts.
  hooks: {
    // Silent provisioning. Runs after the offline token is stored, so the
    // ShopifyInstall row exists and we only need to create the team + defaults
    // and backfill teamId. Idempotent (no-op once provisioned).
    afterAuth: async ({ session, admin }) => {
      await provisionShopifyInstall({ session, admin });
      // Register app/uninstalled and GDPR compliance webhooks. Safe to call
      // on every auth (idempotent at Shopify's end).
      await shopify.registerWebhooks({ session }).catch((err) => {
        console.error('Failed to register webhooks', err);
      });
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;

export const apiVersion = ApiVersion.January26;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
