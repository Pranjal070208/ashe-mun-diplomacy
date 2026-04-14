import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Mic, Scale, Handshake, Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Youtube, Send } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import AnimatedSection from "@/components/AnimatedSection";
import Marquee from "@/components/Marquee";
import PageTransition from "@/components/PageTransition";

const stats = [
  { value: 400, suffix: "+", label: "Delegates" },
  { value: 8, suffix: "", label: "Committees" },
  { value: 3, suffix: "", label: "Days" },
  { value: 50, suffix: "+", label: "Schools" },
];

const features = [
  { icon: Globe, title: "Networking Opportunities", desc: "Connect with like-minded delegates from institutions across the nation and forge lasting professional relationships." },
  { icon: Mic, title: "Expert Speakers", desc: "Gain insights from seasoned diplomats, policy makers, and thought leaders who shape the global discourse." },
  { icon: Scale, title: "Intense Debates", desc: "Engage in rigorous parliamentary procedure on the most pressing issues facing the international community." },
  { icon: Handshake, title: "Diplomatic Negotiation", desc: "Master the art of consensus-building, bloc formation, and resolution drafting in realistic simulations." },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="font-display text-4xl md:text-5xl font-bold text-secondary">{count}{suffix}</div>;
}

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#contact") {
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        {/* Subtle globe wireframe */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border-2 border-primary" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full border border-primary" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <p className="font-heading text-xs md:text-sm tracking-[0.4em] uppercase text-secondary mb-6">
            Model United Nations
          </p>
          <h1 className="font-display text-7xl md:text-[120px] font-bold tracking-wide leading-none mb-6">
            Ashe MUN
          </h1>
          <p className="font-heading text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Deliberate with Clarity. Debate with Passion. Deliver with Purpose.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/30 text-secondary text-sm font-heading mb-10">
            August 15–17, 2026
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/#contact"
              className="font-heading text-sm px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(201_55%_56%/0.4)] transition-all duration-300"
            >
              Register Now
            </Link>
            <Link
              to="/about"
              className="font-heading text-sm px-8 py-3 rounded-lg border border-border text-foreground hover:border-primary/50 hover:text-primary transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats */}
      <section className="relative py-12 border-y border-border bg-surface">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i} className={`${i > 0 ? "md:border-l md:border-secondary/20" : ""}`}>
                <Counter target={s.value} suffix={s.suffix} />
                <p className="font-heading text-sm text-muted-foreground mt-2 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Ashe MUN */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 section-glow opacity-30 pointer-events-none" />
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Why Ashe MUN?</h2>
            <div className="w-24 h-0.5 bg-secondary mx-auto" />
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="glass-card p-6 h-full group hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_hsl(201_55%_56%/0.1)]">
                  <f.icon className="text-primary mb-4" size={28} />
                  <h4 className="font-heading text-lg font-semibold mb-2">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Secretary-General Message */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">
              <div className="w-48 h-48 rounded-full border-4 border-secondary/40 bg-card flex-shrink-0 flex items-center justify-center">
                <span className="font-display text-4xl text-muted-foreground">SG</span>
              </div>
              <div>
                <p className="font-heading text-xs uppercase tracking-[0.3em] text-secondary mb-4">
                  A Message from Our Secretary-General
                </p>
                <blockquote className="font-display text-xl md:text-2xl italic text-foreground/90 leading-relaxed mb-4">
                  "At Ashe MUN, we believe that the leaders of tomorrow are shaped by the conversations of today. This conference is more than a simulation — it is a crucible for the ideas, alliances, and convictions that will define our generation's response to global challenges."
                </blockquote>
                <p className="text-secondary font-heading text-sm">— The Secretary-General, Ashe MUN 2026</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Marquee */}
      <Marquee />

      {/* Contact */}
      <section id="contact" className="py-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 section-glow opacity-20 pointer-events-none" />
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
            <div className="w-24 h-0.5 bg-secondary mx-auto" />
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <AnimatedSection delay={0.1}>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "contact@ashemun.org" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                  { icon: MapPin, label: "Location", value: "Ashe Convention Center, New York" },
                ].map((c, i) => (
                  <div key={i} className="glass-card p-5 flex items-center gap-4">
                    <c.icon className="text-primary flex-shrink-0" size={22} />
                    <div>
                      <p className="text-xs text-secondary font-heading uppercase tracking-wider">{c.label}</p>
                      <p className="text-sm text-foreground">{c.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {["Name", "Email", "Phone"].map((f) => (
                  <input
                    key={f}
                    type={f === "Email" ? "email" : "text"}
                    placeholder={f}
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                ))}
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
                <button className="w-full font-heading text-sm px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(201_55%_56%/0.3)] transition-all duration-300 flex items-center justify-center gap-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Index;
