import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  breadcrumb: { label: string; to?: string }[];
}

const PageHero = ({ title, breadcrumb }: Props) => (
  <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 noise-overlay pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 right-0 gradient-divider" />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center z-10"
    >
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4 font-heading">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={12} />}
            {b.to ? (
              <Link to={b.to} className="hover:text-primary transition-colors">{b.label}</Link>
            ) : (
              <span className="text-primary">{b.label}</span>
            )}
          </span>
        ))}
      </div>
      <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight gradient-text">{title}</h1>
    </motion.div>
  </section>
);

export default PageHero;
