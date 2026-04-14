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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-background/70 backdrop-blur-2xl border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="font-display text-xl md:text-2xl font-bold tracking-tight relative gradient-text">
            ASHE MUN
          </Link>

          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-muted/50 backdrop-blur-xl border border-border">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={l.to === "/#contact" ? handleContactClick : undefined}
                  className={`font-heading text-xs tracking-wide px-4 py-2 rounded-full transition-all duration-300 ${
                    location.pathname === l.to
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/#contact"
            onClick={handleContactClick}
            className="hidden md:inline-flex font-heading text-xs px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-[0_0_30px_hsl(190_80%_55%/0.3)] hover:scale-105 transition-all duration-300"
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
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-6"
          >
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={l.to === "/#contact" ? handleContactClick : undefined}
                className="font-display text-2xl tracking-tight hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/#contact"
              onClick={handleContactClick}
              className="font-heading text-sm px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold"
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
