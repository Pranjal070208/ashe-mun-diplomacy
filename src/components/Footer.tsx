import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-secondary/20 bg-surface pt-16 pb-8">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-widest mb-3">ASHE MUN</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Deliberate with Clarity. Debate with Passion. Deliver with Purpose.
          </p>
        </div>
        <div>
          <h5 className="font-heading text-sm uppercase tracking-wider text-secondary mb-4">Pages</h5>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/committees" className="hover:text-primary transition-colors">Committees</Link>
            <Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
          </div>
        </div>
        <div>
          <h5 className="font-heading text-sm uppercase tracking-wider text-secondary mb-4">Support</h5>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="mailto:contact@ashemun.org" className="hover:text-primary transition-colors">Email Us</a>
            <span>FAQ</span>
            <span>Delegate Resources</span>
          </div>
        </div>
        <div>
          <h5 className="font-heading text-sm uppercase tracking-wider text-secondary mb-4">Follow Us</h5>
          <div className="flex gap-4">
            {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="gold-divider mb-6" />
      <p className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ashe Model United Nations. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
