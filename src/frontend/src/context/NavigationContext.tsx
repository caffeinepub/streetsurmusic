import { createContext, useContext, useState } from "react";

export type Page =
  | "home"
  | "explore"
  | "upload"
  | "profile"
  | "search"
  | "videos";

interface NavigationContextType {
  page: Page;
  navigate: (page: Page) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({
  children,
}: { children: React.ReactNode }) {
  const [page, setPage] = useState<Page>("home");
  const [searchQuery, setSearchQueryState] = useState("");

  const navigate = (p: Page) => setPage(p);

  const setSearchQuery = (q: string) => {
    setSearchQueryState(q);
    if (q.trim()) {
      setPage("search");
    }
  };

  return (
    <NavigationContext.Provider
      value={{ page, navigate, searchQuery, setSearchQuery }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx)
    throw new Error("useNavigation must be used inside NavigationProvider");
  return ctx;
}
