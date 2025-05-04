import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSupabaseAuth } from "@/components/auth/SupabaseAuth";
import { Button } from "@/components/ui/button";
import LoginButton from "./auth/LoginButton";
import LogoutButton from "./auth/LogoutButton";
import SignupButton from "./auth/SignupButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useSupabaseAuth();
  const location = useLocation();
  const isIndexPage = location.pathname === "/";

  const getLinkClass = (path: string) => {
    return location.pathname === path
      ? "text-referlut-purple font-semibold"
      : "text-gray-700 hover:text-referlut-purple transition";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/referlut.png"
            alt="Referlut Logo"
            className="h-10 w-10"
          ></img>
          <span className="text-xl font-bold bg-gradient-to-r from-referlut-purple to-referlut-orange bg-clip-text text-transparent">
            Referlut
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {isIndexPage && (
            <>
              <Link to="/" className={getLinkClass("/")}>
                Home
              </Link>
              <a
                href="#features"
                className="text-gray-700 hover:text-referlut-purple transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-referlut-purple transition"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-referlut-purple transition"
              >
                Testimonials
              </a>
            </>
          )}
          {isAuthenticated && !isIndexPage && (
            <>
              <Link to="/dashboard" className={getLinkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link to="/marketplace" className={getLinkClass("/marketplace")}>
                Marketplace
              </Link>
            </>
          )}
        </nav>

        {/* Login/Signup/Profile Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          ) : isAuthenticated ? (
            <>
              <Link to="/profile" className={getLinkClass("/profile")}>
                {user?.user_metadata?.display_name || user?.email || "Profile"}
              </Link>
              <LogoutButton className="bg-referlut-orange hover:bg-referlut-orange/90 text-white" />
            </>
          ) : (
            <>
              <LoginButton
                variant="outline"
                className="border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10"
              />
              <SignupButton className="bg-referlut-orange hover:bg-referlut-orange/90 text-white" />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            {isIndexPage && (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-referlut-purple transition py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <a
                  href="#features"
                  className="text-gray-700 hover:text-referlut-purple transition py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-700 hover:text-referlut-purple transition py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-700 hover:text-referlut-purple transition py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Testimonials
                </a>
              </>
            )}
            <div className="flex flex-col space-y-4 pt-2">
              {isLoading ? (
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md"></div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={
                        location.pathname === "/profile" ? "default" : "outline"
                      }
                      className={`${
                        location.pathname === "/profile"
                          ? "bg-referlut-purple text-white"
                          : "border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10"
                      } w-full`}
                    >
                      Profile
                    </Button>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={
                        location.pathname === "/dashboard"
                          ? "default"
                          : "outline"
                      }
                      className={`${
                        location.pathname === "/dashboard"
                          ? "bg-referlut-purple text-white"
                          : "border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10"
                      } w-full`}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link
                    to="/marketplace"
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={
                        location.pathname === "/marketplace"
                          ? "default"
                          : "outline"
                      }
                      className={`${
                        location.pathname === "/marketplace"
                          ? "bg-referlut-orange text-white"
                          : "border-referlut-orange text-referlut-orange hover:bg-referlut-orange/10"
                      } w-full`}
                    >
                      Marketplace
                    </Button>
                  </Link>
                  <LogoutButton
                    className="w-full bg-referlut-orange hover:bg-referlut-orange/90 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  />
                </>
              ) : (
                <>
                  <LoginButton
                    className="w-full border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10"
                    variant="outline"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <SignupButton
                    className="w-full bg-referlut-orange hover:bg-referlut-orange/90 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
