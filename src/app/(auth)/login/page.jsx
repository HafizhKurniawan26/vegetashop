"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import globalApi from "@/_utils/globalApi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle OAuth callback dari Strapi
  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const id_token = searchParams.get("id_token");
    const error = searchParams.get("error");

    if (error) {
      toast.error(`Authentication failed: ${error}`);
      // Clean URL
      router.replace("/login");
      return;
    }

    // Strapi biasanya mengirim access_token di URL setelah OAuth berhasil
    if (access_token || id_token) {
      handleGoogleCallback(access_token || id_token);
    }
  }, [searchParams, router]);

  const handleGoogleCallback = async (token) => {
    setIsLoading(true);

    try {
      // Gunakan function dari globalApi
      const data = await globalApi.googleAuthCallback(token);

      if (data.jwt && data.user) {
        console.log("auth:", data.user);
        // Simpan ke localStorage dan sessionStorage
        localStorage.setItem("jwt", data.jwt);
        localStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.setItem("jwt", data.jwt);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        toast.success("Login successful!");

        // Redirect ke home
        router.push("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Google OAuth error:", error);
      toast.error(error || "Failed to authenticate with Google");
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // URL untuk memulai OAuth flow dengan Strapi
    const strapiUrl = "http://localhost:1337";
    const googleAuthUrl = `${strapiUrl}/api/connect/google`;

    console.log("Redirecting to Google OAuth:", googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all the fields");
      return;
    }

    setIsLoading(true);

    try {
      // Gunakan function dari globalApi
      const data = await globalApi.loginUser(email, password);

      // Simpan ke storage
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("jwt", data.jwt);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.user_role === "admin") {
        toast.success("Welcome back, Admin!");
        router.push("/dashboard");
        return;
      }

      toast.success("Login successful");
      setEmail("");
      setPassword("");
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg">
              <p>Processing login...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 text-base">
            Login to your Acme Inc account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-900 block"
            >
              Username / Email
            </label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full py-2 px-4 text-base border border-gray-500"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <a href="#" className="text-sm text-gray-900 hover:underline">
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 px-4 text-base border border-gray-500"
              disabled={isLoading}
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base rounded-lg cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-800">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex justify-center items-center">
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="h-11 w-full border-gray-900 hover:bg-gray-30 cursor-pointer disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href={"/register"}
              className="text-gray-900 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
