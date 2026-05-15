import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";

const categories = ["All", "Conferences", "Committees", "Social"] as const;

const images = [
  { src: "https://placehold.co/600x400/0a0f1a/22d3ee?text=Opening+Ceremony", cat: "Conferences", caption: "Opening Ceremony 2025" },
  { src: "https://placehold.co/600x600/0a0f1a/22d3ee?text=UNSC+Session", cat: "Committees", caption: "UNSC in Session" },
  { src: "https://placehold.co/400x600/0a0f1a/a78bfa?text=Delegate+Speech", cat: "Committees", caption: "Delegate Address" },
  { src: "https://placehold.co/600x400/0a0f1a/a78bfa?text=Networking+Gala", cat: "Social", caption: "Networking Gala" },
  { src: "https://placehold.co/600x600/0a0f1a/22d3ee?text=Panel+Discussion", cat: "Conferences", caption: "Expert Panel Discussion" },
  { src: "https://placehold.co/400x600/0a0f1a/22d3ee?text=Award+Ceremony", cat: "Conferences", caption: "Award Ceremony" },
  { src: "https://placehold.co/600x400/0a0f1a/a78bfa?text=Committee+Work", cat: "Committees", caption: "Working Paper Drafting" },
  { src: "https://placehold.co/600x600/0a0f1a/22d3ee?text=Group+Photo", cat: "Social", caption: "Delegate Group Photo" },
  { src: "https://placehold.co/400x600/0a0f1a/a78bfa?text=Debate+Floor", cat: "Committees", caption: "General Assembly Debate" },
  { src: "https://placehold.co/600x400/0a0f1a/22d3ee?text=Cultural+Night", cat: "Social", caption: "Cultural Night" },
  { src: "https://placehold.co/600x600/0a0f1a/a78bfa?text=Keynote+Speaker", cat: "Conferences", caption: "Keynote Address" },
  { src: "https://placehold.co/400x600/0a0f1a/22d3ee?text=Crisis+Committee", cat: "Committees", caption: "Crisis Committee" },
  { src: "https://placehold.co/600x400/0a0f1a/a78bfa?text=Closing+Session", cat: "Conferences", caption: "Closing Session 2025" },
  { src: "https://placehold.co/600x600/0a0f1a/22d3ee?text=Bloc+Formation", cat: "Committees", caption: "Bloc Negotiations" },
  { src: "https://placehold.co/600x400/0a0f1a/a78bfa?text=Social+Event", cat: "Social", caption: "After-Hours Social" },
  { src: "https://placehold.co/400x600/0a0f1a/22d3ee?text=Registration", cat: "Conferences", caption: "Registration Desk" },
];

const Gallery = () => {
  const [filter, setFilter] = useState<typeof categories[number]>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === "All" ? images : images.filter((img) => img.cat === filter);

  const navigate = (dir: number) => {
    if (lightbox === null) return;
    const next = lightbox + dir;
    if (next >= 0 && next < filtered.length) setLightbox(next);
  };

  return (
    <PageTransition>
      <SEO
        title="Gallery — Ashe MUN"
        description="Photos from past Ashe MUN conferences: opening ceremonies, committee sessions, delegate addresses, and social events."
        path="/gallery"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Ashe MUN Gallery",
          description: "Photos from past Ashe MUN conferences.",
          image: images.map((img) => img.src),
        }}
      />
      <PageHero title="Gallery" breadcrumb={[{ label: "Home", to: "/" }, { label: "Gallery" }]} />

      <section className="py-24">
        <div className="container mx-auto px-6">
          {/* Filters */}
          <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`font-heading text-xs tracking-wide px-5 py-2.5 rounded-full border transition-all duration-300 ${
                  filter === c ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl mx-auto">
            {filtered.map((img, i) => (
              <AnimatedSection key={img.src} delay={i * 0.05}>
                <div
                  className="relative mb-4 rounded-2xl overflow-hidden cursor-pointer group break-inside-avoid"
                  onClick={() => setLightbox(i)}
                >
                  <img src={img.src} alt={img.caption} className="w-full transition-all duration-500 group-hover:brightness-110 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Expand className="text-primary" size={28} />
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground z-10">
              <X size={24} />
            </button>

            {lightbox > 0 && (
              <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-4 md:left-8 text-muted-foreground hover:text-foreground z-10">
                <ChevronLeft size={32} />
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-4 md:right-8 text-muted-foreground hover:text-foreground z-10">
                <ChevronRight size={32} />
              </button>
            )}

            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl max-h-[80vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={filtered[lightbox].src} alt={filtered[lightbox].caption} className="max-h-[70vh] rounded-2xl" />
              <p className="mt-4 text-sm text-muted-foreground font-heading">{filtered[lightbox].caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Gallery;
