import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_USERNAME = "ASAdmin";
const ADMIN_PASSWORD = "20@AdminAS@26";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { username, password, paymentId } = await req.json().catch(() => ({}));
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Collect distinct payment IDs to check
    let pids: string[] = [];
    if (paymentId && typeof paymentId === "string") {
      pids = [paymentId.trim()];
    } else {
      const { data, error } = await supabase
        .from("registrations")
        .select("razorpay_payment_id, refunded")
        .not("razorpay_payment_id", "is", null);
      if (error) throw error;
      const set = new Set<string>();
      for (const r of data || []) {
        if (r.razorpay_payment_id && !r.refunded) set.add(r.razorpay_payment_id);
      }
      pids = Array.from(set);
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const auth = btoa(`${keyId}:${keySecret}`);

    let checked = 0;
    let refundedFound = 0;
    const results: any[] = [];

    for (const pid of pids) {
      checked++;
      try {
        const rzpRes = await fetch(
          `https://api.razorpay.com/v1/payments/${encodeURIComponent(pid)}`,
          { headers: { Authorization: `Basic ${auth}` } },
        );
        if (!rzpRes.ok) {
          results.push({ paymentId: pid, ok: false, status: rzpRes.status });
          continue;
        }
        const payment: any = await rzpRes.json();
        const amountRefunded = Number(payment.amount_refunded || 0);
        const refundStatus: string | null = payment.refund_status ?? null;
        if (!(amountRefunded > 0 || refundStatus === "partial" || refundStatus === "full")) {
          results.push({ paymentId: pid, refunded: false });
          continue;
        }

        // Fetch refund_id
        let refundId = "";
        let refundCreatedAt = new Date().toISOString();
        try {
          const refundsRes = await fetch(
            `https://api.razorpay.com/v1/payments/${encodeURIComponent(pid)}/refunds`,
            { headers: { Authorization: `Basic ${auth}` } },
          );
          if (refundsRes.ok) {
            const body: any = await refundsRes.json();
            const items: any[] = Array.isArray(body?.items) ? body.items : [];
            const latest = items.sort((a, b) => Number(b.created_at || 0) - Number(a.created_at || 0))[0];
            if (latest) {
              refundId = String(latest.id || "");
              if (latest.created_at) refundCreatedAt = new Date(Number(latest.created_at) * 1000).toISOString();
            }
          }
        } catch (e) {
          console.error("refund list fetch failed", e);
        }

        const { data: rows, error: fetchErr } = await supabase
          .from("registrations")
          .select("id, name, email, category, upgrade_category, refund_email_sent_at")
          .eq("razorpay_payment_id", pid);
        if (fetchErr) throw fetchErr;

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

        refundedFound++;

        // Send email once
        const alreadySent = (rows || []).some((r: any) => r.refund_email_sent_at);
        if (!alreadySent && rows && rows.length > 0) {
          try {
            await supabase.functions.invoke("send-refund-email", {
              body: {
                recipients: rows.map((r: any) => ({ name: r.name, email: r.email })),
                originalPaymentId: pid,
                refundId,
                refundedAmount: amountRefunded,
                refundStatus: refundStatus || "refunded",
                category: rows[0]?.upgrade_category || rows[0]?.category,
                refundedAt: refundCreatedAt,
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

        results.push({ paymentId: pid, refunded: true, refundId, amountRefunded });
      } catch (e) {
        console.error("sync error for", pid, e);
        results.push({ paymentId: pid, ok: false, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, checked, refundedFound, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("sync-refunds error:", err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});