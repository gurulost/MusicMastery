import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "@/contexts/UserContext";
import { Link, useLocation } from "wouter";

export function TopBar() {
  const { currentUser, logoutUser } = useUser();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Brand */}
        <div className="mr-4 hidden md:flex">
          <Link href="/">
            <a className="mr-4 flex items-center space-x-2 lg:mr-6">
              <Music className="h-6 w-6" />
              <span className="hidden font-serif font-semibold lg:inline-block">
                Music Mastery
              </span>
            </a>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center space-x-2">
              {/* Quick Links */}
              <Button
                variant={location === "/learning-journey" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/learning-journey">Start Here</Link>
              </Button>
              <Button
                variant={location === "/scales" || location === "/intervals" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/scales">Practice</Link>
              </Button>
              <Button
                variant={location === "/progress" ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href="/progress">Progress</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* User Info */}
            {currentUser && (
              <div className="hidden text-sm text-muted-foreground sm:inline-block">
                {currentUser.username}
              </div>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Actions */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => logoutUser()}
              className="hidden sm:inline-flex"
            >
              Switch User
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}