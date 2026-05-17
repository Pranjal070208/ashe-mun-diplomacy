const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

interface Recipient {
  name: string;
  email: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  mun: "MUN",
  mun_comedy_general: "MUN + Comedy Night (General)",
  mun_comedy_fanpit: "MUN + Comedy Night (Fanpit)",
};

const buildHtml = (name: string, paymentId?: string, category?: string) => `
  <div style="font-family: Arial, sans-serif; color:#1a1a1a; line-height:1.6; font-size:15px;">
    <p>Dear ${name},</p>
    <p>Thank you for registering for <strong>Ashe MUN</strong>.</p>
    <p>We are excited to have you join us for an engaging and enriching Model United Nations experience. Your registration has been successfully received, and our team will review your application shortly.</p>
    ${category ? `<p><strong>Registered Category:</strong> ${CATEGORY_LABELS[category] || category}</p>` : ""}
    ${paymentId ? `<p style="background:#f4f6f8;padding:12px 14px;border-radius:8px;"><strong>Your Payment ID:</strong> <code style="font-family:monospace;">${paymentId}</code><br/><span style="font-size:13px;color:#444;">Please save this ID. You can use it later to <strong>upgrade your registration</strong> to a higher category from the registration page.</span></p>` : ""}
    <p>You will receive further updates regarding:</p>
    <ul>
      <li>Committee allotment</li>
      <li>Payment confirmation</li>
      <li>Event schedule</li>
      <li>Delegate guidelines and resources</li>
    </ul>
    <p>Please ensure that you regularly check your email for important announcements and updates from the Ashe MUN team.</p>
    <p>If you have any questions or require assistance, feel free to contact us at <a href="mailto:contact@ashemun.com">contact@ashemun.com</a>.</p>
    <p>We look forward to welcoming you to Ashe MUN.</p>
    <p>Warm regards,<br/>Ashe MUN Secretariat</p>
  </div>
`;

const buildText = (name: string, paymentId?: string, category?: string) => `Dear ${name},

Thank you for registering for Ashe MUN.

We are excited to have you join us for an engaging and enriching Model United Nations experience. Your registration has been successfully received, and our team will review your application shortly.
${category ? `\nRegistered Category: ${CATEGORY_LABELS[category] || category}\n` : ""}${paymentId ? `\nYour Payment ID: ${paymentId}\nPlease save this ID. You can use it later to upgrade your registration to a higher category from the registration page.\n` : ""}
You will receive further updates regarding:
• Committee allotment
• Payment confirmation
• Event schedule
• Delegate guidelines and resources

Please ensure that you regularly check your email for important announcements and updates from the Ashe MUN team.

If you have any questions or require assistance, feel free to contact us at contact@ashemun.com.

We look forward to welcoming you to Ashe MUN.

Warm regards,
Ashe MUN Secretariat`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const body = await req.json().catch(() => ({}));
    const paymentId: string | undefined = body?.paymentId;
    const category: string | undefined = body?.category;
    const recipients: Recipient[] = Array.isArray(body?.recipients)
      ? body.recipients
      : body?.email
      ? [{ name: String(body.name || "Delegate"), email: String(body.email) }]
      : [];

    const valid = recipients.filter(
      (r) => r && typeof r.email === "string" && /\S+@\S+\.\S+/.test(r.email)
    );
    if (valid.length === 0) {
      return new Response(JSON.stringify({ error: "No valid recipients" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.all(
      valid.map(async (r) => {
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
            subject: "Thank You for Registering for Ashe MUN",
            html: buildHtml(name, paymentId, category),
            text: buildText(name, paymentId, category),
            reply_to: "contact@ashemun.com",
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Resend send failed", res.status, data);
          return { email: r.email, ok: false, error: data };
        }
        return { email: r.email, ok: true, id: data?.id };
      })
    );

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-thank-you-email error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});