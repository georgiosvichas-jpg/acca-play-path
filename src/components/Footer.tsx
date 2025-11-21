import logo from "@/assets/logo-new.png";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 mt-12 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Outcomeo" className="w-6 h-6 rounded" />
            <span className="font-display font-bold">Outcomeo</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-use" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Use
            </Link>
            <Link to="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">
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
