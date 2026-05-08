import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Mic, Scale, Handshake, Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Youtube, Send } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Marquee from "@/components/Marquee";
import PageTransition from "@/components/PageTransition";
import RegistrationModal from "@/components/RegistrationModal";
import heroBgVideo from "@/assets/hero-bg.mp4";

const features = [
  { icon: Globe, title: "Global Network", desc: "Connect with delegates from institutions across the nation and build lasting relationships." },
  { icon: Mic, title: "Expert Speakers", desc: "Learn from seasoned diplomats and thought leaders shaping the global discourse." },
  { icon: Scale, title: "Intense Debates", desc: "Engage in rigorous procedure on the most pressing international issues." },
  { icon: Handshake, title: "Negotiation Skills", desc: "Master consensus-building, bloc formation, and resolution drafting." },
];

function Countdown() {
  const target = new Date("2026-08-15T00:00:00").getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const units = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ];

  return (
    <section className="relative py-16 bg-surface">
      <div className="container mx-auto px-6 text-center">
        <p className="font-heading text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">Countdown to</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold gradient-text mb-10">Ashe MUN 2026</h2>
        <div className="flex items-center justify-center gap-3 md:gap-6">
          {units.map((u, i) => (
            <div key={i} className="glass-card px-3 py-5 md:px-8 md:py-6 min-w-[65px] md:min-w-[100px]">
              <div className="font-display text-3xl md:text-5xl font-bold gradient-text tabular-nums">
                {String(u.value).padStart(2, "0")}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mt-2 font-body">{u.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

  return <div ref={ref} className="font-display text-4xl md:text-5xl font-bold gradient-text">{count}{suffix}</div>;
}

const Index = () => {
  const location = useLocation();
  const [showRegistration, setShowRegistration] = useState(false);

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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        {/* Video plays behind everything; only visible through the ASHE MUN text cutout */}
        <video
          src={heroBgVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Background overlay with text-shaped cutout — video shows through the letters only */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <mask id="ashe-mun-cutout">
              <rect width="100%" height="100%" fill="white" />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="700"
                fill="black"
                style={{ fontSize: "clamp(80px, 18vw, 300px)", letterSpacing: "-0.02em" }}
              >
                ASHE MUN
              </text>
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="hsl(var(--background))" mask="url(#ashe-mun-cutout)" />
        </svg>
        <div className="absolute inset-0 noise-overlay pointer-events-none z-[2]" />
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-[2]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none z-[2]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center px-6 max-w-4xl mt-[28vh] sm:mt-[32vh]"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-secondary/30 text-secondary text-sm font-heading mb-8 bg-background/40 backdrop-blur-sm">
            August 15–17, 2026
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowRegistration(true)}
              className="font-heading text-sm px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-[0_0_40px_hsl(190_80%_55%/0.3)] transition-all duration-300 hover:scale-105"
            >
              Register Now
            </button>
            <Link
              to="/about"
              className="font-heading text-sm px-8 py-3.5 rounded-full border border-border text-foreground hover:border-primary/50 hover:text-primary transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Countdown */}
      <Countdown />

      {/* Stats */}
      <section className="relative py-12 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: 400, suffix: "+", label: "Delegates" },
              { value: 8, suffix: "", label: "Committees" },
              { value: 3, suffix: "", label: "Days" },
            ].map((s, i) => (
              <div key={i} className={`${i > 0 ? "md:border-l md:border-border" : ""}`}>
                <Counter target={s.value} suffix={s.suffix} />
                <p className="font-body text-xs text-muted-foreground mt-2 uppercase tracking-wider">{s.label}</p>
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
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 gradient-text">Why Ashe MUN?</h2>
            <div className="gradient-divider max-w-[120px] mx-auto" />
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="glass-card p-7 h-full group hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_8px_40px_hsl(190_80%_55%/0.1)]">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <f.icon className="text-primary" size={22} />
                  </div>
                  <h4 className="font-heading text-base font-semibold mb-2">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-body">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Itinerary */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-primary mb-4">Itinerary</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold gradient-text mb-4 leading-[1.2] pb-2">Coming Soon</h2>
            <div className="gradient-divider max-w-[120px] mx-auto" />
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
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 gradient-text">Get In Touch</h2>
            <div className="gradient-divider max-w-[120px] mx-auto" />
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <AnimatedSection delay={0.1}>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "contact@ashemun.com" },
                  { icon: Phone, label: "Phone", value: "+91 9874563210" },
                  { icon: MapPin, label: "Location", value: "ABC XYZ, Kanpur" },
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
                  {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                      <Icon size={16} />
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
                    className="w-full px-5 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                ))}
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-5 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                />
                <button className="w-full font-heading text-sm px-6 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-[0_0_40px_hsl(190_80%_55%/0.3)] transition-all duration-300 flex items-center justify-center gap-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            </AnimatedSection>
          </div>
        </div>
      </section>
      <RegistrationModal open={showRegistration} onClose={() => setShowRegistration(false)} />
    </PageTransition>
  );
};

export default Index;
