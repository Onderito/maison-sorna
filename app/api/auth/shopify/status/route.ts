import { NextResponse } from "next/server";

import { getCustomerProfile } from "@/app/lib/shopify/customers";

export async function GET() {
  try {
    const customer = await getCustomerProfile();

    return NextResponse.json(
      { authenticated: customer !== null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Impossible de vérifier la session client Shopify.", error);

    return NextResponse.json(
      { authenticated: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
