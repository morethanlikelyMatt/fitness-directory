import { NextRequest, NextResponse } from "next/server";
import { stripe, getPriceId, type PricingInterval } from "@/lib/stripe";
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
        { error: "You must be logged in to subscribe" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fitnessCenterId, interval = "monthly" } = body as {
      fitnessCenterId: string;
      interval?: PricingInterval;
    };

    if (!fitnessCenterId) {
      return NextResponse.json(
        { error: "Fitness center ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns this fitness center
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: fitnessCenter, error: fcError } = await (supabase as any)
      .from("fitness_centers")
      .select("id, name, owner_id, subscription_tier")
      .eq("id", fitnessCenterId)
      .single();

    if (fcError || !fitnessCenter) {
      return NextResponse.json(
        { error: "Fitness center not found" },
        { status: 404 }
      );
    }

    if (fitnessCenter.owner_id !== user.id) {
      return NextResponse.json(
        { error: "You do not own this fitness center" },
        { status: 403 }
      );
    }

    if (fitnessCenter.subscription_tier === "premium") {
      return NextResponse.json(
        { error: "This fitness center already has a premium subscription" },
        { status: 400 }
      );
    }

    // Check for existing Stripe customer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingSubscription } = await (supabase as any)
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: getPriceId(interval),
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/owner/listings/${fitnessCenterId}?subscription=success`,
      cancel_url: `${appUrl}/owner/listings/${fitnessCenterId}?subscription=canceled`,
      metadata: {
        fitness_center_id: fitnessCenterId,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          fitness_center_id: fitnessCenterId,
          user_id: user.id,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
