import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 mt-12 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Outcomeo" className="w-6 h-6 rounded" />
            <span className="font-display font-bold">Outcomeo</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-border">•</span>
            <Link to="/terms-of-use" className="hover:text-primary transition-colors">
              Terms of Use
            </Link>
            <span className="text-border">•</span>
            <Link to="/disclaimer" className="hover:text-primary transition-colors">
              Disclaimer
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            © 2025 Outcomeo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
