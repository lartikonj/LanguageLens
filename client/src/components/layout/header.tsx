
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Menu, X, Search, ChevronDown } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const navigation = [
  { name: "About", href: "/about" },
  { name: "Categories", href: "/categories" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Auth context not available:", error);
    auth = { user: null };
  }

  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1 items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Home
              </div>
            </Link>
          </Button>
          
          <div className="hidden lg:flex relative w-64">
            <Input 
              type="search" 
              placeholder="Search..." 
              className="pr-8"
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </Button>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          <LanguageSwitcher />
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Menu
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navigation.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link href={item.href}>{item.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <LanguageSwitcher />
          <ThemeToggle />
          {auth.user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => auth.logoutMutation.mutate()}
                disabled={auth.logoutMutation.isPending}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/auth">Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
