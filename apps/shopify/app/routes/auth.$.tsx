import { type LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";

// Catch-all OAuth route (/auth/*). Begins/*completes the install handshake.
// Step 4 adds the silent-provisioning afterAuth hook in shopify.server.ts.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};
