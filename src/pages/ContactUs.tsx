import { Mail, Phone, Instagram } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";

const ContactUs = () => {
  return (
    <PageTransition>
      <SEO
        title="Contact Us — Ashe MUN 2026"
        description="Get in touch with the Ashe MUN 2026 team. Email and phone contacts for delegate enquiries."
        path="/contact-us"
      />
      <PageHero title="Contact Us" breadcrumb={[{ label: "Home", to: "/" }, { label: "Contact" }]} />

      <section className="py-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 section-glow opacity-20 pointer-events-none" />
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 gradient-text">Get In Touch</h2>
            <div className="gradient-divider max-w-[120px] mx-auto" />
          </AnimatedSection>

          <div className="max-w-2xl mx-auto">
            <AnimatedSection delay={0.1}>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "contact@ashemun.com" },
                  { icon: Phone, label: "Arnav Awasthi", value: "+91 9569303507" },
                  { icon: Phone, label: "Shivam Ahuja", value: "+91 9044793344" },
                ].map((c, i) => (
                  <div key={i} className="glass-card p-5 flex items-center gap-4 hover:border-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <c.icon className="text-primary" size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">{c.label}</p>
                      <p className="text-sm text-foreground font-body">{c.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-4">
                  <a
                    href="https://www.instagram.com/ashemun.official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <Instagram size={16} />
                  </a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default ContactUs;