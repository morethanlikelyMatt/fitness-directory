import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fitnessCenterId } = body as { fitnessCenterId: string };

    if (!fitnessCenterId) {
      return NextResponse.json(
        { error: "Fitness center ID is required" },
        { status: 400 }
      );
    }

    // Get subscription with stripe customer ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription, error: subError } = await (supabase as any)
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("fitness_center_id", fitnessCenterId)
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/owner/listings/${fitnessCenterId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
