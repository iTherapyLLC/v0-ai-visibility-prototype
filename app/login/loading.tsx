import { Card, CardHeader, CardContent } from "@/components/ui/card"

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C2C2C] via-[#3a3a3a] to-[#2C2C2C] flex items-center justify-center px-6 py-12">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B87333]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C4B39A]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back link skeleton */}
        <div className="h-4 bg-[#C4B39A]/20 rounded w-28 mb-8 animate-pulse" />

        <Card className="bg-[#FAF8F5] border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mb-4">
              <div className="w-20 h-20 bg-[#C4B39A]/20 rounded-full mx-auto animate-pulse" />
            </div>
            <div className="h-8 bg-[#C4B39A]/20 rounded w-48 mx-auto animate-pulse" />
            <div className="h-4 bg-[#C4B39A]/20 rounded w-64 mx-auto mt-2 animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-[#C4B39A]/20 rounded w-24 animate-pulse" />
              <div className="h-12 bg-[#C4B39A]/20 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-[#C4B39A]/20 rounded w-20 animate-pulse" />
              <div className="h-12 bg-[#C4B39A]/20 rounded animate-pulse" />
            </div>
            <div className="h-12 bg-[#B87333]/50 rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* Footer skeleton */}
        <div className="h-4 bg-[#FAF8F5]/10 rounded w-40 mx-auto mt-8 animate-pulse" />
      </div>
    </div>
  )
}
