import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, Search, User, LogOut } from "lucide-react";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-accent"
  }`;

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <nav className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg">
          <span className="inline-block h-6 w-6 rounded-sm bg-primary" aria-hidden />
          BeAlbanian
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/about" className={navItemClass}>
            Rreth nesh
          </NavLink>
          <NavLink to="/explore" className={navItemClass}>
            <span className="inline-flex items-center gap-1"><Search className="size-4"/> Eksploro</span>
          </NavLink>
          <NavLink to="/learn" className={navItemClass}>Mëso</NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={navItemClass({ isActive: false })}>
                🎮 Games
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <NavLink to="/shqip-dash">Shqip Dash</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/valle-dance">Valle Dance Moves</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/map-quest">Map Quest: Cities</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/gjyshjas-kitchen">Gjyshja's Kitchen</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/dress-shqiponja">👗 Dress the Shqiponja</NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink to="/cities" className={navItemClass}>Qytete</NavLink>
          <NavLink to="/figures" className={navItemClass}>Figura</NavLink>
          <NavLink to="/traditions" className={navItemClass}>Tradita</NavLink>
          <NavLink to="/dashboard" className={navItemClass}>Përparimi</NavLink>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <NavLink to="/sign-in">
                <Button variant="outline" size="sm">Hyr</Button>
              </NavLink>
              <NavLink to="/onboarding">
                <Button variant="hero" size="sm" className="hidden sm:inline-flex">
                  <Flame className="mr-1"/> Filloni të mësoni
                </Button>
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
