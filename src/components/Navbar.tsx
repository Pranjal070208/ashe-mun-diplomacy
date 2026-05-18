import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/ashe-mun-logo.jpg";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Committees", to: "/committees" },
  { label: "Contact", to: "/#contact" },
];

const Navbar = ({ onRegisterClick }: { onRegisterClick?: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactActive, setContactActive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Mark Contact as active when hash is #contact, or when contact section is in view on home.
  useEffect(() => {
    const evaluate = () => {
      if (location.hash === "#contact") {
        setContactActive(true);
        return;
      }
      if (location.pathname === "/") {
        const el = document.getElementById("contact");
        if (el) {
          const r = el.getBoundingClientRect();
          const vh = window.innerHeight;
          setContactActive(r.top < vh * 0.6 && r.bottom > vh * 0.2);
          return;
        }
      }
      setContactActive(false);
    };
    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("hashchange", evaluate);
    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("hashchange", evaluate);
    };
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
        <div className="container mx-auto px-6 relative flex items-center justify-between h-24 md:h-28">
          <Link to="/" className="relative z-10 flex items-center gap-2">
            <img src={logo} alt="ASHE MUN logo" className="h-20 md:h-24 w-auto rounded-md object-contain" />
          </Link>

          <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-muted/50 backdrop-blur-xl border border-border">
              {navLinks.map((l) => {
                const isContact = l.to === "/#contact";
                const isActive = isContact
                  ? contactActive
                  : location.pathname === l.to && !contactActive;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={isContact ? handleContactClick : undefined}
                    className={`font-heading text-xs tracking-wide px-4 py-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>

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
            <button
              onClick={onRegisterClick}
              className="font-heading text-sm px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold"
            >
              Register Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
