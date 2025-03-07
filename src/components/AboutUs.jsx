import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const AboutUs = () => {
  const navigate = useNavigate()
  const missionRef = useRef(null)
  const teamRef = useRef(null)
  const valuesRef = useRef(null)
  const storyRef = useRef(null)
  
  const isMissionInView = useInView(missionRef, { once: false, amount: 0.3 })
  const isTeamInView = useInView(teamRef, { once: false, amount: 0.3 })
  const isValuesInView = useInView(valuesRef, { once: false, amount: 0.3 })
  const isStoryInView = useInView(storyRef, { once: false, amount: 0.3 })
  
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
  
  const teamMembers = [
    {
      name: "Emma Rodriguez",
      role: "Founder & CEO",
      bio: "Former financial advisor with a passion for community-driven solutions.",
      image: "https://randomuser.me/api/portraits/women/23.jpg"
    },
    {
      name: "David Chen",
      role: "Chief Technology Officer",
      bio: "Tech innovator with 15+ years experience in fintech and healthcare.",
      image: "https://randomuser.me/api/portraits/men/54.jpg"
    },
    {
      name: "Aisha Johnson",
      role: "Community Director",
      bio: "Community organizer who has built support networks for over a decade.",
      image: "https://randomuser.me/api/portraits/women/17.jpg"
    },
    {
      name: "Marcus Williams",
      role: "Financial Wellness Lead",
      bio: "Certified financial planner specializing in community economics.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ]
  
  const values = [
    {
      icon: "🤝",
      title: "Community First",
      description: "We believe in the power of communities to support each other financially and emotionally."
    },
    {
      icon: "🔒",
      title: "Trust & Security",
      description: "Your financial security and data privacy are our top priorities."
    },
    {
      icon: "🌱",
      title: "Sustainable Growth",
      description: "We focus on long-term financial wellness, not quick fixes."
    },
    {
      icon: "🌍",
      title: "Inclusive Support",
      description: "Our platform is designed to be accessible and beneficial for everyone."
    }
  ]
  
  return (
    <div className="min-h-screen pt-16 text-gray-100 bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] opacity-20"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] opacity-20"></div>
        </div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="mb-6 text-4xl font-bold tracking-tight md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Thrive Together</span>
            </motion.h1>
            
            <motion.p 
              className="max-w-3xl mx-auto text-xl leading-relaxed text-gray-300 md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Building a world where financial wellness and community support go hand in hand.
            </motion.p>
            
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative inline-flex group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                <button 
                  onClick={() => navigate('/join')}
                  className="relative px-8 py-3.5 bg-gray-800 rounded-lg leading-none flex items-center divide-x divide-gray-600"
                >
                  <span className="flex items-center space-x-2">
                    <span className="pr-6 font-semibold text-indigo-300">Join our community</span>
                  </span>
                  <span className="pl-6 text-indigo-200 transition duration-300 group-hover:text-indigo-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-gray-800">
            <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="py-20 bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center gap-16 md:flex-row">
              <motion.div 
                ref={missionRef}
                variants={containerVariants}
                initial="hidden"
                animate={isMissionInView ? "visible" : "hidden"}
                className="md:w-1/2"
              >
                <motion.h2 
                  variants={itemVariants} 
                  className="mb-6 text-3xl font-bold text-transparent md:text-4xl bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
                >
                  Our Mission
                </motion.h2>
                
                <motion.p 
                  variants={itemVariants}
                  className="mb-6 text-lg leading-relaxed text-gray-300"
                >
                  At Thrive Together, we're on a mission to revolutionize how people save, support each other, and build financial resilience through the power of community.
                </motion.p>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-lg leading-relaxed text-gray-300"
                >
                  We believe that financial wellness shouldn't be a solitary journey. By combining traditional saving methods with community support networks, we create a platform where everyone can thrive together.
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                animate={isMissionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative group">
                  <div className="absolute transition duration-500 rounded-lg opacity-25 -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 blur group-hover:opacity-50"></div>
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="People supporting each other" 
                      className="object-cover w-full h-full rounded-lg"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-60"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="relative py-20 overflow-hidden bg-gray-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-[120px] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px] opacity-10"></div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              ref={valuesRef}
              variants={containerVariants}
              initial="hidden"
              animate={isValuesInView ? "visible" : "hidden"}
              className="mb-16 text-center"
            >
              <motion.h2 
                variants={itemVariants} 
                className="mb-6 text-3xl font-bold text-transparent md:text-4xl bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
              >
                Our Values
              </motion.h2>
              
              <motion.p 
                variants={itemVariants}
                className="max-w-3xl mx-auto text-lg text-gray-300"
              >
                The core principles that guide everything we do at Thrive Together.
              </motion.p>
            </motion.div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="p-8 transition-all duration-300 transform border border-gray-700 bg-gray-800/80 backdrop-blur-sm rounded-xl hover:-translate-y-2 hover:border-indigo-500/50 group"
                >
                  <div className="inline-block p-4 mb-6 text-4xl transition-colors duration-300 bg-gray-700 rounded-lg group-hover:bg-indigo-900/30">{value.icon}</div>
                  <h3 className="mb-3 text-xl font-bold text-white">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center gap-16 md:flex-row-reverse">
              <motion.div 
                ref={storyRef}
                variants={containerVariants}
                initial="hidden"
                animate={isStoryInView ? "visible" : "hidden"}
                className="md:w-1/2"
              >
                <motion.h2 
                  variants={itemVariants} 
                  className="mb-6 text-3xl font-bold text-transparent md:text-4xl bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
                >
                  Our Story
                </motion.h2>
                
                <motion.p 
                  variants={itemVariants}
                  className="mb-6 text-lg leading-relaxed text-gray-300"
                >
                  Thrive Together was born from a simple observation: financial challenges are easier to overcome when faced together. Our founder, Emma Rodriguez, experienced this firsthand when her community rallied to support her during a health crisis.
                </motion.p>
                
                <motion.p 
                  variants={itemVariants}
                  className="mb-6 text-lg leading-relaxed text-gray-300"
                >
                  Inspired by traditional community savings circles and modern financial technology, Emma assembled a team of experts to create a platform that makes community-based financial support accessible to everyone.
                </motion.p>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-lg leading-relaxed text-gray-300"
                >
                  Since our launch in 2023, we've helped thousands of people build financial resilience while fostering meaningful connections within their communities.
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isStoryInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                  {/* Timeline Animation */}
                  <div className="relative pl-8 ml-6 border-l-4 border-indigo-500 h-96 border-opacity-30">
                    {/* Timeline Points */}
                    {isStoryInView && (
                      <>
                        <motion.div
                          className="absolute left-0 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          style={{ top: "0%" }}
                        >
                          <div className="w-6 h-6 bg-indigo-500 rounded-full glow"></div>
                          <div className="ml-8 -mt-3">
                            <p className="font-bold text-indigo-400">2022</p>
                            <p className="text-gray-400">The idea is born</p>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          className="absolute left-0 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          style={{ top: "33%" }}
                        >
                          <div className="w-6 h-6 bg-purple-500 rounded-full glow"></div>
                          <div className="ml-8 -mt-3">
                            <p className="font-bold text-purple-400">2023</p>
                            <p className="text-gray-400">Platform launch</p>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          className="absolute left-0 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                          style={{ top: "66%" }}
                        >
                          <div className="w-6 h-6 bg-pink-500 rounded-full glow"></div>
                          <div className="ml-8 -mt-3">
                            <p className="font-bold text-pink-400">2024</p>
                            <p className="text-gray-400">10,000 members</p>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          className="absolute left-0 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.1 }}
                          style={{ top: "100%" }}
                        >
                          <div className="w-6 h-6 bg-indigo-500 rounded-full glow"></div>
                          <div className="ml-8 -mt-3">
                            <p className="font-bold text-indigo-400">2025</p>
                            <p className="text-gray-400">The future is bright</p>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Join Us Banner */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="p-10 border bg-gray-900/30 backdrop-blur-sm rounded-2xl border-white/10">
              <div className="flex flex-col items-center justify-between md:flex-row">
                <div className="mb-8 md:mb-0">
                  <h2 className="mb-3 text-3xl font-bold text-white">Join Our Mission</h2>
                  <p className="max-w-xl text-lg text-gray-200">Become part of a community that thrives together. Start your financial wellness journey today with the support of others.</p>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                  <button 
                    onClick={() => navigate('/join')}
                    className="relative flex items-center px-8 py-4 space-x-2 font-bold text-white transition duration-300 bg-gray-900 rounded-full group-hover:bg-gray-800"
                  >
                    <span>Get Started</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
     
      
      {/* Custom CSS for glow effect */}
      <style jsx>{`
        .glow {
          box-shadow: 0 0 15px 2px currentColor;
        }
      `}</style>
    </div>
  )
}

export default AboutUs