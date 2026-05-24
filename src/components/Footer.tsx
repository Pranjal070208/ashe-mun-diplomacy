import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-surface pt-16 pb-8">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight mb-3 gradient-text">ASHE MUN</h3>
          <p className="text-muted-foreground text-sm leading-relaxed font-body">
            Initiate. Integrate. Implement.
          </p>
        </div>
        <div>
          <h5 className="font-heading text-xs uppercase tracking-wider text-primary mb-4">Pages</h5>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground font-body">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/committees" className="hover:text-primary transition-colors">Committees</Link>
            <Link to="/contact-us" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h5 className="font-heading text-xs uppercase tracking-wider text-primary mb-4">Support</h5>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground font-body">
            <a href="mailto:contact@ashemun.org" className="hover:text-primary transition-colors">Email Us</a>
          </div>
        </div>
        <div>
          <h5 className="font-heading text-xs uppercase tracking-wider text-primary mb-4">Follow Us</h5>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/ashemun.official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="gradient-divider mb-6" />
      <p className="text-center text-xs text-muted-foreground font-body">
        © {new Date().getFullYear()} Ashe Model United Nations. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
