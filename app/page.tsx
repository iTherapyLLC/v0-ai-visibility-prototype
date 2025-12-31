"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InteractiveText } from "@/components/interactive-text"
import { Brain, Target, TrendingUp, Users, ArrowRight, CheckCircle, MessageSquare } from "lucide-react"

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const increment = end / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.3 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return { count, ref }
}

function useFadeInOnScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  const wineriesCount = useCountUp(50, 2000)
  const multiplierCount = useCountUp(3, 1500)
  const daysCount = useCountUp(30, 1800)

  const problemFade = useFadeInOnScroll()
  const servicesFade = useFadeInOnScroll()
  const processFade = useFadeInOnScroll()
  const aboutFade = useFadeInOnScroll()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with warm golden hour aesthetic */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#FAF8F5] via-[#F5EDE3] to-[#EDE4D7]"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />
          {/* Decorative warm glow elements */}
          <div className="absolute inset-0">
            <div
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#C5AA7D]/20 rounded-full blur-[100px] animate-pulse"
              style={{ animationDuration: "4s" }}
            />
            <div
              className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#B87333]/15 rounded-full blur-[80px] animate-pulse"
              style={{ animationDuration: "5s", animationDelay: "1s" }}
            />
            <div
              className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-[#D4C4A8]/25 rounded-full blur-[60px] animate-pulse"
              style={{ animationDuration: "6s", animationDelay: "2s" }}
            />
          </div>
        </div>

        <div className="relative z-10 text-center px-6 py-20 mt-16">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image
              src="/images/featherstone-watermark.png"
              alt=""
              width={600}
              height={600}
              className="opacity-[0.07] select-none"
              priority
            />
          </div>

          {/* Tagline */}
          <p className="relative text-[#B87333] text-lg md:text-xl font-medium tracking-widest uppercase mb-6">
            Featherstone Intelligence
          </p>

          <h1 className="text-[1.6rem] xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-[#2C2C2C] leading-tight mb-6">
            <span className="block whitespace-nowrap">
              <InteractiveText glowColor="#B87333">Invisible Intelligence.</InteractiveText>
            </span>
            <span className="block whitespace-nowrap text-[#B87333]">
              <InteractiveText glowColor="#C5AA7D">Unforgettable Hospitality.</InteractiveText>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#2C2C2C]/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            We help premium wineries and hospitality brands become the answer when AI recommends where to go next.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/geo-audit">
              <Button
                size="lg"
                className="group bg-[#B87333] hover:bg-[#A66329] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-[0_0_30px_rgba(184,115,51,0.4)] transition-all duration-300"
              >
                Try Our GEO Visibility Tool
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#2C2C2C]/20 text-[#2C2C2C] hover:bg-[#2C2C2C]/5 hover:border-[#B87333] px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 bg-transparent"
              >
                Schedule a Consultation
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-[#2C2C2C]/60 text-sm">
            <div className="flex items-center gap-2 hover:text-[#B87333] transition-colors">
              <CheckCircle className="w-4 h-4 text-[#B87333]" />
              <span>Napa Valley Specialists</span>
            </div>
            <div className="flex items-center gap-2 hover:text-[#B87333] transition-colors">
              <CheckCircle className="w-4 h-4 text-[#B87333]" />
              <span>AI-First Strategy</span>
            </div>
            <div className="flex items-center gap-2 hover:text-[#B87333] transition-colors">
              <CheckCircle className="w-4 h-4 text-[#B87333]" />
              <span>Measurable Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#FAF8F5] to-white" ref={problemFade.ref}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <InteractiveText
              text="AI Is Changing How Guests Find You"
              className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-4"
            />
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              The hospitality discovery landscape is shifting. Is your brand visible where it matters most?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#FAF8F5] border-0 shadow-lg hover:shadow-xl hover:shadow-[#B87333]/10 hover:-translate-y-2 transition-all duration-300 group h-full">
              <CardContent className="p-6 text-center h-full flex flex-col items-center">
                <div className="w-12 h-12 bg-[#B87333]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#B87333]/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Brain className="w-6 h-6 text-[#B87333]" />
                </div>
                <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">AI-First Discovery</h3>
                <p className="text-sm text-[#2C2C2C]/70 flex-grow">
                  40% of travelers now use AI assistants to plan trips. Traditional SEO alone won't reach them.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#FAF8F5] border-0 shadow-lg hover:shadow-xl hover:shadow-[#B87333]/10 hover:-translate-y-2 transition-all duration-300 group h-full">
              <CardContent className="p-6 text-center h-full flex flex-col items-center">
                <div className="w-12 h-12 bg-[#B87333]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#B87333]/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Target className="w-6 h-6 text-[#B87333]" />
                </div>
                <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">Invisible Brands Lose</h3>
                <p className="text-sm text-[#2C2C2C]/70 flex-grow">
                  If AI doesn't know your story, it can't recommend you. Your competitors are already optimizing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#FAF8F5] border-0 shadow-lg hover:shadow-xl hover:shadow-[#B87333]/10 hover:-translate-y-2 transition-all duration-300 group h-full">
              <CardContent className="p-6 text-center h-full flex flex-col items-center">
                <div className="w-12 h-12 bg-[#B87333]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#B87333]/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-[#B87333]" />
                </div>
                <h3 className="text-lg font-bold text-[#2C2C2C] mb-2">The Gap Is Growing</h3>
                <p className="text-sm text-[#2C2C2C]/70 flex-grow">
                  Every month you wait, competitors build stronger AI presence. The time to act is now.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white" ref={servicesFade.ref}>
        <div
          className="max-w-6xl mx-auto"
          style={{
            opacity: servicesFade.isVisible ? 1 : 0,
            transform: servicesFade.isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease-out",
          }}
        >
          <div className="text-center mb-16">
            <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">Our Services</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-6">
              <InteractiveText glowColor="#B87333">Generative Engine Optimization</InteractiveText>
            </h2>
            <p className="text-xl text-[#2C2C2C]/70 max-w-3xl mx-auto">
              We don't just optimize for search engines. We optimize for the AI systems that are becoming the new
              gatekeepers of discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#FAF8F5] border-0 shadow-lg hover:shadow-xl hover:shadow-[#B87333]/10 hover:-translate-y-2 transition-all duration-300 group h-full">
              <CardContent className="p-8 text-center h-full flex flex-col items-center">
                <div className="w-16 h-16 bg-[#B87333]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#B87333]/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Brain className="w-8 h-8 text-[#B87333]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">AI-First Discovery</h3>
                <p className="text-[#2C2C2C]/70 flex-grow">
                  40% of travelers now use AI assistants to plan trips. Traditional SEO alone won't reach them.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#FAF8F5] border-0 shadow-lg hover:shadow-xl hover:shadow-[#B87333]/10 hover:-translate-y-2 transition-all duration-300 group h-full">
              <CardContent className="p-8 text-center h-full flex flex-col items-center">
                <div className="w-16 h-16 bg-[#B87333]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#B87333]/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Target className="w-8 h-8 text-[#B87333]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Invisible Brands Lose</h3>
                <p className="text-[#2C2C2C]/70 flex-grow">
                  If AI doesn't know your story, it can't recommend you. Your competitors are already optimizing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#FAF8F5] border-0 shadow-lg hover:shadow-xl hover:shadow-[#B87333]/10 hover:-translate-y-2 transition-all duration-300 group h-full">
              <CardContent className="p-8 text-center h-full flex flex-col items-center">
                <div className="w-16 h-16 bg-[#B87333]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#B87333]/20 group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-[#B87333]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">The Gap Is Growing</h3>
                <p className="text-[#2C2C2C]/70 flex-grow">
                  Every month you wait, competitors build stronger AI presence. The time to act is now.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#FAF8F5]" ref={processFade.ref}>
        <div
          className="max-w-6xl mx-auto"
          style={{
            opacity: processFade.isVisible ? 1 : 0,
            transform: processFade.isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease-out",
          }}
        >
          <div className="text-center mb-16">
            <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">The Process</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-6">
              <InteractiveText glowColor="#B87333">From Invisible to Unforgettable</InteractiveText>
            </h2>
            <p className="text-xl text-[#2C2C2C]/70 max-w-3xl mx-auto">
              A proven methodology that delivers measurable improvements in AI visibility within 30-60 days.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C5AA7D] to-transparent" />

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Audit",
                  description: "We analyze your current AI visibility across all major platforms and identify gaps.",
                },
                {
                  step: "02",
                  title: "Strategy",
                  description: "We develop a customized GEO strategy based on your unique brand story and goals.",
                },
                {
                  step: "03",
                  title: "Implement",
                  description: "We execute technical optimizations, content updates, and authority building.",
                },
                {
                  step: "04",
                  title: "Monitor",
                  description: "We track results and continuously refine your AI presence for lasting impact.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="relative text-center group"
                  style={{
                    animation: processFade.isVisible ? `fadeInUp 0.6s ease-out ${index * 0.15}s forwards` : "none",
                    opacity: processFade.isVisible ? 1 : 0,
                  }}
                >
                  <div
                    className={`w-14 h-14 bg-[#B87333] text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-lg relative z-10 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(184,115,51,0.4)] transition-all duration-300 ${processFade.isVisible ? "animate-pulse-once" : ""}`}
                    style={{ animationDelay: `${index * 0.2 + 0.5}s` }}
                  >
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

      <section id="about" className="py-24 px-6 bg-[#FAF8F5]">
        <div
          ref={aboutFade.ref}
          className={`max-w-6xl mx-auto transition-all duration-1000 ${aboutFade.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">About Us</p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-6">
                Wine Country Experts, AI Pioneers
              </h2>
              <p className="text-lg text-[#2C2C2C]/70 mb-6 leading-relaxed">
                Featherstone Intelligence was founded with a singular focus: helping premium hospitality brands thrive
                in the age of AI-driven discovery.
              </p>
              <p className="text-lg text-[#2C2C2C]/70 mb-8 leading-relaxed">
                We combine deep expertise in Napa Valley hospitality with cutting-edge understanding of how AI systems
                discover, evaluate, and recommend businesses. The result? Strategies that work today and scale for
                tomorrow.
              </p>
              <div className="flex flex-wrap gap-8">
                <div ref={wineriesCount.ref} className="text-center group">
                  <div className="text-4xl font-bold text-[#B87333] group-hover:scale-110 transition-transform">
                    {wineriesCount.count}+
                  </div>
                  <div className="text-sm text-[#2C2C2C]/60">Wineries Served</div>
                </div>
                <div ref={multiplierCount.ref} className="text-center group">
                  <div className="text-4xl font-bold text-[#B87333] group-hover:scale-110 transition-transform">
                    {multiplierCount.count}x
                  </div>
                  <div className="text-sm text-[#2C2C2C]/60">Avg. Visibility Increase</div>
                </div>
                <div ref={daysCount.ref} className="text-center group">
                  <div className="text-4xl font-bold text-[#B87333] group-hover:scale-110 transition-transform">
                    {daysCount.count}
                  </div>
                  <div className="text-sm text-[#2C2C2C]/60">Days to Results</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-[#FAF8F5] rounded-2xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#B87333]/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F5]">
                  <Image
                    src="/images/featherstone-logo.png"
                    alt="Featherstone Intelligence"
                    width={200}
                    height={200}
                    className="object-contain opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#2C2C2C] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
            <InteractiveText glowColor="#C5AA7D">See Your AI Visibility Score</InteractiveText>
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Run a free GEO visibility audit and discover how AI assistants currently perceive and recommend your winery.
          </p>
          <Link href="/geo-audit">
            <Button
              size="lg"
              className="group bg-[#C5AA7D] hover:bg-[#B89A6D] text-[#2C2C2C] px-10 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-[0_0_30px_rgba(197,170,125,0.4)] transition-all duration-300"
            >
              Launch GEO Visibility Tool
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#B87333] font-medium tracking-widest uppercase mb-4">Get Started</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C2C2C] mb-6">
              <InteractiveText glowColor="#B87333">Ready to Be Discovered?</InteractiveText>
            </h2>
            <p className="text-xl text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Schedule a complimentary consultation to discuss your AI visibility strategy.
            </p>
          </div>

          <Card className="bg-[#FAF8F5] border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#2C2C2C] mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 group">
                      <div className="w-10 h-10 bg-[#B87333]/10 rounded-lg flex items-center justify-center group-hover:bg-[#B87333]/20 group-hover:scale-110 transition-all duration-300">
                        <MessageSquare className="w-5 h-5 text-[#B87333]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#2C2C2C]/60">Email</p>
                        <p className="font-medium text-[#2C2C2C]">hello@featherstoneintelligence.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 group">
                      <div className="w-10 h-10 bg-[#B87333]/10 rounded-lg flex items-center justify-center group-hover:bg-[#B87333]/20 group-hover:scale-110 transition-all duration-300">
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
                    className="w-full bg-[#B87333] hover:bg-[#A66329] text-white py-6 text-lg font-semibold hover:shadow-[0_0_20px_rgba(184,115,51,0.3)] transition-all duration-300"
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-once {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(184, 115, 51, 0.4); }
        }
        .animate-pulse-once {
          animation: pulse-once 0.6s ease-in-out 1;
        }
      `}</style>
    </div>
  )
}
