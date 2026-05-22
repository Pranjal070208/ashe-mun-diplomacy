import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { paymentId } = await req.json();
    if (!paymentId || typeof paymentId !== "string") {
      return new Response(JSON.stringify({ error: "paymentId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("registrations")
      .select("id, name, email, mobile, school, class, delegation_type, delegation_group_id, category, upgrade_category, razorpay_payment_id, amount_paid, refunded, refunded_amount, refunded_at, refund_status, refund_id")
      .eq("razorpay_payment_id", paymentId.trim())
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ found: false }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (data.some((row: any) => row.refunded)) {
      return new Response(JSON.stringify({
        found: true,
        blocked: true,
        message: "This payment has been refunded. Upgrade is not allowed.",
        delegates: data,
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ found: true, delegates: data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("lookup-registration error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});