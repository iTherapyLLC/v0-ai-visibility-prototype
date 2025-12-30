"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/geo-audit"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("geo_auth_token")
    if (token) {
      router.push(redirect)
    }
  }, [router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store the token
      localStorage.setItem("geo_auth_token", data.token)
      localStorage.setItem("geo_user_email", email)

      // Redirect to the requested page
      router.push(redirect)
    } catch (err) {
      console.error("[Login] Error:", err)
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C2C2C] via-[#3a3a3a] to-[#2C2C2C] flex items-center justify-center px-6 py-12">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B87333]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C4B39A]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#C4B39A] hover:text-[#B87333] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <Card className="bg-[#FAF8F5] border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="mb-4">
              <Image
                src="/images/featherstone-logo.png"
                alt="Featherstone Intelligence"
                width={80}
                height={80}
                className="mx-auto"
              />
            </div>
            <CardTitle className="text-2xl font-serif font-bold text-[#2C2C2C]">
              GEO Visibility Tool
            </CardTitle>
            <CardDescription className="text-[#2C2C2C]/60">
              Sign in to access your AI visibility audit dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2C2C2C] font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C2C2C]/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@winery.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white border-[#C4B39A]/30 focus:border-[#B87333] focus:ring-[#B87333]"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2C2C2C] font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C2C2C]/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white border-[#C4B39A]/30 focus:border-[#B87333] focus:ring-[#B87333]"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 hover:text-[#2C2C2C]/60 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#B87333] hover:bg-[#A66329] text-white font-semibold text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Help text */}
            <div className="mt-6 pt-6 border-t border-[#C4B39A]/20 text-center">
              <p className="text-sm text-[#2C2C2C]/60">
                Need access?{" "}
                <Link href="/#contact" className="text-[#B87333] hover:underline font-medium">
                  Contact us
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-[#FAF8F5]/40 text-sm mt-8">
          Featherstone Intelligence
        </p>
      </div>
    </div>
  )
}
