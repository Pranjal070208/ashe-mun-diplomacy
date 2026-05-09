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

const buildHtml = (name: string) => `
  <div style="font-family: Arial, sans-serif; color:#1a1a1a; line-height:1.6; font-size:15px;">
    <p>Dear ${name},</p>
    <p>Thank you for registering for <strong>Ashe MUN</strong>.</p>
    <p>We are excited to have you join us for an engaging and enriching Model United Nations experience. Your registration has been successfully received, and our team will review your application shortly.</p>
    <p>You will receive further updates regarding:</p>
    <ul>
      <li>Committee allotment</li>
      <li>Payment confirmation (if applicable)</li>
      <li>Event schedule</li>
      <li>Delegate guidelines and resources</li>
    </ul>
    <p>Please ensure that you regularly check your email for important announcements and updates from the Ashe MUN team.</p>
    <p>If you have any questions or require assistance, feel free to contact us at <a href="mailto:contact@ashemun.com">contact@ashemun.com</a>.</p>
    <p>We look forward to welcoming you to Ashe MUN.</p>
    <p>Warm regards,<br/>Ashe MUN Secretariat</p>
  </div>
`;

const buildText = (name: string) => `Dear ${name},

Thank you for registering for Ashe MUN.

We are excited to have you join us for an engaging and enriching Model United Nations experience. Your registration has been successfully received, and our team will review your application shortly.

You will receive further updates regarding:
• Committee allotment
• Payment confirmation (if applicable)
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
            html: buildHtml(name),
            text: buildText(name),
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