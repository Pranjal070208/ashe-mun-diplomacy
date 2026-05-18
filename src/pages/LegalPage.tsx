import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";

interface Props {
  title: string;
  path: string;
  sections: { heading: string; body: string }[];
}

const LegalPage = ({ title, path, sections }: Props) => (
  <PageTransition>
    <SEO title={`${title} — Ashe MUN 2026`} description={`${title} for Ashe MUN 2026.`} path={path} />
    <PageHero title={title} breadcrumb={[{ label: "Home", to: "/" }, { label: title }]} />
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <AnimatedSection>
          <div className="space-y-8 text-muted-foreground font-body text-sm leading-relaxed">
            {sections.map((s, i) => (
              <div key={i}>
                <h2 className="font-heading text-base text-foreground uppercase tracking-wider mb-3">{s.heading}</h2>
                <p className="whitespace-pre-line">{s.body}</p>
              </div>
            ))}
            <p className="text-xs pt-6 border-t border-border">Last updated: May 2026. For questions, email contact@ashemun.com.</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </PageTransition>
);

export default LegalPage;