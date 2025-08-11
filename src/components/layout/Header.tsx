import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Search } from "lucide-react";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-accent"
  }`;

const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <nav className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg">
          <span className="inline-block h-6 w-6 rounded-sm bg-primary" aria-hidden />
          Mësuesi i Shqipërisë
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/about" className={navItemClass}>
            Rreth nesh
          </NavLink>
          <NavLink to="/explore" className={navItemClass}>
            <span className="inline-flex items-center gap-1"><Search className="size-4"/> Eksploro</span>
          </NavLink>
          <NavLink to="/learn" className={navItemClass}>Mëso</NavLink>
          <NavLink to="/cities" className={navItemClass}>Qytete</NavLink>
          <NavLink to="/figures" className={navItemClass}>Figura</NavLink>
          <NavLink to="/traditions" className={navItemClass}>Tradita</NavLink>
          <NavLink to="/dashboard" className={navItemClass}>Përparimi</NavLink>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/sign-in">
            <Button variant="outline" size="sm">Hyr</Button>
          </NavLink>
          <NavLink to="/onboarding">
            <Button variant="hero" size="sm" className="hidden sm:inline-flex">
              <Flame className="mr-1"/> Filloni të mësoni
            </Button>
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;
