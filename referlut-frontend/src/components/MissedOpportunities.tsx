import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Coins, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

const MissedOpportunities = () => {
  return (
    <section className="py-20 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Left side - Statistics and text */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative animate-fadeIn">
              <span className="text-referlut-purple animate-pulse">
                £1,800+
              </span>{" "}
              Lost Annually 🤦
            </h2>

            <p
              className="text-lg text-gray-700 mb-8 animate-fadeIn"
              style={{ animationDelay: "0.2s" }}
            >
              Students are missing out on{" "}
              <span className="font-semibold">
                thousands in potential savings
              </span>{" "}
              by not taking advantage of referral programs, loyalty bonuses, and
              membership sharing opportunities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start transform transition-all duration-500 hover:shadow-md hover:-translate-y-1 animate-fadeInUp"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 animate-pulse">
                    76%
                  </h3>
                  <p className="text-sm text-gray-600">
                    of students never use referral programs
                  </p>
                </div>
              </div>

              <div
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start transform transition-all duration-500 hover:shadow-md hover:-translate-y-1 animate-fadeInUp"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <Coins className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 animate-pulse">
                    £320
                  </h3>
                  <p className="text-sm text-gray-600">
                    average monthly subscription costs
                  </p>
                </div>
              </div>

              <div
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start transform transition-all duration-500 hover:shadow-md hover:-translate-y-1 animate-fadeInUp"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Sparkles className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 animate-pulse">
                    £480+
                  </h3>
                  <p className="text-sm text-gray-600">
                    potential referral earnings per term
                  </p>
                </div>
              </div>

              <div
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start transform transition-all duration-500 hover:shadow-md hover:-translate-y-1 animate-fadeInUp"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 animate-pulse">
                    £1,200+
                  </h3>
                  <p className="text-sm text-gray-600">
                    yearly savings with shared accounts
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/signup"
              className="animate-fadeIn"
              style={{ animationDelay: "0.7s" }}
            >
              <Button
                size="lg"
                className="bg-referlut-purple hover:bg-referlut-purple/90 text-white group transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              >
                Stop Missing Out
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Right side - Visual element */}
          <div className="lg:w-1/2 relative mt-10 lg:mt-0">
            <div className="relative animate-float">
              {/* Main illustration background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-referlut-purple/20 to-referlut-light-purple/30 rounded-2xl transform rotate-3 animate-pulse-slow"></div>

              {/* Content cards */}
              <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-6 z-10 transform -rotate-3">
                <h3 className="text-lg font-semibold mb-3">
                  Your Missed Opportunities
                </h3>

                <div className="space-y-3">
                  <div
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center transform transition-all duration-300 hover:-translate-x-1 animate-fadeInRight"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mr-3 animate-pulse-slow">
                        U
                      </div>
                      <span className="font-medium">UniCaf referral</span>
                    </div>
                    <span className="text-red-500 font-bold">-£300+</span>
                  </div>

                  <div
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center transform transition-all duration-300 hover:-translate-x-1 animate-fadeInRight"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 animate-pulse-slow">
                        R
                      </div>
                      <span className="font-medium">Revolut referral</span>
                    </div>
                    <span className="text-red-500 font-bold">-£70</span>
                  </div>

                  <div
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center transform transition-all duration-300 hover:-translate-x-1 animate-fadeInRight"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-bold mr-3 animate-pulse-slow">
                        U
                      </div>
                      <span className="font-medium">Uber refer-a-friend</span>
                    </div>
                    <span className="text-red-500 font-bold">-£200+</span>
                  </div>

                  <div
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center transform transition-all duration-300 hover:-translate-x-1 animate-fadeInRight"
                    style={{ animationDelay: "0.6s" }}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3 animate-pulse-slow">
                        R
                      </div>
                      <span className="font-medium">Robinhood</span>
                    </div>
                    <span className="text-red-500 font-bold">-£190</span>
                  </div>

                  <div
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center transform transition-all duration-300 hover:-translate-x-1 animate-fadeInRight"
                    style={{ animationDelay: "0.7s" }}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold mr-3 animate-pulse-slow">
                        +
                      </div>
                      <span className="font-medium">and 100s more!</span>
                    </div>
                    <span className="text-red-500 font-bold">-£10,000+</span>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center animate-fadeIn"
                  style={{ animationDelay: "0.8s" }}
                >
                  <span className="font-bold">Total Missed Savings:</span>
                  <span className="text-xl font-bold text-red-500 animate-pulse">
                    £10,760+/yr
                  </span>
                </div>
              </div>

              {/* Decorative elements with animations */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-referlut-orange/10 rounded-full z-0 animate-rotate-slow"></div>
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-referlut-purple/10 rounded-full z-0 animate-rotate-slow-reverse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissedOpportunities;
