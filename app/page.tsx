"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Globe,
  Zap,
  Shield,
  MessageSquare
} from "lucide-react"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background with parallax */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C] via-[#3a3a3a] to-[#2C2C2C]"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B87333] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C4B39A] rounded-full blur-3xl" />
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/featherstone-logo.png"
              alt="Featherstone Intelligence"
              width={120}
              height={120}
              className="mx-auto opacity-90"
            />
          </div>

          {/* Tagline */}
          <p className="text-[#B87333] text-lg md:text-xl font-medium tracking-widest uppercase mb-6">
            Featherstone Intelligence
          </p>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-[#FAF8F5] leading-tight mb-6">
            Invisible Intelligence.
            <br />
            <span className="text-[#C4B39A]">Unforgettable Hospitality.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-[#FAF8F5]/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            We help premium wineries and hospitality brands become the answer
            when AI recommends where to go next.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/geo-audit">
              <Button
                size="lg"
                className="bg-[#B87333] hover:bg-[#A66329] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Try Our GEO Visibility Tool
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#FAF8F5]/30 text-[#FAF8F5] hover:bg-[#FAF8F5]/10 px-8 py-6 text-lg font-semibold rounded-lg"
              >
                Schedule a Consultation
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-[#FAF8F5]/60 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#B87333]" />
              <span>Napa Valley Specialists</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#B87333]" />
              <span>AI-First Strategy</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#B87333]" />
              <span>Measurable Results</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#FAF8F5]/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-[#B87333] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">The Challenge</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-6">
              AI Is Changing How Guests Find You
            </h2>
            <p className="text-xl text-[#2C2C2C]/70 max-w-3xl mx-auto">
              When travelers ask ChatGPT or Perplexity for winery recommendations,
              is your brand part of the conversation?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#B87333]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-[#B87333]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">AI-First Discovery</h3>
                <p className="text-[#2C2C2C]/70">
                  40% of travelers now use AI assistants to plan trips.
                  Traditional SEO alone won't reach them.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#B87333]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-[#B87333]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Invisible Brands Lose</h3>
                <p className="text-[#2C2C2C]/70">
                  If AI doesn't know your story, it can't recommend you.
                  Your competitors are already optimizing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#B87333]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-[#B87333]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">The Gap Is Growing</h3>
                <p className="text-[#2C2C2C]/70">
                  Every month you wait, competitors build stronger AI presence.
                  The time to act is now.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 px-6 bg-[#2C2C2C]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">Our Solutions</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#FAF8F5] mb-6">
              Generative Engine Optimization
            </h2>
            <p className="text-xl text-[#FAF8F5]/70 max-w-3xl mx-auto">
              We don't just optimize for search engines. We optimize for the AI systems
              that are becoming the new gatekeepers of discovery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#FAF8F5]/5 border border-[#FAF8F5]/10 rounded-2xl p-8 hover:bg-[#FAF8F5]/10 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#B87333] rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#FAF8F5] mb-2">AI Visibility Audits</h3>
                  <p className="text-[#FAF8F5]/70">
                    Comprehensive analysis of how AI assistants currently perceive and recommend your brand
                    across ChatGPT, Perplexity, Google AI, and more.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 ml-16">
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Citation presence analysis</span>
                </li>
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Competitive positioning</span>
                </li>
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Sentiment tracking</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FAF8F5]/5 border border-[#FAF8F5]/10 rounded-2xl p-8 hover:bg-[#FAF8F5]/10 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#B87333] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#FAF8F5] mb-2">Content Optimization</h3>
                  <p className="text-[#FAF8F5]/70">
                    Strategic content development designed to be discovered, understood,
                    and recommended by AI systems.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 ml-16">
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Schema markup implementation</span>
                </li>
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">AI-friendly content structure</span>
                </li>
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Authority signal building</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FAF8F5]/5 border border-[#FAF8F5]/10 rounded-2xl p-8 hover:bg-[#FAF8F5]/10 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#B87333] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#FAF8F5] mb-2">Reputation Management</h3>
                  <p className="text-[#FAF8F5]/70">
                    Monitor and improve how AI systems describe your brand,
                    ensuring accurate and positive representation.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 ml-16">
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Review platform optimization</span>
                </li>
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Sentiment improvement strategies</span>
                </li>
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Citation source diversification</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#FAF8F5]/5 border border-[#FAF8F5]/10 rounded-2xl p-8 hover:bg-[#FAF8F5]/10 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#B87333] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#FAF8F5] mb-2">Ongoing Monitoring</h3>
                  <p className="text-[#FAF8F5]/70">
                    Continuous tracking of your AI visibility with monthly reports
                    and proactive optimization recommendations.
                  </p>
                </div>
              </div>
              <ul className="space-y-2 ml-16">
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Monthly visibility scoring</span>
                </li>
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Competitor tracking</span>
                </li>
                <li className="flex items-center gap-2 text-[#C4B39A]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[#FAF8F5]/80 text-sm">Strategy adjustments</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 px-6 bg-[#C4B39A]/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">Our Process</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-6">
              From Invisible to Unforgettable
            </h2>
            <p className="text-xl text-[#2C2C2C]/70 max-w-3xl mx-auto">
              A proven methodology that delivers measurable improvements in AI visibility within 30-60 days.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-[#B87333]/20" />

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Audit", description: "We analyze your current AI visibility across all major platforms and identify gaps." },
                { step: "02", title: "Strategy", description: "We develop a customized GEO strategy based on your unique brand story and goals." },
                { step: "03", title: "Implement", description: "We execute technical optimizations, content updates, and authority building." },
                { step: "04", title: "Monitor", description: "We track results and continuously refine your AI presence for lasting impact." },
              ].map((item, index) => (
                <div key={index} className="relative text-center">
                  <div className="w-12 h-12 bg-[#B87333] text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-lg relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">{item.title}</h3>
                  <p className="text-[#2C2C2C]/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">About Us</p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-6">
                Wine Country Experts, AI Pioneers
              </h2>
              <p className="text-lg text-[#2C2C2C]/70 mb-6 leading-relaxed">
                Featherstone Intelligence was founded with a singular focus: helping premium hospitality
                brands thrive in the age of AI-driven discovery.
              </p>
              <p className="text-lg text-[#2C2C2C]/70 mb-8 leading-relaxed">
                We combine deep expertise in Napa Valley hospitality with cutting-edge understanding
                of how AI systems discover, evaluate, and recommend businesses. The result?
                Strategies that work today and scale for tomorrow.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#B87333]">50+</div>
                  <div className="text-sm text-[#2C2C2C]/60">Wineries Served</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#B87333]">3x</div>
                  <div className="text-sm text-[#2C2C2C]/60">Avg. Visibility Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#B87333]">30</div>
                  <div className="text-sm text-[#2C2C2C]/60">Days to Results</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-[#2C2C2C] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#B87333]/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/images/featherstone-logo.png"
                    alt="Featherstone Intelligence"
                    width={200}
                    height={200}
                    className="opacity-30"
                  />
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <blockquote className="text-[#FAF8F5] text-lg italic">
                    "The hospitality industry is at an inflection point. Those who understand
                    AI-driven discovery will thrive. Those who don't will wonder where their guests went."
                  </blockquote>
                  <p className="text-[#C4B39A] mt-4 font-medium">— Featherstone Intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GEO Tool CTA */}
      <section className="py-24 px-6 bg-[#2C2C2C]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#B87333]/20 text-[#B87333] px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Free Tool Available</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#FAF8F5] mb-6">
            See Your AI Visibility Score
          </h2>
          <p className="text-xl text-[#FAF8F5]/70 mb-10 max-w-2xl mx-auto">
            Run a free GEO visibility audit and discover how AI assistants currently
            perceive and recommend your winery.
          </p>
          <Link href="/geo-audit">
            <Button
              size="lg"
              className="bg-[#B87333] hover:bg-[#A66329] text-white px-10 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Launch GEO Visibility Tool
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">Get Started</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-6">
              Ready to Be Discovered?
            </h2>
            <p className="text-xl text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Schedule a complimentary consultation to discuss your AI visibility strategy.
            </p>
          </div>

          <Card className="bg-white border-0 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#2C2C2C] mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#B87333]/10 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-[#B87333]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#2C2C2C]/60">Email</p>
                        <p className="font-medium text-[#2C2C2C]">hello@featherstoneintelligence.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#B87333]/10 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#B87333]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#2C2C2C]/60">Consultation</p>
                        <p className="font-medium text-[#2C2C2C]">30-minute strategy session</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <Button
                    size="lg"
                    className="w-full bg-[#B87333] hover:bg-[#A66329] text-white py-6 text-lg font-semibold"
                  >
                    Schedule Your Consultation
                  </Button>
                  <p className="text-sm text-[#2C2C2C]/60 text-center mt-4">
                    No commitment required. Let's explore how we can help.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
