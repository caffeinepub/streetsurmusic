import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { LogIn, LogOut, MoreVertical, Search } from "lucide-react";
import { useState } from "react";
import { useNavigation } from "../context/NavigationContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
}

export function Navbar({
  onOpenSettings,
  onOpenHelp,
  onOpenAbout,
}: NavbarProps) {
  const { searchQuery, setSearchQuery, navigate } = useNavigation();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [inputValue, setInputValue] = useState(searchQuery);

  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setInputValue("");
      setSearchQuery("");
      navigate("home");
    }
  };

  const principal = identity?.getPrincipal().toString();
  const initials = principal ? principal.slice(0, 2).toUpperCase() : "U";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[oklch(0.08_0_0)] border-b border-primary/20 flex items-center px-4 gap-4"
      style={{ boxShadow: "0 1px 0 0 oklch(0.55 0.25 25 / 0.3)" }}
    >
      {/* Logo */}
      <button
        type="button"
        onClick={() => navigate("home")}
        data-ocid="nav.link"
        className="flex-shrink-0 flex items-center gap-2 hover:opacity-85 transition-opacity"
      >
        <img
          src="/assets/uploads/img_20260124_133541_410-019d2fa7-87b6-7318-8f85-86763b12dd33-1.webp"
          alt="StreetsurMusic"
          className="h-10 w-auto object-contain"
        />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="nav.search_input"
          placeholder="Search songs, artists..."
          value={inputValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          className="pl-9 bg-[oklch(0.14_0.01_25)] border-[oklch(0.22_0.03_25)] focus:border-primary/60 focus:ring-1 focus:ring-primary/30 text-sm h-9"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => navigate("profile")}
            data-ocid="nav.profile.button"
            className="hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-8 h-8 border border-primary/50">
              <AvatarFallback className="bg-primary/25 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="nav.login.button"
            className="border-primary/50 text-primary hover:bg-primary/15 text-xs h-8"
          >
            <LogIn className="w-3.5 h-3.5 mr-1.5" />
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              data-ocid="nav.open_modal_button"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            data-ocid="nav.dropdown_menu"
            className="bg-popover border-border w-40"
          >
            <DropdownMenuItem
              onClick={onOpenSettings}
              data-ocid="nav.settings.button"
              className="cursor-pointer"
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenHelp}
              data-ocid="nav.help.button"
              className="cursor-pointer"
            >
              Help
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenAbout}
              data-ocid="nav.about.button"
              className="cursor-pointer"
            >
              About
            </DropdownMenuItem>
            {isLoggedIn && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clear}
                  data-ocid="nav.logout.button"
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Logout
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
