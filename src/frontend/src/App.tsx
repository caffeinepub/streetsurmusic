import { Toaster } from "@/components/ui/sonner";
import { motion } from "motion/react";
import { useState } from "react";
import { BottomPlayer } from "./components/BottomPlayer";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { AboutModal } from "./components/modals/AboutModal";
import { HelpModal } from "./components/modals/HelpModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { PlayerProvider } from "./context/PlayerContext";
import {
  InternetIdentityProvider,
  useInternetIdentity,
} from "./hooks/useInternetIdentity";
import { Explore } from "./pages/Explore";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { SearchResults } from "./pages/SearchResults";
import { Upload } from "./pages/Upload";

function LoginPage() {
  const { login, isLoggingIn, isLoginError } = useInternetIdentity();
  const [clicked, setClicked] = useState(false);

  const handleLogin = () => {
    setClicked(true);
    login();
  };

  return (
    <div className="min-h-screen bg-[oklch(0.08_0_0)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/12 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-22 h-22 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
            style={{ boxShadow: "0 0 40px oklch(0.55 0.25 25 / 0.45)" }}
          >
            <span className="text-white font-extrabold text-4xl font-display">
              S
            </span>
          </div>
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight">
              <span className="font-display text-primary">streetsur</span>
              <span className="font-display text-foreground">music</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-base font-light tracking-wider">
              Your music, your world
            </p>
            <p className="text-primary/80 mt-1 text-sm font-semibold tracking-[0.15em] uppercase">
              India Ka Music
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-28 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Login button */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            data-ocid="login.primary_button"
            className="relative inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-white bg-primary hover:bg-accent active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed text-base uppercase tracking-wider"
            style={{
              boxShadow:
                "0 0 20px oklch(0.55 0.25 25 / 0.4), 0 4px 15px oklch(0.55 0.25 25 / 0.3)",
            }}
          >
            {isLoggingIn ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              "Login to Continue"
            )}
          </button>

          {isLoginError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 max-w-xs"
              data-ocid="login.error_state"
            >
              Login failed. Please try again.
            </motion.p>
          )}

          {clicked && !isLoggingIn && !isLoginError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-amber-400/80 max-w-xs"
            >
              Agar popup block ho raha hai, please allow popups for this site.
            </motion.p>
          )}

          <p className="text-xs text-muted-foreground/60">
            Secure login via Internet Identity
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-muted-foreground/40">
        © {new Date().getFullYear()} streetsurmusic. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}

function AppContent() {
  const { page } = useNavigation();
  const { identity, isInitializing } = useInternetIdentity();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[oklch(0.08_0_0)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home />;
      case "explore":
        return <Explore />;
      case "profile":
        return <Profile />;
      case "upload":
        return <Upload />;
      case "search":
        return <SearchResults />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
      />
      <Sidebar />

      {/* Main content */}
      <main className="ml-16 md:ml-56 pt-16 pb-20 min-h-screen">
        <div className="p-4 md:p-6 max-w-7xl">{renderPage()}</div>
      </main>

      <BottomPlayer />

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
      <AboutModal open={aboutOpen} onOpenChange={setAboutOpen} />

      <Toaster theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <InternetIdentityProvider>
      <PlayerProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </PlayerProvider>
    </InternetIdentityProvider>
  );
}
