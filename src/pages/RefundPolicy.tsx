import LegalPage from "./LegalPage";

const RefundPolicy = () => (
  <LegalPage
    title="Refund Policy"
    path="/refund-policy"
    sections={[
      { heading: "Registration Fees", body: "All registration fees paid for Ashe MUN 2026 are generally non-refundable, as they are used to plan logistics, materials, venue, and delegate kits in advance." },
      { heading: "Cancellation by Delegate", body: "If you are unable to attend, you may request a refund up to 14 days before the conference start date. Refunds requested within this window may be eligible for a partial refund (up to 50%) after deducting processing fees. No refunds will be issued for cancellations made less than 14 days before the conference." },
      { heading: "Cancellation by Organizers", body: "In the unlikely event that Ashe MUN 2026 is cancelled by the organizers, registered delegates will receive a full refund of their registration fee. The organizers are not liable for any additional costs such as travel or accommodation." },
      { heading: "Processing Time", body: "Approved refunds are processed within 7–14 business days to the original payment method." },
      { heading: "How to Request a Refund", body: "Email contact@ashemun.com with your registration ID and reason for refund. Our team will respond within 3–5 business days." },
    ]}
  />
);

export default RefundPolicy;