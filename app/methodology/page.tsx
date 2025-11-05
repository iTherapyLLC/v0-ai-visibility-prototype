"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const VineyardRowsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path
      d="M4 20h16M4 16h16M8 12c0-2 1-4 4-4s4 2 4 4M6 8c0-2 2-4 6-4s6 2 6 4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function MethodologyPage() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSteps((prev) => (prev.includes(index) ? prev : [...prev, index]))
            }
          })
        },
        { threshold: 0.2 },
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [])

  const steps = [
    {
      number: 1,
      title: "Public Data Prototype",
      description: "Prove value first using public data.",
      icon: VineyardRowsIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      details: [
        "Run initial AI visibility scan using publicly available data",
        "Test your brand across ChatGPT, Perplexity, and Gemini",
        "Identify quick wins and citation gaps",
        "Zero integration required – see results in 48 hours",
      ],
    },
    {
      number: 2,
      title: "Value Gate",
      description: "You decide if it earns integration.",
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      details: [
        "Review comprehensive visibility report",
        "Assess competitive positioning and opportunities",
        "Evaluate ROI potential before committing",
        "No obligation – you control the next step",
      ],
    },
    {
      number: 3,
      title: "Proprietary Integration",
      description: "Connect your internal knowledge base for precision.",
      icon: Lock,
      color: "text-green-600",
      bgColor: "bg-green-100",
      details: [
        "Integrate your CMS, booking system, and analytics",
        "Train AI models on your unique brand story",
        "Continuous monitoring and optimization",
        "Full data ownership and export capabilities",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                           linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Demo
          </Button>
        </Link>

        <div className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground text-balance">Our Methodology</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A transparent, value-first approach to AI visibility optimization.
            </p>
          </div>

          <div className="relative py-12">
            {/* Timeline connector line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-border hidden lg:block" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isVisible = visibleSteps.includes(index)

                return (
                  <div
                    key={index}
                    ref={(el) => {
                      stepRefs.current[index] = el
                    }}
                    className={`relative transition-all duration-700 ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card className="border-2 border-border bg-white hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6 space-y-4">
                        {/* Step number and icon */}
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-full ${step.bgColor}`}>
                            <Icon className={`w-6 h-6 ${step.color}`} />
                          </div>
                          <div className="text-4xl font-bold text-muted-foreground/20">0{step.number}</div>
                        </div>

                        {/* Title and description */}
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                          <p className="text-lg font-medium text-primary">{step.description}</p>
                        </div>

                        {/* Details list */}
                        <ul className="space-y-3 pt-4">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${step.bgColor} mt-2 flex-shrink-0`} />
                              <span className="text-sm text-muted-foreground leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Arrow connector between steps (desktop only) */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:flex absolute -right-3 top-20 z-10 items-center justify-center w-6 h-6 bg-white border-2 border-border rounded-full">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="py-12 px-6">
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <VineyardRowsIcon className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-3xl font-bold text-foreground">Start with the Public Data Prototype</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  See your AI visibility score in 48 hours. No integration, no commitment – just actionable insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      Back to Demo
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5 bg-transparent"
                  >
                    Schedule Free Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
