// Supabase Edge Function: create-razorpay-order
// Creates a Razorpay order with payment_capture: 1 (auto-capture).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount); // amount in paise
    const currency = (body?.currency as string) || "INR";
    const receipt = (body?.receipt as string) || `rcpt_${Date.now()}`;
    const notes = (body?.notes as Record<string, string>) || {};

    if (!Number.isInteger(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount (must be positive integer in paise)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const auth = btoa(`${keyId}:${keySecret}`);

    const rpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        payment_capture: 1, // auto-capture
        notes,
      }),
    });

    const data = await rpRes.json();

    if (!rpRes.ok) {
      console.error("Razorpay order creation failed:", data);
      return new Response(
        JSON.stringify({ error: data?.error?.description || "Failed to create order", details: data }),
        { status: rpRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        order_id: data.id,
        amount: data.amount,
        currency: data.currency,
        key_id: keyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("create-razorpay-order error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
