import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/ashe-mun-logo.jpg";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Committees", to: "/committees" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/#contact" },
];

const Navbar = ({ onRegisterClick }: { onRegisterClick?: () => void }) => {
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
        <div className="container mx-auto px-6 relative flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="relative z-10 flex items-center gap-2">
            <img src={logo} alt="ASHE MUN logo" className="h-20 md:h-24 w-auto rounded-md" />
          </Link>

          <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
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
