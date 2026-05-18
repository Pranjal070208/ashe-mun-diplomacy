import LegalPage from "./LegalPage";

const TermsAndConditions = () => (
  <LegalPage
    title="Terms & Conditions"
    path="/terms-and-conditions"
    sections={[
      { heading: "Acceptance of Terms", body: "By registering for or attending Ashe MUN 2026, you agree to abide by these Terms & Conditions, the conference code of conduct, and all rules of procedure communicated by the organizers." },
      { heading: "Eligibility", body: "Ashe MUN 2026 is open to students and delegates as defined in the registration form. Organizers reserve the right to verify eligibility and reject any registration that does not meet the criteria." },
      { heading: "Code of Conduct", body: "Delegates are expected to maintain decorum, dress in formal attire during sessions, and treat fellow delegates, organizers, and staff with respect. Any form of harassment, plagiarism, or disruptive behavior may result in removal from the conference without refund." },
      { heading: "Intellectual Property", body: "All content on this website, including text, logos, and graphics, is the property of Ashe MUN and may not be reproduced without permission. Position papers and resolutions submitted by delegates remain the intellectual property of their authors." },
      { heading: "Photography & Media", body: "By attending the conference, delegates consent to being photographed or recorded, and to the use of such media by Ashe MUN for promotional purposes." },
      { heading: "Limitation of Liability", body: "Ashe MUN, its organizers, and partners are not responsible for any personal loss, injury, or damage incurred during travel to, attendance at, or return from the conference." },
      { heading: "Changes to Terms", body: "Ashe MUN reserves the right to update these terms at any time. The most current version will always be available on this page." },
    ]}
  />
);

export default TermsAndConditions;