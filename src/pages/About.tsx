import { Shield, Globe, Star } from "lucide-react";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import PageTransition from "@/components/PageTransition";

const secretariat = [
  { name: "Alexandra Chen", role: "Secretary-General", bio: "A passionate advocate for multilateral diplomacy and youth empowerment." },
  { name: "Daniel Okafor", role: "Deputy Secretary-General", bio: "Specializing in international security and conflict resolution." },
  { name: "Sophia Morales", role: "Director-General", bio: "Committed to fostering inclusive dialogue and innovative committee design." },
  { name: "James Whitfield", role: "Under-Secretary-General", bio: "Leading logistics and delegate affairs with operational excellence." },
];

const About = () => (
  <PageTransition>
    <PageHero title="About Ashe MUN" breadcrumb={[{ label: "Home", to: "/" }, { label: "About" }]} />

    {/* Our Story */}
    <section className="py-24">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
            <div className="w-full md:w-1/2 aspect-[4/3] bg-card rounded-xl border border-border relative overflow-hidden flex items-center justify-center flex-shrink-0">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary" />
              <span className="font-display text-3xl text-muted-foreground/30">Ashe MUN</span>
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
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
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Shield, title: "Our Mission", text: "To cultivate the next generation of global leaders through rigorous academic simulation, fostering skills in diplomacy, critical thinking, and collaborative problem-solving that transcend the conference hall." },
            { icon: Star, title: "Our Vision", text: "A world where every young person has the tools, confidence, and platform to engage meaningfully with global governance — turning informed dialogue into transformative action on the world stage." },
          ].map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <div className="glass-card p-8 h-full hover:border-primary/30 transition-all duration-300">
                <item.icon className="text-primary mb-4" size={32} />
                <h3 className="font-display text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Secretariat */}
    <section className="py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 section-glow opacity-20 pointer-events-none" />
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Our Secretariat</h2>
          <div className="w-24 h-0.5 bg-secondary mx-auto" />
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {secretariat.map((s, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300">
                <div className="w-20 h-20 rounded-full border-2 border-secondary/40 bg-card mx-auto mb-4 flex items-center justify-center">
                  <span className="font-display text-lg text-muted-foreground">{s.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <h4 className="font-heading font-semibold text-sm">{s.name}</h4>
                <p className="text-secondary text-xs font-heading uppercase tracking-wider mt-1 mb-3">{s.role}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{s.bio}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* Faculty Message */}
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="glass-card max-w-4xl mx-auto p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full border-4 border-secondary/30 bg-card flex-shrink-0 flex items-center justify-center">
              <span className="font-display text-2xl text-muted-foreground">FA</span>
            </div>
            <div>
              <p className="font-heading text-xs uppercase tracking-[0.3em] text-secondary mb-4">Faculty Advisor's Message</p>
              <blockquote className="font-display text-lg md:text-xl italic text-foreground/90 leading-relaxed mb-4">
                "Ashe MUN is more than an academic exercise — it is a transformative experience that challenges students to think beyond borders, negotiate with empathy, and lead with integrity. Watching our delegates grow into confident global citizens is the greatest reward of this endeavor."
              </blockquote>
              <p className="text-secondary font-heading text-sm">— Dr. Eleanor Vance, Faculty Advisor</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </PageTransition>
);

export default About;
