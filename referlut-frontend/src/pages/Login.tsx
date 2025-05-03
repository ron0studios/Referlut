import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import LoginButton from "@/components/auth/LoginButton";
import SignupButton from "@/components/auth/SignupButton";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to profile
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center justify-center">
            <div className="h-10 w-10 bg-referlut-purple rounded-lg mr-2"></div>
            <span className="text-2xl font-bold bg-gradient-to-r from-referlut-purple to-referlut-orange bg-clip-text text-transparent">
              Referlut
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="space-y-4">
          <LoginButton className="w-full bg-referlut-purple hover:bg-referlut-purple/90 text-white h-12 text-base" />

          <div className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?
          </div>

          <SignupButton className="w-full bg-referlut-orange hover:bg-referlut-orange/90 text-white h-12 text-base" />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          By signing in, you agree to our{" "}
          <Link
            to="/terms"
            className="font-medium text-referlut-purple hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="font-medium text-referlut-purple hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
