import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const Navbar = ({ currentPage, setCurrentPage, user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { signOut } = useAuthStore()
  
  // Track scroll position to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }
  
  const navbarVariants = {
    transparent: { 
      backgroundColor: 'rgba(10, 10, 10, 0)',
      borderBottom: '1px solid rgba(255, 255, 255, 0)'
    },
    solid: { 
      backgroundColor: 'rgba(17, 17, 17, 0.95)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(8px)'
    }
  }

  const handleNavClick = (page) => {
    setCurrentPage(page)
    navigate(page === 'home' ? '/' : `/${page}`)
    if (isOpen) {
      setIsOpen(false)
    }
  }
  
  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }
  
  return (
    <motion.nav 
      className="fixed w-full z-50 transition-all duration-300"
      initial="transparent"
      animate={scrolled || currentPage !== 'home' ? "solid" : "transparent"}
      variants={navbarVariants}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => handleNavClick('home')}
              className="cursor-pointer group"
            >
              <span className="font-heading font-bold text-2xl md:text-3xl transition-all duration-300">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                  Thrive<span className="text-text-primary group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-accent-secondary group-hover:to-accent-tertiary transition-all duration-500">Together</span>
                </span>
              </span>
            </button>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6 lg:space-x-8">
              <button
                onClick={() => handleNavClick('home')}
                className={`navbar-link px-3 py-2 text-sm lg:text-base font-medium cursor-pointer transition-all duration-300 ${
                  currentPage === 'home' ? 'active' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('join')}
                className={`navbar-link px-3 py-2 text-sm lg:text-base font-medium cursor-pointer transition-all duration-300 ${
                  currentPage === 'join' ? 'active' : ''
                }`}
              >
                Join Community
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`navbar-link px-3 py-2 text-sm lg:text-base font-medium cursor-pointer transition-all duration-300 ${
                  currentPage === 'about' ? 'active' : ''
                }`}
              >
                About Us
              </button>
              
              {/* Only show Personal Savings when the user is logged in */}
              {user && (
                <button
                  onClick={() => handleNavClick('savings')}
                  className={`navbar-link px-3 py-2 text-sm lg:text-base font-medium cursor-pointer transition-all duration-300 ${
                    currentPage === 'savings' ? 'active' : ''
                  }`}
                >
                  Personal Savings
                </button>
              )}
              
              {user ? (
                <>
                  <button
                    onClick={() => handleNavClick('profile')}
                    className={`navbar-link px-3 py-2 text-sm lg:text-base font-medium cursor-pointer transition-all duration-300 ${
                      currentPage === 'profile' ? 'active' : ''
                    }`}
                  >
                    My Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="cta-button ml-4 px-5 py-2.5 text-sm lg:text-base font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavClick('login')}
                  className="cta-button px-6 py-2.5 text-sm lg:text-base font-medium flex items-center space-x-1.5"
                >
                  <span>Login</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary focus:outline-none transition-colors duration-300"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-background-secondary border-t border-background-tertiary`}>
        <div className="px-4 pt-3 pb-4 space-y-2.5 sm:px-5">
          <button
            onClick={() => handleNavClick('home')}
            className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
              currentPage === 'home' ? 'text-accent-primary bg-background-tertiary' : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
            } cursor-pointer transition-colors duration-300`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('join')}
            className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
              currentPage === 'join' ? 'text-accent-primary bg-background-tertiary' : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
            } cursor-pointer transition-colors duration-300`}
          >
            Join Community
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
              currentPage === 'about' ? 'text-accent-primary bg-background-tertiary' : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
            } cursor-pointer transition-colors duration-300`}
          >
            About Us
          </button>
          
          {/* Only show Personal Savings when the user is logged in */}
          {user && (
            <button
              onClick={() => handleNavClick('savings')}
              className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
                currentPage === 'savings' ? 'text-accent-primary bg-background-tertiary' : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
              } cursor-pointer transition-colors duration-300`}
            >
              Personal Savings
            </button>
          )}
          
          {user ? (
            <>
              <button
                onClick={() => handleNavClick('profile')}
                className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
                  currentPage === 'profile' ? 'text-accent-primary bg-background-tertiary' : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                } cursor-pointer transition-colors duration-300`}
              >
                My Profile
              </button>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium bg-accent-primary text-white hover:bg-opacity-90 mt-3 transition-colors duration-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium bg-accent-primary text-white hover:bg-opacity-90 mt-3 transition-colors duration-300 flex items-center justify-between"
            >
              <span>Login</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar