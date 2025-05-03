import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./auth/LoginButton";
import LogoutButton from "./auth/LogoutButton";
import SignupButton from "./auth/SignupButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth0();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-referlut-purple rounded-lg"></div>
          <span className="text-xl font-bold bg-gradient-to-r from-referlut-purple to-referlut-orange bg-clip-text text-transparent">
            Referlut
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-gray-700 hover:text-referlut-purple transition"
          >
            Home
          </Link>
          <Link
            to="#features"
            className="text-gray-700 hover:text-referlut-purple transition"
          >
            Features
          </Link>
          <Link
            to="#how-it-works"
            className="text-gray-700 hover:text-referlut-purple transition"
          >
            How It Works
          </Link>
          <Link
            to="#testimonials"
            className="text-gray-700 hover:text-referlut-purple transition"
          >
            Testimonials
          </Link>
        </nav>

        {/* Login/Signup/Profile Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          ) : isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button
                  variant="outline"
                  className="border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10"
                >
                  {user?.name || "Profile"}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10"
                >
                  Dashboard
                </Button>
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
          <Menu />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-referlut-purple transition py-2"
            >
              Home
            </Link>
            <Link
              to="#features"
              className="text-gray-700 hover:text-referlut-purple transition py-2"
            >
              Features
            </Link>
            <Link
              to="#how-it-works"
              className="text-gray-700 hover:text-referlut-purple transition py-2"
            >
              How It Works
            </Link>
            <Link
              to="#testimonials"
              className="text-gray-700 hover:text-referlut-purple transition py-2"
            >
              Testimonials
            </Link>
            <div className="flex space-x-4 pt-2">
              {isLoading ? (
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md"></div>
              ) : isAuthenticated ? (
                <>
                  <Link to="/profile" className="flex-1">
                    <Button
                      variant="outline"
                      className="border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10 w-full"
                    >
                      Profile
                    </Button>
                  </Link>
                  <LogoutButton className="flex-1 w-full bg-referlut-orange hover:bg-referlut-orange/90 text-white" />
                </>
              ) : (
                <>
                  <LoginButton
                    className="flex-1 border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10 w-full"
                    variant="outline"
                  />
                  <SignupButton className="flex-1 bg-referlut-orange hover:bg-referlut-orange/90 text-white w-full" />
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
