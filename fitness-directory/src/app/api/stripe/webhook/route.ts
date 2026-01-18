import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Use service role client for webhook operations (bypasses RLS)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(supabase, event.data.object);
        break;
      }

      case "invoice.paid": {
        await handleInvoicePaid(supabase, event.data.object);
        break;
      }

      case "invoice.payment_failed": {
        await handlePaymentFailed(supabase, event.data.object);
        break;
      }

      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(supabase, event.data.object);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof getServiceClient>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
) {
  const fitnessCenterId = session.metadata?.fitness_center_id;
  const userId = session.metadata?.user_id;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!fitnessCenterId || !userId || !subscriptionId) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Get subscription details from Stripe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as any;
  const currentPeriodEnd = subscriptionData.current_period_end as number;

  // Create subscription record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: subError } = await (supabase as any)
    .from("subscriptions")
    .upsert({
      user_id: userId,
      fitness_center_id: fitnessCenterId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status: "active",
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
    });

  if (subError) {
    console.error("Error creating subscription record:", subError);
    throw subError;
  }

  // Update fitness center to premium
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: fcError } = await (supabase as any)
    .from("fitness_centers")
    .update({ subscription_tier: "premium" })
    .eq("id", fitnessCenterId);

  if (fcError) {
    console.error("Error updating fitness center tier:", fcError);
    throw fcError;
  }

  console.log(`Activated premium for fitness center: ${fitnessCenterId}`);
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof getServiceClient>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoice: any
) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  // Get subscription from Stripe to get current period end
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as any;
  const currentPeriodEnd = subscriptionData.current_period_end as number;

  // Update subscription record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("subscriptions")
    .update({
      status: "active",
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Error updating subscription after payment:", error);
  }

  console.log(`Renewed subscription: ${subscriptionId}`);
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof getServiceClient>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoice: any
) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  // Update subscription status to past_due
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Error updating subscription after failed payment:", error);
  }

  console.log(`Payment failed for subscription: ${subscriptionId}`);
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof getServiceClient>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any
) {
  const status = subscription.status === "active" ? "active" :
                 subscription.status === "past_due" ? "past_due" : "canceled";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("subscriptions")
    .update({
      status,
      current_period_end: new Date(
        (subscription.current_period_end as number) * 1000
      ).toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Error updating subscription:", error);
  }

  console.log(`Updated subscription: ${subscription.id} to status: ${status}`);
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof getServiceClient>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any
) {
  const fitnessCenterId = subscription.metadata?.fitness_center_id;

  // Update subscription status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: subError } = await (supabase as any)
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  if (subError) {
    console.error("Error updating canceled subscription:", subError);
  }

  // Downgrade fitness center to free
  if (fitnessCenterId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: fcError } = await (supabase as any)
      .from("fitness_centers")
      .update({ subscription_tier: "free" })
      .eq("id", fitnessCenterId);

    if (fcError) {
      console.error("Error downgrading fitness center:", fcError);
    }

    console.log(`Downgraded fitness center to free: ${fitnessCenterId}`);
  }
}
