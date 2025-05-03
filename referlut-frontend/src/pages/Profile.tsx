import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-referlut-purple"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">
          You need to be logged in to view this page
        </h2>
        <Link to="/login">
          <Button className="bg-referlut-purple hover:bg-referlut-purple/90 text-white">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user?.name || "Profile"}
                  className="h-24 w-24 rounded-full object-cover border-4 border-referlut-purple mb-4"
                />
              )}
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>

              <div className="mt-8 w-full">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                  Profile Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email verified:</span>
                    <span className="font-medium">
                      {user?.email_verified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account updated:</span>
                    <span className="font-medium">
                      {user?.updated_at &&
                        new Date(user.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
