import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "About", href: "/about" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const auth = useAuth();

  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Button variant="ghost" asChild>
            <Link href="/">
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Home
              </div>
            </Link>
          </Button>
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

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Button key={item.name} variant="ghost" asChild>
              <Link href={item.href}>
                {item.name}
              </Link>
            </Button>
          ))}
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