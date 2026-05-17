import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CATEGORY_PRICE: Record<string, number> = {
  mun: 400,
  mun_comedy_general: 500,
  mun_comedy_fanpit: 600,
};

const DELEGATE_FIELDS = [
  "name", "mobile", "email", "school", "class",
  "preference_1", "preference_2", "preference_3", "experience",
] as const;

async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${orderId}|${paymentId}`));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    if (!keySecret || !keyId) {
      return new Response(JSON.stringify({ error: "Razorpay keys not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const {
      delegation_type, category, delegates,
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      school_name,
    } = body || {};

    if (!["individual", "school"].includes(delegation_type)) {
      return new Response(JSON.stringify({ error: "Invalid delegation_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!(category in CATEGORY_PRICE)) {
      return new Response(JSON.stringify({ error: "Invalid category" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(delegates) || delegates.length === 0 || delegates.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid delegates" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof razorpay_order_id !== "string" || typeof razorpay_payment_id !== "string" || typeof razorpay_signature !== "string") {
      return new Response(JSON.stringify({ error: "Missing payment fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^pay_[A-Za-z0-9]{14}$/.test(razorpay_payment_id) || !/^order_[A-Za-z0-9]{14}$/.test(razorpay_order_id)) {
      return new Response(JSON.stringify({ error: "Invalid payment ID format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) HMAC signature check
    const sigOk = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, keySecret);
    if (!sigOk) {
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Fetch payment from Razorpay to confirm captured + amount
    const auth = btoa(`${keyId}:${keySecret}`);
    const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!payRes.ok) {
      return new Response(JSON.stringify({ error: "Could not verify payment with Razorpay" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const payment = await payRes.json();
    if (payment.order_id !== razorpay_order_id) {
      return new Response(JSON.stringify({ error: "Order/payment mismatch" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (payment.status !== "captured" && payment.status !== "authorized") {
      return new Response(JSON.stringify({ error: `Payment not captured (status: ${payment.status})` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expectedAmount = CATEGORY_PRICE[category] * delegates.length;
    if (Number(payment.amount) !== expectedAmount) {
      return new Response(JSON.stringify({ error: "Payment amount does not match expected category total" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Idempotency: refuse if a row already exists for this payment id
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existing, error: exErr } = await supabase
      .from("registrations")
      .select("id")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .limit(1);
    if (exErr) throw exErr;
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ success: true, alreadyRecorded: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4) Build rows (validate each delegate's required strings)
    const groupId = delegation_type === "school" ? crypto.randomUUID() : null;
    const perDelegate = Math.floor(expectedAmount / delegates.length);
    const nowIso = new Date().toISOString();

    const rows = delegates.map((d: any) => {
      const row: any = {
        razorpay_payment_id,
        amount_paid: perDelegate,
        paid_at: nowIso,
        delegation_type,
        delegation_group_id: groupId,
        category,
      };
      for (const f of DELEGATE_FIELDS) {
        const v = d?.[f];
        if (f === "experience") {
          row[f] = typeof v === "string" && v.length > 0 ? v.slice(0, 2000) : null;
        } else {
          if (typeof v !== "string" || v.trim().length === 0) {
            throw new Error(`Missing field: ${f}`);
          }
          row[f] = v.trim().slice(0, 500);
        }
      }
      if (delegation_type === "school") {
        if (typeof school_name !== "string" || school_name.trim().length === 0) {
          throw new Error("Missing school_name");
        }
        row.school = school_name.trim().slice(0, 500);
      }
      return row;
    });

    const { error: insErr } = await supabase.from("registrations").insert(rows);
    if (insErr) throw insErr;

    // 5) Fire thank-you email (don't block on failure)
    try {
      await supabase.functions.invoke("send-thank-you-email", {
        body: {
          recipients: rows.map((r: any) => ({ name: r.name, email: r.email })),
          paymentId: razorpay_payment_id,
          category,
        },
      });
    } catch (e) {
      console.error("thank-you email invoke failed", e);
    }

    return new Response(JSON.stringify({ success: true, count: rows.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-registration error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});