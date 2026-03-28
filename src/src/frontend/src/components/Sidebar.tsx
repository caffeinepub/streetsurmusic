import { cn } from "@/lib/utils";
import { Compass, Home, Upload, User } from "lucide-react";
import { motion } from "motion/react";
import { type Page, useNavigation } from "../context/NavigationContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_ITEMS: {
  label: string;
  icon: React.ElementType;
  page: Page;
  requiresAuth?: boolean;
}[] = [
  { label: "Home", icon: Home, page: "home" },
  { label: "Explore", icon: Compass, page: "explore" },
  { label: "Profile", icon: User, page: "profile", requiresAuth: true },
  { label: "Upload", icon: Upload, page: "upload", requiresAuth: true },
];

export function Sidebar() {
  const { page, navigate } = useNavigation();
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  return (
    <aside className="fixed left-0 top-16 bottom-20 w-16 md:w-56 bg-sidebar border-r border-sidebar-border flex flex-col py-4 gap-1 z-40">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = page === item.page;
        const isDisabled = item.requiresAuth && !isLoggedIn;
        return (
          <motion.button
            key={item.page}
            type="button"
            onClick={() => !isDisabled && navigate(item.page)}
            data-ocid={`sidebar.${item.page}.link`}
            whileHover={{ x: isDisabled ? 0 : 2 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 mx-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : isDisabled
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden md:block">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
              />
            )}
          </motion.button>
        );
      })}
    </aside>
  );
}
