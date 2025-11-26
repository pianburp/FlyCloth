import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function ContactUs() {
  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Have a question or feedback? We'd love to hear from you. 
              Our team is ready to assist you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Info */}
          <div className="space-y-8 fade-in-up">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/5 text-primary mt-1">
                <Mail className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground mb-2">
                  For general inquiries and support.
                </p>
                <a href="mailto:support@bajunow.com" className="text-lg font-medium hover:underline">
                  support@bajunow.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/5 text-primary mt-1">
                <Phone className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                <p className="text-muted-foreground mb-2">
                  Mon-Fri from 8am to 5pm.
                </p>
                <a href="tel:+123456789" className="text-lg font-medium hover:underline">
                  +1 (234) 567-89
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/5 text-primary mt-1">
                <MapPin className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                <p className="text-muted-foreground mb-2">
                  Come say hello at our office.
                </p>
                <address className="text-lg font-medium not-italic">
                  123 Fashion Street<br />
                  New York, NY 10001
                </address>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="fade-in-up" style={{ animationDelay: "100ms" }}>
            <form className="space-y-6 p-8 rounded-2xl border border-border/50 bg-muted/10 backdrop-blur-sm">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Name
                </label>
                <Input id="name" placeholder="John Doe" className="bg-background/50" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input id="email" type="email" placeholder="john@example.com" className="bg-background/50" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Message
                </label>
                <textarea 
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="How can we help you?"
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                Send Message
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
