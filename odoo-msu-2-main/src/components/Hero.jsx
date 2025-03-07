import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center gradient-bg"
    >
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 inline-block">
            <span className="transparent-bg-accent text-accent-primary px-4 py-1 rounded-full text-sm font-bold">
              Financial Freedom
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 text-on-dark">
            <span className="bg-clip-text text-white bg-gradient-to-r from-accent-primary to-accent-secondary">
              Thrive Together
            </span> 
          </h1>
          
          <p className="text-xl md:text-2xl text-text-primary mb-10 max-w-2xl mx-auto">
            Grow financially and build a stronger future through community-powered savings and support networks.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/join">
              <button className="cta-button glow-effect w-full sm:w-auto">
                Join Community
              </button>
            </Link>
            
            <Link to="/savings">
              <button className="cta-button secondary w-full sm:w-auto">
                Start Saving
              </button>
            </Link>
          </div>
          
          
        </div>
      </div>
      
      {/* Subtle geometric shapes */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-accent-primary opacity-5"></div>
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-accent-secondary opacity-5"></div>
      <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full bg-accent-tertiary opacity-5"></div>
    </section>
  )
}

export default Hero