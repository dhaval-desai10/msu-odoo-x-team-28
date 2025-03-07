import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CommunitySavings from './components/CommunitySavings'
import PersonalSavings from './components/PersonalSavings'
import JoinCommunity from './components/JoinCommunity'
import AboutUs from './components/AboutUs'
import Login from './components/Login'
import UserProfile from './components/UserProfile'
import PersonalSavingsPage from './components/PersonalSavingsPage'
import CommunityDashboard from './components/CommunityDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'
import useAuthStore from './store/authStore'
import CommunityView from './components/CommunityView'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const location = useLocation()
  const { user, isLoading, checkExistingSession, sessionChecked } = useAuthStore()
  const [appInitialized, setAppInitialized] = useState(false)
  
  useEffect(() => {
    // Update current page based on route
    const path = location.pathname
    if (path === '/') {
      setCurrentPage('home')
    } else if (path === '/join') {
      setCurrentPage('join')
    } else if (path === '/about') {
      setCurrentPage('about')
    } else if (path === '/login') {
      setCurrentPage('login')
    } else if (path === '/profile') {
      setCurrentPage('profile')
    } else if (path === '/savings') {
      setCurrentPage('savings')
    } else if (path.startsWith('/community/')) {
      setCurrentPage('community')
    }
  }, [location])

  useEffect(() => {
    // Check for existing session when the app loads
    const initializeApp = async () => {
      await checkExistingSession()
      setAppInitialized(true)
    }
    
    initializeApp()
  }, [checkExistingSession])

  // If app initialization is still in progress, show a loading spinner
  if (!appInitialized || (isLoading && !sessionChecked)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    )
  }

  const HomePage = () => (
    <>
      <Hero />
      <CommunitySavings />
      <PersonalSavings />
    </>
  )

  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            fontWeight: 500
          },
          success: {
            iconTheme: {
              primary: 'var(--color-accent-secondary)',
              secondary: 'var(--color-bg-secondary)',
            },
            style: {
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }
          },
          error: {
            iconTheme: {
              primary: 'var(--color-accent-tertiary)',
              secondary: 'var(--color-bg-secondary)',
            },
            style: {
              border: '1px solid rgba(236, 72, 153, 0.3)',
            }
          },
        }}
      />
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user}
        />
        
        <main className="overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/join" element={<JoinCommunity />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/savings" element={
              <ProtectedRoute>
                <PersonalSavingsPage />
              </ProtectedRoute>
            } />
            <Route path="/community/:id" element={<CommunityView />} />
            <Route path="/community/dashboard/:communityId" element={
              <ProtectedRoute>
                <CommunityDashboard />
              </ProtectedRoute>
            } />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </>
  )
}

export default App