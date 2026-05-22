import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not set");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ok = await verifySignature(rawBody, signature, secret);
    if (!ok) {
      console.warn("Invalid Razorpay signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const event: string = payload?.event || "";
    console.log("Razorpay webhook event:", event);

    if (!event.startsWith("refund.")) {
      return new Response(JSON.stringify({ ignored: event }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const refund = payload?.payload?.refund?.entity;
    if (!refund) {
      return new Response(JSON.stringify({ error: "No refund entity" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pid: string = String(refund.payment_id || "");
    const refundId: string = String(refund.id || "");
    const amount: number = Number(refund.amount || 0);
    const status: string = String(refund.status || "refunded");
    const refundedAt = refund.created_at
      ? new Date(Number(refund.created_at) * 1000).toISOString()
      : new Date().toISOString();

    if (!pid) {
      return new Response(JSON.stringify({ error: "Missing payment_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rows, error: fetchErr } = await supabase
      .from("registrations")
      .select("id, name, email, category, upgrade_category, refund_email_sent_at")
      .eq("razorpay_payment_id", pid);
    if (fetchErr) throw fetchErr;

    if (!rows || rows.length === 0) {
      console.warn("No registration found for payment", pid);
      return new Response(JSON.stringify({ ok: true, matched: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get total refunded across all refunds for this payment from the payment entity if present,
    // else just use this refund's amount.
    const totalRefunded = Number(payload?.payload?.payment?.entity?.amount_refunded || amount);
    const refundStatusFromPayment: string | undefined = payload?.payload?.payment?.entity?.refund_status;

    await supabase
      .from("registrations")
      .update({
        refunded: true,
        refunded_amount: totalRefunded,
        refunded_at: refundedAt,
        refund_status: refundStatusFromPayment || status,
        refund_id: refundId,
      })
      .eq("razorpay_payment_id", pid);

    // Send email once
    const alreadySent = rows.some((r: any) => r.refund_email_sent_at);
    if (!alreadySent && (event === "refund.processed" || event === "refund.created")) {
      try {
        await supabase.functions.invoke("send-refund-email", {
          body: {
            recipients: rows.map((r: any) => ({ name: r.name, email: r.email })),
            originalPaymentId: pid,
            refundId,
            refundedAmount: totalRefunded,
            refundStatus: refundStatusFromPayment || status,
            category: rows[0]?.upgrade_category || rows[0]?.category,
            refundedAt,
          },
        });
        await supabase
          .from("registrations")
          .update({ refund_email_sent_at: new Date().toISOString() })
          .eq("razorpay_payment_id", pid);
      } catch (e) {
        console.error("refund email invoke failed", e);
      }
    }

    return new Response(JSON.stringify({ ok: true, event, paymentId: pid, refundId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("razorpay-webhook error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});