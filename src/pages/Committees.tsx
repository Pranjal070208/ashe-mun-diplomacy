import { useState } from "react";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import PageTransition from "@/components/PageTransition";

const committees = [
  { acronym: "UNSC", name: "United Nations Security Council", agenda: "Addressing the proliferation of autonomous weapons systems", difficulty: "Advanced", desc: "The premier crisis-response body of the United Nations, tasked with maintaining international peace and security. Delegates will navigate complex geopolitical dynamics while addressing the emergence of AI-driven warfare.", chair: "Victoria Ashworth" },
  { acronym: "UNGA", name: "United Nations General Assembly", agenda: "Reforming global financial architecture for developing nations", difficulty: "Intermediate", desc: "The main deliberative assembly representing all 193 member states. This committee will tackle systemic inequalities in international economic governance and propose actionable reforms.", chair: "Marcus Liu" },
  { acronym: "WHO", name: "World Health Organization", agenda: "Pandemic preparedness and equitable vaccine distribution", difficulty: "Intermediate", desc: "The leading authority on global health policy. Delegates will develop frameworks for ensuring no nation is left behind in the next public health emergency.", chair: "Dr. Amira Hassan" },
  { acronym: "DISEC", name: "Disarmament & International Security", agenda: "Nuclear non-proliferation in an era of shifting alliances", difficulty: "Advanced", desc: "The First Committee of the General Assembly dealing with disarmament and international security threats. Delegates confront the challenge of maintaining global non-proliferation norms.", chair: "Rajan Patel" },
  { acronym: "ICJ", name: "International Court of Justice", agenda: "Maritime boundary disputes in the South China Sea", difficulty: "Advanced", desc: "The principal judicial organ of the United Nations. Advocates and judges will present arguments and deliberate on matters of international law with binding authority.", chair: "Justice Elena Torres" },
  { acronym: "UNHRC", name: "UN Human Rights Council", agenda: "Digital surveillance and the right to privacy", difficulty: "Intermediate", desc: "The body responsible for promoting and protecting human rights around the globe. Delegates will balance national security imperatives with fundamental civil liberties.", chair: "Kwame Mensah" },
  { acronym: "AIPPM", name: "All India Political Parties Meet", agenda: "Federal restructuring and cooperative governance", difficulty: "Beginner", desc: "A specialized regional committee simulating India's diverse political landscape. Delegates represent national and regional parties to debate structural reform and governance.", chair: "Priya Sharma" },
  { acronym: "CC", name: "Crisis Committee", agenda: "Classified — revealed at committee session", difficulty: "Advanced", desc: "A fast-paced, high-stakes simulation where delegates respond to rapidly evolving scenarios in real time. Quick thinking, strategic alliances, and decisive action are essential.", chair: "Classified" },
];

const difficultyStyle: Record<string, string> = {
  Advanced: "bg-destructive/15 text-destructive border-destructive/20",
  Intermediate: "bg-primary/15 text-primary border-primary/20",
  Beginner: "bg-green-500/15 text-green-400 border-green-500/20",
};

const Committees = () => {
  const [selected, setSelected] = useState<typeof committees[0] | null>(null);

  return (
    <PageTransition>
      <PageHero title="Our Committees" breadcrumb={[{ label: "Home", to: "/" }, { label: "Committees" }]} />

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {committees.map((c, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="glass-card p-7 h-full flex flex-col group hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_8px_40px_hsl(190_80%_55%/0.08)]">
                  <h3 className="font-display text-3xl font-bold mb-1 gradient-text">{c.acronym}</h3>
                  <p className="font-heading text-sm text-muted-foreground mb-3">{c.name}</p>
                  <p className="text-secondary text-xs italic font-body mb-4 flex-grow">"{c.agenda}"</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-heading px-3 py-1.5 rounded-full border ${difficultyStyle[c.difficulty]}`}>
                      {c.difficulty}
                    </span>
                    <button
                      onClick={() => setSelected(c)}
                      className="text-xs font-heading text-primary hover:text-secondary transition-colors"
                    >
                      Learn More →
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-2xl flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-2xl w-full p-8 md:p-10 relative"
            >
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
              <h2 className="font-display text-4xl font-bold mb-1 gradient-text">{selected.acronym}</h2>
              <p className="font-heading text-sm text-muted-foreground mb-4">{selected.name}</p>
              <div className="gradient-divider mb-6" />
              <p className="text-secondary text-sm italic font-body mb-4">Agenda: "{selected.agenda}"</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-body">{selected.desc}</p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Chairperson</p>
                  <p className="text-sm font-heading">{selected.chair}</p>
                </div>
                <span className={`text-[10px] font-heading px-3 py-1.5 rounded-full border ${difficultyStyle[selected.difficulty]}`}>
                  {selected.difficulty}
                </span>
              </div>
              <button className="mt-6 w-full font-heading text-sm px-6 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-[0_0_30px_hsl(190_80%_55%/0.3)] transition-all flex items-center justify-center gap-2">
                <Download size={16} /> Download Study Guide
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Committees;
