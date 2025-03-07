import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

const PersonalSavings = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })
  const [progress, setProgress] = useState(0)
  const [coins, setCoins] = useState([]);
  
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setProgress(85)
      }, 500)
      
      return () => clearTimeout(timer)
    } else {
      setProgress(0)
    }
  }, [isInView])
  
  useEffect(() => {
    // Create falling coins animation
    const interval = setInterval(() => {
      // Create a new coin with random position and animation duration
      const newCoin = {
        id: Date.now(),
        left: Math.random() * 80 + 10, // Random position (10% to 90%)
        delay: Math.random() * 0.5,    // Random delay
        duration: Math.random() * 1 + 1.5 // Random duration (1.5 to 2.5s)
      };
      
      setCoins(prevCoins => [...prevCoins, newCoin]);
      
      // Remove coin after animation completes
      setTimeout(() => {
        setCoins(prevCoins => prevCoins.filter(coin => coin.id !== newCoin.id));
      }, (newCoin.duration + newCoin.delay) * 1000 + 500);
    }, 2000); // New coin every 2 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }
  
  const benefits = [
    {
      icon: "🔒",
      title: "Secure Savings",
      description: "Keep your personal funds secure while still being part of the community."
    },
    {
      icon: "🎯",
      title: "Goal-Based Saving",
      description: "Set personal financial goals and track your progress over time."
    },
    {
      icon: "🌱",
      title: "Growth Opportunities",
      description: "Access exclusive investment opportunities through community connections."
    }
  ]
  
  return (
    <section id="personal" className="section section-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <span className="transparent-bg-accent-tertiary text-accent-tertiary px-4 py-1 rounded-full text-sm font-bold">
                Personal Growth
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-on-dark">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-tertiary to-accent-primary">
                  Personal Savings Goals
                </span>
              </h2>
              
              <p className="text-text-primary mb-8 text-lg">
                Set and achieve your personal financial goals while staying connected to your community support network.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="glass-effect p-5 border border-[rgba(236,72,153,0.2)] rounded-xl hover:border-[rgba(236,72,153,0.4)] transition-all duration-300"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="icon w-12 h-12 flex items-center justify-center text-xl">
                          {benefit.icon}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-text-primary mb-1">{benefit.title}</h3>
                        <p className="text-text-secondary">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <a 
                  href="/savings"
                  className="cta-button tertiary px-8 py-3 font-bold"
                >
                  Start Saving
                </a>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-72 h-96 glass-effect p-8 rounded-2xl border border-[rgba(236,72,153,0.3)] shadow-[0_0_25px_rgba(236,72,153,0.15)]">
                {/* Coin falling animation */}
                {coins.map(coin => (
                  <div
                    key={coin.id}
                    className="absolute w-6 h-6 z-10"
                    style={{
                      left: `${coin.left}%`,
                      top: '-10px',
                      animation: `fallCoin ${coin.duration}s ease-in ${coin.delay}s forwards`
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center animate-spin-slow">
                      <span className="text-xl" role="img" aria-label="coin">💰</span>
                    </div>
                  </div>
                ))}
                
                {/* Piggy Bank */}
                <div className="w-full h-full flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                  <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                      <linearGradient id="pigGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(236, 72, 153, 0.9)" />
                        <stop offset="100%" stopColor="rgba(236, 72, 153, 0.7)" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <g fill="url(#pigGradient)" filter="url(#glow)">
                      <ellipse cx="100" cy="140" rx="80" ry="60" />
                      <circle cx="150" cy="100" r="20" />
                      <circle cx="50" cy="100" r="20" />
                      <rect x="80" y="40" width="40" height="30" rx="10" />
                      <rect x="95" y="200" width="10" height="30" />
                      <rect x="75" y="200" width="10" height="20" />
                      <rect x="115" y="200" width="10" height="20" />
                    </g>
                    <circle cx="150" cy="100" r="5" fill="rgba(255, 255, 255, 0.9)" />
                    <circle cx="50" cy="100" r="5" fill="rgba(255, 255, 255, 0.9)" />
                    <rect x="70" y="70" width="60" height="5" rx="2" fill="rgba(99, 102, 241, 0.9)" />
                  </svg>
                </div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-5/6">
                  <div className="h-7 bg-background-tertiary rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-accent-tertiary to-accent-primary"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="font-bold text-lg text-text-primary">85%</span>
                    <span className="text-text-secondary ml-1 font-medium">of Goal</span>
                  </div>
                </div>
                
                {/* Coin Symbol */}
                <div className="absolute top-5 right-5 w-12 h-12 rounded-full bg-[rgba(236,72,153,0.2)] flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                
                {/* Coin slot at top of piggy bank */}
                <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-background-tertiary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add keyframes for the falling coin animation */}
      <style jsx>{`
        @keyframes fallCoin {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(180deg);
            opacity: 0;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 1.5s linear infinite;
        }
      `}</style>
    </section>
  )
}

export default PersonalSavings