import { redirect, type LoaderFunctionArgs } from "react-router";

import { login } from "../shopify.server";

// Public landing route hit when the app is opened outside the Shopify admin.
// If a `shop` query param is present, hand off to the embedded app (OAuth).
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function Index() {
  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 48 }}>
      <h1>Beaconmon for Shopify</h1>
      <p>Know within 60 seconds when your store goes down, even when Shopify does.</p>
      <p>Install this app from the Shopify App Store to start monitoring your store.</p>
    </main>
  );
}
