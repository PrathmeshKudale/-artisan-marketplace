import { Facebook, Linkedin, Twitter, Mail, MapPin, Phone } from "lucide-react";

const navigation = [
  {
    title: "Marketplace",
    links: [
      { name: "Browse Products", href: "#" },
      { name: "Categories", href: "#" },
      { name: "Featured Artisans", href: "#" },
    ],
  },
  {
    title: "For Artisans", 
    links: [
      { name: "Join Platform", href: "#" },
      { name: "Resources", href: "#" },
      { name: "Success Stories", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Us", href: "#" },
      { name: "FAQs", href: "#" },
      { name: "Shipping Info", href: "#" },
    ],
  },
];

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
];

export const NewsletterFooter = () => {
  return (
    <section id="contact-section" className="py-12 sm:py-16 md:py-24" style={{ backgroundColor: '#8B4513' }}>
      <div className="container mx-auto max-w-6xl px-5 md:px-6">
        {/* Logo and newsletter section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-10 border-b pb-10 sm:mb-16 sm:pb-12 md:flex-row">
          <div className="w-full max-w-full sm:max-w-sm">
            <a href="#" className="inline-block">
              <h2 className="mb-6 text-2xl font-bold text-amber-100">
                KarigarSetu
              </h2>
            </a>
            <p className="mb-8 text-base text-amber-200">
              Stay updated on new artisan products and stories from our vibrant 
              community of traditional craftspeople.
            </p>

            {/* Newsletter subscription */}
            <div className="flex w-full max-w-full flex-col gap-3 sm:max-w-md sm:flex-row">
              <input
                type="email"
                placeholder="Your email"
                className="flex h-12 flex-1 rounded-md border border-amber-300 bg-white px-4 py-2 text-base text-gray-800 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:text-sm"
              />
              <button className="inline-flex h-12 items-center justify-center rounded-md bg-amber-600 px-6 py-2 text-base font-medium whitespace-nowrap text-white transition-colors hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:h-10 sm:px-4 sm:text-sm">
                Subscribe
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="w-full border-t pt-8 sm:border-t-0 sm:pt-0">
            <nav className="grid w-full grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 md:w-auto md:grid-cols-3">
              {navigation.map((section) => (
                <div key={section.title} className="min-w-[140px]">
                  <h2 className="mb-4 text-lg font-semibold text-amber-100">
                    {section.title}
                  </h2>
                  <ul className="space-y-3.5">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="inline-block py-1 text-amber-200 transition-colors duration-200 hover:text-amber-100 active:text-amber-300"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-10 border-b pb-10">
          <h3 className="mb-6 text-lg font-semibold text-amber-100">Get in Touch</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-amber-300" />
              <span className="text-amber-200">contact@karigarsetu.in</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-amber-300" />
              <span className="text-amber-200">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-amber-300" />
              <span className="text-amber-200">India, IND</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="order-1 mb-6 flex w-full items-center justify-center gap-6 sm:justify-start md:order-2 md:mb-0 md:w-auto">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-label={`Visit our ${link.name} page`}
                className="rounded-full p-3 text-amber-200 transition-all duration-200 hover:bg-amber-700 hover:text-amber-100 active:bg-amber-800"
                rel="noopener noreferrer"
                target="_blank"
              >
                <link.icon className="h-6 w-6 sm:h-5 sm:w-5" />
              </a>
            ))}
          </div>

          {/* Copyright - Below on mobile, left on desktop */}
          <p className="order-2 text-center text-sm text-amber-200 sm:text-left md:order-1">
            © {new Date().getFullYear()} KarigarSetu. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};
