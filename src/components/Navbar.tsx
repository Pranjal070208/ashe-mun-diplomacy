import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Committees", to: "/committees" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleContactClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="font-display text-2xl md:text-3xl font-bold tracking-[0.15em] relative">
            ASHE MUN
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary/60" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={l.to === "/#contact" ? handleContactClick : undefined}
                className={`font-heading text-sm tracking-wide uppercase transition-colors hover:text-primary ${
                  location.pathname === l.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Link
            to="/#contact"
            onClick={handleContactClick}
            className="hidden md:inline-flex font-heading text-sm px-5 py-2.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:shadow-[0_0_20px_hsl(201_55%_56%/0.3)] transition-all duration-300"
          >
            Register Now
          </Link>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={l.to === "/#contact" ? handleContactClick : undefined}
                className="font-display text-3xl tracking-wider hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/#contact"
              onClick={handleContactClick}
              className="font-heading text-sm px-6 py-3 rounded-lg bg-primary/20 text-primary border border-primary/30"
            >
              Register Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
