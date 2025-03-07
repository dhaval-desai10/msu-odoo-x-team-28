import { motion } from 'framer-motion'

const Footer = () => {
  const socialLinks = [
    { icon: "facebook", url: "#" },
    { icon: "twitter", url: "#" },
    { icon: "instagram", url: "#" },
    { icon: "linkedin", url: "#" }
  ]
  
  const footerLinks = [
    { name: "About Us", url: "/about" },
    { name: "FAQs", url: "#faq" },
    { name: "Privacy Policy", url: "#privacy" },
    { name: "Terms of Service", url: "#terms" }
  ]

  const linkCategories = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", url: "/" },
        { name: "Join Community", url: "/join" },
        { name: "Personal Savings", url: "/savings" },
        { name: "About Us", url: "/about" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Service", url: "#terms" },
        { name: "Privacy Policy", url: "#privacy" },
        { name: "Cookie Policy", url: "#cookies" },
        { name: "Disclaimers", url: "#disclaimers" }
      ]
    }
  ]
  
  return (
    <footer id="contact" className="bg-background-secondary border-t border-background-tertiary text-text-primary pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-4">
              <div className="mb-4">
                <h3 className="text-2xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                    Thrive<span className="text-text-primary">Together</span>
                  </span>
                </h3>
              </div>
              <p className="text-text-secondary mb-6 max-w-md">
                Join our community and start your journey toward financial wellness and collective support. We're building a future where financial growth is accessible to everyone.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-background-tertiary border border-background-tertiary hover:border-accent-primary transition-colors duration-300 group"
                    aria-label={link.icon}
                  >
                    <span className="text-text-secondary group-hover:text-accent-primary transition-colors duration-300">
                      <SocialIcon name={link.icon} />
                    </span>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Link Categories */}
            {linkCategories.map((category, idx) => (
              <div key={idx} className="md:col-span-2">
                <h4 className="text-lg font-semibold mb-4 text-text-primary">{category.title}</h4>
                <ul className="space-y-3">
                  {category.links.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.url} 
                        className="text-text-secondary hover:text-accent-primary transition-colors duration-300 flex items-center"
                      >
                        <span className="mr-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Newsletter */}
            <div className="md:col-span-4">
              <h4 className="text-lg font-semibold mb-4 text-text-primary">Stay Updated</h4>
              <p className="text-text-secondary mb-4">
                Subscribe to our newsletter for the latest updates and financial tips.
              </p>
              <form className="flex flex-col space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all duration-300"
                />
                <button 
                  type="submit" 
                  className="cta-button py-3 px-4 rounded-lg"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-background-tertiary pt-8 flex flex-col md:flex-row justify-between items-center text-text-secondary text-sm">
            <p>&copy; {new Date().getFullYear()} Thrive Together. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#privacy" className="hover:text-accent-primary transition-colors duration-300">Privacy</a>
              <a href="#terms" className="hover:text-accent-primary transition-colors duration-300">Terms</a>
              <a href="#contact" className="hover:text-accent-primary transition-colors duration-300">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Social Icons Component
const SocialIcon = ({ name }) => {
  switch (name) {
    case 'facebook':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
      )
    case 'twitter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
        </svg>
      )
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    case 'linkedin':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
        </svg>
      )
    default:
      return null
  }
}

export default Footer