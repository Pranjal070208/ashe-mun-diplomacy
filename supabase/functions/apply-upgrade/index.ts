import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRICES: Record<string, number> = {
  mun: 400,
  mun_comedy_general: 500,
  mun_comedy_fanpit: 600,
};
const TIER: Record<string, number> = {
  mun: 1,
  mun_comedy_general: 2,
  mun_comedy_fanpit: 3,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { originalPaymentId, newCategory, newPaymentId, expectedAmount } = await req.json();
    if (!originalPaymentId || !newCategory || !newPaymentId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!(newCategory in PRICES)) {
      return new Response(JSON.stringify({ error: "Invalid category" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rows, error: fetchErr } = await supabase
      .from("registrations")
      .select("id, name, email, category, upgrade_category, delegation_type, refunded, refund_email_sent_at")
      .eq("razorpay_payment_id", String(originalPaymentId).trim());

    if (fetchErr) throw fetchErr;
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pid = String(originalPaymentId).trim();

    const sendRefundEmailOnce = async (
      refundedAmount: number,
      refundStatus: string,
      refundId: string,
      refundedAt: string,
    ) => {
      if (rows.some((r: any) => r.refund_email_sent_at)) return;
      try {
        await supabase.functions.invoke("send-refund-email", {
          body: {
            recipients: rows.map((r: any) => ({ name: r.name, email: r.email })),
            originalPaymentId: pid,
            refundId,
            refundedAmount,
            refundStatus,
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
    };

    // Block upgrade if already marked refunded locally
    if (rows.some((r: any) => r.refunded)) {
      // Best-effort: send refund email if not yet sent (fetch refund_id from Razorpay)
      try {
        const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
        const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
        const auth = btoa(`${keyId}:${keySecret}`);
        const refundsRes = await fetch(
          `https://api.razorpay.com/v1/payments/${encodeURIComponent(pid)}/refunds`,
          { headers: { Authorization: `Basic ${auth}` } },
        );
        if (refundsRes.ok) {
          const refundsBody: any = await refundsRes.json();
          const items: any[] = Array.isArray(refundsBody?.items) ? refundsBody.items : [];
          const latest = items.sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0))[0];
          if (latest) {
            await sendRefundEmailOnce(
              Number(latest.amount || 0),
              String(latest.status || "refunded"),
              String(latest.id || ""),
              new Date(Number(latest.created_at || 0) * 1000).toISOString(),
            );
          }
        }
      } catch (e) {
        console.error("refund fetch (locally refunded) failed", e);
      }
      return new Response(JSON.stringify({ error: "This payment has been refunded. Upgrade is not allowed." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Live refund check against Razorpay
    try {
      const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
      const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
      const auth = btoa(`${keyId}:${keySecret}`);
      const rzpRes = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(pid)}`,
        { headers: { Authorization: `Basic ${auth}` } },
      );
      if (rzpRes.ok) {
        const payment: any = await rzpRes.json();
        const amountRefunded = Number(payment.amount_refunded || 0);
        const refundStatus: string | null = payment.refund_status ?? null;
        if (amountRefunded > 0 || refundStatus === "partial" || refundStatus === "full") {
          // Fetch refund_id from refunds list
          let refundId = "";
          let refundCreatedAt = new Date().toISOString();
          try {
            const refundsRes = await fetch(
              `https://api.razorpay.com/v1/payments/${encodeURIComponent(pid)}/refunds`,
              { headers: { Authorization: `Basic ${auth}` } },
            );
            if (refundsRes.ok) {
              const refundsBody: any = await refundsRes.json();
              const items: any[] = Array.isArray(refundsBody?.items) ? refundsBody.items : [];
              const latest = items.sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0))[0];
              if (latest) {
                refundId = String(latest.id || "");
                if (latest.created_at) refundCreatedAt = new Date(Number(latest.created_at) * 1000).toISOString();
              }
            }
          } catch (e) {
            console.error("refund list fetch failed", e);
          }

          await supabase
            .from("registrations")
            .update({
              refunded: true,
              refunded_amount: amountRefunded,
              refunded_at: refundCreatedAt,
              refund_status: refundStatus || "refunded",
              refund_id: refundId || null,
            })
            .eq("razorpay_payment_id", pid);

          await sendRefundEmailOnce(amountRefunded, refundStatus || "refunded", refundId, refundCreatedAt);

          return new Response(
            JSON.stringify({ error: "This payment has been refunded. Upgrade is not allowed." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } else {
        console.warn("Razorpay refund check failed", rzpRes.status);
      }
    } catch (e) {
      console.error("Razorpay refund check error", e);
    }

    // Determine current effective category (upgrade_category if present, else category)
    const sample = rows[0];
    const currentCat = sample.upgrade_category || sample.category || "mun";
    if (!(currentCat in TIER) || TIER[newCategory] <= TIER[currentCat]) {
      return new Response(JSON.stringify({ error: "Not eligible for this upgrade" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const diff = PRICES[newCategory] - PRICES[currentCat];
    const groupSize = rows.length;
    const totalDiff = diff * groupSize;
    if (expectedAmount && Number(expectedAmount) !== totalDiff) {
      console.warn("expectedAmount mismatch", expectedAmount, totalDiff);
    }

    const upgradedAt = new Date().toISOString();
    const { error: updErr } = await supabase
      .from("registrations")
      .update({
        upgrade_category: newCategory,
        upgrade_payment_id: String(newPaymentId),
        upgrade_amount: totalDiff,
        upgraded_at: upgradedAt,
      })
      .eq("razorpay_payment_id", String(originalPaymentId).trim());
    if (updErr) throw updErr;

    // Fire upgrade email (don't block on failure)
    try {
      await supabase.functions.invoke("send-upgrade-email", {
        body: {
          recipients: rows.map((r: any) => ({ name: r.name, email: r.email })),
          oldCategory: currentCat,
          newCategory,
          newPaymentId,
          newAmount: totalDiff,
          originalPaymentId,
        },
      });
    } catch (e) {
      console.error("upgrade email invoke failed", e);
    }

    return new Response(JSON.stringify({ success: true, upgraded: groupSize, totalDiff }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("apply-upgrade error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});