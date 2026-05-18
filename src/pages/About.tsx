import { Shield, Star } from "lucide-react";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";
import asheMunLogo from "@/assets/ashe-mun-logo.png";

const About = () => (
  <PageTransition>
    <SEO
      title="About — Ashe MUN"
      description="Learn about Ashe MUN: our story, mission, and vision. Named after Arthur Ashe, we bring delegates together to debate the issues shaping our future."
      path="/about"
    />
    <PageHero title="About Ashe MUN" breadcrumb={[{ label: "Home", to: "/" }, { label: "About" }]} />

    {/* Our Story */}
    <section className="py-24">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
            <div className="w-full md:w-1/2 aspect-[4/3] bg-card rounded-2xl border border-border relative overflow-hidden flex items-center justify-center flex-shrink-0">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl z-10" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-secondary/40 rounded-br-2xl z-10" />
              <img src={asheMunLogo} alt="Ashe MUN logo" className="w-full h-full object-contain p-4" />
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 gradient-text">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm font-body">
                <p>
                  Founded on the belief that young minds hold the key to solving the world's most complex challenges, Ashe MUN has grown from a modest gathering of forty delegates into one of the most anticipated Model United Nations conferences in the region.
                </p>
                <p>
                  Our conference is named after Arthur Ashe — a champion who transcended sport to become a global advocate for education, justice, and human rights. Like Ashe, we believe that true leadership is measured not by the power you hold, but by the change you inspire.
                </p>
                <p>
                  Each year, Ashe MUN brings together hundreds of delegates from diverse backgrounds to deliberate on the issues that shape our collective future — from climate action and nuclear disarmament to digital governance and humanitarian crises.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Shield, title: "Our Mission", text: "To cultivate the next generation of global leaders through rigorous academic simulation, fostering skills in diplomacy, critical thinking, and collaborative problem-solving that transcend the conference hall." },
            { icon: Star, title: "Our Vision", text: "A world where every young person has the tools, confidence, and platform to engage meaningfully with global governance — turning informed dialogue into transformative action on the world stage." },
          ].map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <div className="glass-card p-8 h-full hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_8px_40px_hsl(190_80%_55%/0.08)]">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-display text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-body">{item.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  </PageTransition>
);

export default About;
