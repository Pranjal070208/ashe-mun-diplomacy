import { Shield, Star, HeartHandshake } from "lucide-react";
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
                  Founded on the belief that exposure is the best way of fostering intellectual leadership, Ashe Model United Nations is a premier student-led diplomatic conference dedicated to nurturing young minds, spreading global awareness, and seeding qualities amidst the leaders of tomorrow. Founded upon the three pillars of <em>Initiate — Integrate — Implement</em>, Ashe MUN is not just a symposium but a platform where students engage in meaningful debates, tackling global issues while developing a skillset for the coming age.
                </p>
                <p>
                  The conference aspires to create an intellectual environment where delegates are encouraged to exuberate their verbosity, guide their train of thoughts critically, negotiate and lead with deep values of integrity. Through rigorous committee sessions vetted to diplomatic perfection, participants gain exposure to global crises, public speaking, cooperation and leadership.
                </p>
                <p>
                  Inspired by the words of Jawaharlal Nehru at the United Nations — <em>"Peace is not a relationship of nations; it is a condition of mind brought about by serenity of the soul."</em> — Ashe MUN strives to uphold the ideals of mutual respect, peaceful dialogue, and global cooperation.
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
            { icon: Shield, title: "Our Mission", text: "Our mission extends beyond debate. We seek to nurture a generation of young leaders of tomorrow by addressing global challenges with intellect and determination. The conference promotes academic excellence, problem-solving skills, and the spirit of cooperation." },
            { icon: Star, title: "Our Vision", text: "Our vision is to orchestrate a community where every member has the credence, opportunity, and platform for self-expression. This is ASHE MUN — a conference that leads." },
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

    {/* Our Scheme */}
    <section className="py-24">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="glass-card p-10 max-w-3xl mx-auto text-center hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 mx-auto">
              <HeartHandshake className="text-primary" size={24} />
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 gradient-text">Our Scheme</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-body">
              We believe in equitable opportunities. For every 20 paid delegate registrations, we offer a complimentary registration slot to one student from a government institution.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </PageTransition>
);

export default About;
