
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

const Signup = () => {
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      console.log('Signup form submitted');
    }
  };

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
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            {step === 1 ? "Let's get started with your details" : "Just a few more details to personalize your experience"}
          </p>
          
          <div className="mt-4 flex items-center justify-center">
            <div className={`h-2.5 w-2.5 rounded-full ${step === 1 ? 'bg-referlut-purple' : 'bg-referlut-purple/40'}`}></div>
            <div className={`h-0.5 w-6 ${step === 1 ? 'bg-referlut-purple/40' : 'bg-referlut-purple'}`}></div>
            <div className={`h-2.5 w-2.5 rounded-full ${step === 2 ? 'bg-referlut-purple' : 'bg-referlut-purple/40'}`}></div>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  type="text" 
                  autoComplete="name" 
                  required 
                  className="mt-1"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="mt-1"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="new-password" 
                  required 
                  className="mt-1"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with a number and a special character
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>I am a:</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-referlut-purple text-referlut-purple hover:bg-referlut-purple/10"
                  >
                    Student
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    Professional
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="university">University (Optional)</Label>
                <Input 
                  id="university" 
                  name="university" 
                  type="text" 
                  className="mt-1"
                  placeholder="University of London"
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link to="/terms" className="text-referlut-purple hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-referlut-purple hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-referlut-orange hover:bg-referlut-orange/90 text-white"
          >
            {step === 1 ? "Continue" : "Create Account"}
          </Button>
          
          <div className="text-center mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-referlut-purple hover:text-referlut-purple/80">
              Sign in
            </Link>
          </div>
        </form>
        
        {step === 1 && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or sign up with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="inline-flex w-full justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <svg className="h-5 w-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25526 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25537 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="inline-flex w-full justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <svg className="h-5 w-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path>
                </svg>
                GitHub
              </button>
            </div>
          </div>
        )}
      </div>
      
      {step === 1 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          By signing up, you agree to our{" "}
          <Link to="/terms" className="font-medium text-referlut-purple hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="font-medium text-referlut-purple hover:underline">
            Privacy Policy
          </Link>
        </div>
      )}
    </div>
  );
};

export default Signup;
