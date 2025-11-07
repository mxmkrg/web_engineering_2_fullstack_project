"use client";

import { useActionState } from "react";
import { useState } from "react";
import { login } from "@/actions/login";
import { signUp } from "@/actions/signup";
import { Eye, EyeOff, Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginAction] = useActionState(login, {});
  const [signupState, signupAction] = useActionState(signUp, {});

  const currentState = isSignUp ? signupState : loginState;
  const currentAction = isSignUp ? signupAction : loginAction;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Dumbbell className="size-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignUp
              ? "Start your fitness journey today"
              : "Sign in to track your workouts"}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form action={currentAction} className="space-y-6">
            {isSignUp && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4 text-gray-400" />
                  ) : (
                    <Eye className="size-4 text-gray-400" />
                  )}
                </button>
              </div>
              {!isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters
                </p>
              )}
            </div>

            {currentState.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {currentState.error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-3 w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              {isSignUp ? "Sign in instead" : "Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
