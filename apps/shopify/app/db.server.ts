// Reuse the single shared Prisma client from @beaconmon/db so the Shopify app
// participates in the same connection pooling (DATABASE_URL_POOLED) as the rest
// of the monorepo.
import { prisma } from "@beaconmon/db";

export { prisma };
export default prisma;
