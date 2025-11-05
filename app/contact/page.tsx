import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Demo
          </Button>
        </Link>

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4 text-balance">Get in Touch</h1>
          <p className="text-lg text-neutral-600 text-pretty">
            Ready to improve your AI visibility? Schedule a free assessment with our team.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 text-[#4a5d3f] mb-2" />
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">hello@featherstone.ai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="h-8 w-8 text-[#4a5d3f] mb-2" />
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">(707) 555-0123</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-8 w-8 text-[#4a5d3f] mb-2" />
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">Napa Valley, CA</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Card */}
        <Card className="max-w-2xl mx-auto bg-[#4a5d3f] text-white">
          <CardHeader>
            <CardTitle className="text-white">Schedule Free Assessment</CardTitle>
            <CardDescription className="text-white/90">
              We'll analyze your current AI visibility and provide actionable recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Book a Call
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
