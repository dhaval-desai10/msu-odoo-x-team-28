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
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-16">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] opacity-20"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Thrive Together</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
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
                    <span className="pr-6 text-indigo-300 font-semibold">Join our community</span>
                  </span>
                  <span className="pl-6 text-indigo-200 group-hover:text-indigo-100 transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <motion.div 
                ref={missionRef}
                variants={containerVariants}
                initial="hidden"
                animate={isMissionInView ? "visible" : "hidden"}
                className="md:w-1/2"
              >
                <motion.h2 
                  variants={itemVariants} 
                  className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
                >
                  Our Mission
                </motion.h2>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-lg text-gray-300 mb-6 leading-relaxed"
                >
                  At Thrive Together, we're on a mission to revolutionize how people save, support each other, and build financial resilience through the power of community.
                </motion.p>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-lg text-gray-300 leading-relaxed"
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="People supporting each other" 
                      className="rounded-lg w-full h-full object-cover"
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
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-[120px] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              ref={valuesRef}
              variants={containerVariants}
              initial="hidden"
              animate={isValuesInView ? "visible" : "hidden"}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={itemVariants} 
                className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
              >
                Our Values
              </motion.h2>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg text-gray-300 max-w-3xl mx-auto"
              >
                The core principles that guide everything we do at Thrive Together.
              </motion.p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-700 transform transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/50 group"
                >
                  <div className="text-4xl mb-6 bg-gray-700 inline-block p-4 rounded-lg group-hover:bg-indigo-900/30 transition-colors duration-300">{value.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Team Section */}
      <section className="py-20 bg-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-[120px] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              ref={teamRef}
              variants={containerVariants}
              initial="hidden"
              animate={isTeamInView ? "visible" : "hidden"}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={itemVariants} 
                className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
              >
                Meet Our Team
              </motion.h2>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg text-gray-300 max-w-3xl mx-auto"
              >
                The passionate individuals behind Thrive Together, dedicated to building a platform that empowers communities.
              </motion.p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-gray-900 rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 group"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 border-t border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors duration-300">{member.name}</h3>
                    <p className="text-indigo-400 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-400">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row-reverse items-center gap-16">
              <motion.div 
                ref={storyRef}
                variants={containerVariants}
                initial="hidden"
                animate={isStoryInView ? "visible" : "hidden"}
                className="md:w-1/2"
              >
                <motion.h2 
                  variants={itemVariants} 
                  className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
                >
                  Our Story
                </motion.h2>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-lg text-gray-300 mb-6 leading-relaxed"
                >
                  Thrive Together was born from a simple observation: financial challenges are easier to overcome when faced together. Our founder, Emma Rodriguez, experienced this firsthand when her community rallied to support her during a health crisis.
                </motion.p>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-lg text-gray-300 mb-6 leading-relaxed"
                >
                  Inspired by traditional community savings circles and modern financial technology, Emma assembled a team of experts to create a platform that makes community-based financial support accessible to everyone.
                </motion.p>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-lg text-gray-300 leading-relaxed"
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
                  <div className="relative h-96 border-l-4 border-indigo-500 border-opacity-30 ml-6 pl-8">
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
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-900/30 backdrop-blur-sm p-10 rounded-2xl border border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0">
                  <h2 className="text-3xl font-bold mb-3 text-white">Join Our Mission</h2>
                  <p className="text-gray-200 text-lg max-w-xl">Become part of a community that thrives together. Start your financial wellness journey today with the support of others.</p>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                  <button 
                    onClick={() => navigate('/join')}
                    className="relative px-8 py-4 bg-gray-900 rounded-full text-white font-bold flex items-center space-x-2 group-hover:bg-gray-800 transition duration-300"
                  >
                    <span>Get Started</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
                <p className="text-gray-400">Community Members</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">$2M+</div>
                <p className="text-gray-400">Saved Together</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
                <p className="text-gray-400">Communities Formed</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
                <p className="text-gray-400">Support Available</p>
              </motion.div>
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