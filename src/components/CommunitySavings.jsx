const CommunitySavings = () => {
  const features = [
    {
      icon: "👥",
      title: "Group Contributions",
      description: "Pool funds with your community members to create a larger financial safety net."
    },
    {
      icon: "📈",
      title: "Collective Interest",
      description: "Earn higher interest rates through the power of combined savings."
    },
    {
      icon: "🛡️",
      title: "Emergency Support",
      description: "Access financial help when you need it most, backed by your community."
    }
  ]
  
  return (
    <section id="community" className="section section-light">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="transparent-bg-accent-secondary text-accent-secondary px-4 py-1 rounded-full text-sm font-bold">
              Community Power
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-on-dark">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-secondary to-accent-tertiary">
                Community Savings Pools
              </span>
            </h2>
            <p className="text-text-primary max-w-3xl mx-auto">
              Join forces with others to create powerful financial support networks. Our community savings pools help you save together and support each other.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card p-8 hover:shadow-glow-secondary border border-[rgba(139,92,246,0.2)]"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <a 
              href="/join"
              className="cta-button secondary"
            >
              Find a Community
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CommunitySavings