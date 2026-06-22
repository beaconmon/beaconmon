import { Session } from "@shopify/shopify-app-react-router/server";
import type { SessionStorage } from "@shopify/shopify-app-session-storage";
import { prisma } from "@beaconmon/db";

// This app uses OFFLINE access tokens only (an AppStore embedded app that reads
// products/inventory for its own merchant). Offline session ids are
// deterministic: `offline_<shop>`. We therefore key session storage by shop and
// reuse the ShopifyInstall row as the store, avoiding a redundant Session table.
const OFFLINE_PREFIX = "offline_";

function shopFromSessionId(id: string): string | null {
  return id.startsWith(OFFLINE_PREFIX)
    ? id.slice(OFFLINE_PREFIX.length)
    : null;
}

// Reconstruct an offline Session from the durable fields we persist. Scope is
// taken from the app's configured scopes (the granted scopes for an offline
// token match the requested ones for this app, which never changes them at
// runtime). State is irrelevant for offline tokens obtained via token exchange.
function toSession(shop: string, accessToken: string): Session {
  return new Session({
    id: `${OFFLINE_PREFIX}${shop}`,
    shop,
    state: "",
    isOnline: false,
    accessToken,
    scope: process.env.SCOPES,
  });
}

/**
 * SessionStorage backed by the ShopifyInstall table.
 *
 * - storeSession: upsert by shop (refresh token + clear soft-delete on reinstall).
 *   The row may be created here BEFORE provisioning runs, so team_id is left null
 *   and backfilled by the afterAuth hook (Step 4).
 * - loadSession / findSessionsByShop: return a reconstructed offline session for
 *   active (not uninstalled) installs only.
 * - deleteSession(s): soft-delete (set uninstalledAt) so the shop<->team link and
 *   analytics survive for GDPR handling; loadSession then returns nothing.
 */
class ShopifyInstallSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    // Online tokens are never requested; nothing to persist for them.
    if (session.isOnline) return true;

    const { shop } = session;
    const accessToken = session.accessToken ?? "";

    await prisma.shopifyInstall.upsert({
      where: { shop },
      create: { shop, accessToken },
      update: { accessToken, uninstalledAt: null },
    });

    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const shop = shopFromSessionId(id);
    if (!shop) return undefined;

    const install = await prisma.shopifyInstall.findFirst({
      where: { shop, uninstalledAt: null },
    });
    if (!install) return undefined;

    return toSession(install.shop, install.accessToken);
  }

  async deleteSession(id: string): Promise<boolean> {
    const shop = shopFromSessionId(id);
    if (!shop) return true;

    await prisma.shopifyInstall.updateMany({
      where: { shop, uninstalledAt: null },
      data: { uninstalledAt: new Date() },
    });

    return true;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    for (const id of ids) await this.deleteSession(id);
    return true;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const install = await prisma.shopifyInstall.findFirst({
      where: { shop, uninstalledAt: null },
    });
    return install ? [toSession(install.shop, install.accessToken)] : [];
  }
}

export const sessionStorage = new ShopifyInstallSessionStorage();
