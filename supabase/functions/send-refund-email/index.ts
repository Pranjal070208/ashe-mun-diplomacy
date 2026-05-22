const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const CATEGORY_LABELS: Record<string, string> = {
  mun: "MUN",
  mun_comedy_general: "MUN + Comedy Night (General)",
  mun_comedy_fanpit: "MUN + Comedy Night (Fanpit)",
};

interface Recipient { name: string; email: string; }

const fmtAmount = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

const buildHtml = (
  name: string,
  originalPaymentId: string,
  refundId: string,
  refundedAmount: number,
  refundStatus: string,
  category?: string,
  refundedAt?: string,
) => `
  <div style="font-family: Arial, sans-serif; color:#1a1a1a; line-height:1.6; font-size:15px;">
    <p>Dear ${name},</p>
    <p>We are writing to confirm that a <strong>refund</strong> has been processed against your <strong>Ashe MUN</strong> registration payment.</p>
    <table style="border-collapse:collapse;margin:14px 0;">
      ${category ? `<tr><td style="padding:6px 12px;color:#666;">Registered category</td><td style="padding:6px 12px;"><strong>${CATEGORY_LABELS[category] || category}</strong></td></tr>` : ""}
      <tr><td style="padding:6px 12px;color:#666;">Original payment ID</td><td style="padding:6px 12px;"><code>${originalPaymentId}</code></td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Refund ID</td><td style="padding:6px 12px;"><code>${refundId || "—"}</code></td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Refund amount</td><td style="padding:6px 12px;"><strong>${fmtAmount(refundedAmount)}</strong></td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Refund status</td><td style="padding:6px 12px;"><strong>${refundStatus}</strong></td></tr>
      ${refundedAt ? `<tr><td style="padding:6px 12px;color:#666;">Processed at</td><td style="padding:6px 12px;">${new Date(refundedAt).toUTCString()}</td></tr>` : ""}
    </table>
    <p>Please note: once a payment has been refunded, the associated registration is no longer eligible for upgrades or further changes.</p>
    <p>Refunds typically appear in your account within 5–7 working days, depending on your bank.</p>
    <p>If you have any questions about this refund, please contact us at <a href="mailto:contact@ashemun.com">contact@ashemun.com</a> and reference the Refund ID above.</p>
    <p>Warm regards,<br/>Ashe MUN Secretariat</p>
  </div>
`;

const buildText = (
  name: string,
  originalPaymentId: string,
  refundId: string,
  refundedAmount: number,
  refundStatus: string,
  category?: string,
  refundedAt?: string,
) => `Dear ${name},

We are writing to confirm that a refund has been processed against your Ashe MUN registration payment.

${category ? `Registered category: ${CATEGORY_LABELS[category] || category}\n` : ""}Original payment ID: ${originalPaymentId}
Refund ID: ${refundId || "—"}
Refund amount: ${fmtAmount(refundedAmount)}
Refund status: ${refundStatus}
${refundedAt ? `Processed at: ${new Date(refundedAt).toUTCString()}\n` : ""}
Please note: once a payment has been refunded, the associated registration is no longer eligible for upgrades or further changes.

Refunds typically appear in your account within 5–7 working days, depending on your bank.

If you have any questions about this refund, please contact us at contact@ashemun.com and reference the Refund ID above.

Warm regards,
Ashe MUN Secretariat`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) throw new Error("Email keys not configured");

    const body = await req.json().catch(() => ({}));
    const recipients: Recipient[] = Array.isArray(body?.recipients) ? body.recipients : [];
    const originalPaymentId: string = String(body?.originalPaymentId || "");
    const refundId: string = String(body?.refundId || "");
    const refundedAmount: number = Number(body?.refundedAmount || 0);
    const refundStatus: string = String(body?.refundStatus || "refunded");
    const category: string | undefined = body?.category;
    const refundedAt: string | undefined = body?.refundedAt;

    const valid = recipients.filter((r) => r && /\S+@\S+\.\S+/.test(r.email));
    if (valid.length === 0 || !originalPaymentId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.all(valid.map(async (r) => {
      const name = (r.name || "Delegate").trim() || "Delegate";
      const res = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: "Ashe MUN <contact@ashemun.com>",
          to: [r.email],
          subject: "Refund Processed for Your Ashe MUN Registration",
          html: buildHtml(name, originalPaymentId, refundId, refundedAmount, refundStatus, category, refundedAt),
          text: buildText(name, originalPaymentId, refundId, refundedAmount, refundStatus, category, refundedAt),
          reply_to: "contact@ashemun.com",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { console.error("Refund email failed", data); return { email: r.email, ok: false }; }
      return { email: r.email, ok: true, id: data?.id };
    }));

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-refund-email error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});