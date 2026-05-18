import LegalPage from "./LegalPage";

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy"
    path="/privacy-policy"
    sections={[
      { heading: "Information We Collect", body: "When you register for Ashe MUN 2026, we collect personal information such as your name, email address, phone number, institution, and committee preferences. Payment information is processed securely through our payment partner and is not stored on our servers." },
      { heading: "How We Use Your Information", body: "We use your information to process your registration, communicate updates about the conference, send confirmation and thank-you emails, and provide on-site delegate services. We do not sell or rent your personal data to third parties." },
      { heading: "Data Security", body: "We implement reasonable security measures to protect your information. Data is stored on secure servers and access is restricted to authorized organizers only." },
      { heading: "Third-Party Services", body: "We use trusted services (such as Razorpay for payments and Supabase for data storage) that have their own privacy practices. By using our website you also agree to their applicable terms." },
      { heading: "Your Rights", body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us at contact@ashemun.com." },
    ]}
  />
);

export default PrivacyPolicy;