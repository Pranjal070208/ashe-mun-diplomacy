const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const CATEGORY_LABELS: Record<string, string> = {
  mun: "MUN",
  mun_comedy_general: "MUN + Comedy Night (General)",
  mun_comedy_fanpit: "MUN + Comedy Night (Fanpit)",
};

interface Recipient { name: string; email: string; }

const buildHtml = (name: string, oldCat: string, newCat: string, newPaymentId: string, newAmount: number, originalPaymentId: string) => `
  <div style="font-family: Arial, sans-serif; color:#1a1a1a; line-height:1.6; font-size:15px;">
    <p>Dear ${name},</p>
    <p>Your <strong>Ashe MUN</strong> registration has been successfully <strong>upgraded</strong>.</p>
    <table style="border-collapse:collapse;margin:14px 0;">
      <tr><td style="padding:6px 12px;color:#666;">Previous category</td><td style="padding:6px 12px;"><strong>${CATEGORY_LABELS[oldCat] || oldCat}</strong></td></tr>
      <tr><td style="padding:6px 12px;color:#666;">New category</td><td style="padding:6px 12px;"><strong>${CATEGORY_LABELS[newCat] || newCat}</strong></td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Upgrade payment ID</td><td style="padding:6px 12px;"><code>${newPaymentId}</code></td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Amount paid</td><td style="padding:6px 12px;"><strong>₹${(newAmount / 100).toFixed(2)}</strong></td></tr>
      <tr><td style="padding:6px 12px;color:#666;">Original payment ID</td><td style="padding:6px 12px;"><code>${originalPaymentId}</code></td></tr>
    </table>
    <p>Please keep both payment IDs for your records.</p>
    <p>If you have any questions, contact us at <a href="mailto:contact@ashemun.com">contact@ashemun.com</a>.</p>
    <p>Warm regards,<br/>Ashe MUN Secretariat</p>
  </div>
`;

const buildText = (name: string, oldCat: string, newCat: string, newPaymentId: string, newAmount: number, originalPaymentId: string) => `Dear ${name},

Your Ashe MUN registration has been successfully upgraded.

Previous category: ${CATEGORY_LABELS[oldCat] || oldCat}
New category: ${CATEGORY_LABELS[newCat] || newCat}
Upgrade payment ID: ${newPaymentId}
Amount paid: ₹${(newAmount / 100).toFixed(2)}
Original payment ID: ${originalPaymentId}

Please keep both payment IDs for your records.

If you have any questions, contact us at contact@ashemun.com.

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
    const oldCategory: string = String(body?.oldCategory || "mun");
    const newCategory: string = String(body?.newCategory || "");
    const newPaymentId: string = String(body?.newPaymentId || "");
    const newAmount: number = Number(body?.newAmount || 0);
    const originalPaymentId: string = String(body?.originalPaymentId || "");

    const valid = recipients.filter((r) => r && /\S+@\S+\.\S+/.test(r.email));
    if (valid.length === 0 || !newCategory || !newPaymentId) {
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
          subject: "Your Ashe MUN Registration Has Been Upgraded",
          html: buildHtml(name, oldCategory, newCategory, newPaymentId, newAmount, originalPaymentId),
          text: buildText(name, oldCategory, newCategory, newPaymentId, newAmount, originalPaymentId),
          reply_to: "contact@ashemun.com",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { console.error("Upgrade email failed", data); return { email: r.email, ok: false }; }
      return { email: r.email, ok: true, id: data?.id };
    }));

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-upgrade-email error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});