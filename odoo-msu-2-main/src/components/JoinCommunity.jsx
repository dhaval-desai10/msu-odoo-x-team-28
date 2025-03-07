import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { motion } from 'framer-motion'
import { nanoid } from 'nanoid'

const JoinCommunity = () => {
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false)
  const [isJoiningCommunity, setIsJoiningCommunity] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contributionPeriod, setContributionPeriod] = useState('monthly')
  const [memberLimit, setMemberLimit] = useState(50)
  const [depositLimit, setDepositLimit] = useState(null)
  const [myCommunities, setMyCommunities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // Fetch communities the user has joined
  useEffect(() => {
    const fetchMyCommunities = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        
        // Get communities where user is a member
        const { data: memberships, error: membershipError } = await supabase
          .from('community_members')
          .select('community_id')
          .eq('user_id', user.id)
        
        if (membershipError) {
          console.error("Error fetching memberships:", membershipError)
          throw new Error("Failed to fetch your communities")
        }
        
        if (!memberships || memberships.length === 0) {
          setMyCommunities([])
          setIsLoading(false)
          return
        }
        
        const communityIds = memberships.map(m => m.community_id)
          
        // Get community details
        const { data: communities, error: communitiesError } = await supabase
            .from('communities')
            .select('*')
            .in('id', communityIds)
          
          if (communitiesError) {
          console.error("Error fetching communities:", communitiesError)
          throw new Error("Failed to fetch community details")
        }
        
        setMyCommunities(communities || [])
      } catch (error) {
        console.error("Error in fetchMyCommunities:", error)
        toast.error(error.message || "Failed to fetch your communities")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMyCommunities()
  }, [user])
  
  const openCreateForm = () => {
    if (!user) {
      toast.error("Please log in to create a community")
      navigate("/login")
      return
    }
    setShowCreateForm(true)
  }
  
  const openJoinForm = () => {
    if (!user) {
      toast.error("Please log in to join a community")
      navigate("/login")
      return
    }
    setShowJoinForm(true)
  }
  
  const handleCreateCommunity = async () => {
    if (!user) {
      toast.error("Please log in to create a community")
      navigate("/login")
      return
    }
    
    if (!name.trim()) {
      toast.error("Please enter a community name")
      return
    }
    
    if (!description.trim()) {
      toast.error("Please enter a community description")
      return
    }
    
    setIsCreatingCommunity(true)
    
    try {
      // Generate a unique invite code
      const inviteCode = nanoid(8)
      
      // Create community
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .insert([{
          name: name.trim(),
          description: description.trim(),
          admin_id: user.id,
          member_limit: memberLimit,
          deposit_limit: depositLimit,
          contribution_period: contributionPeriod,
          invite_code: inviteCode,
          total_balance: 0
        }])
        .select()
      
      if (communityError) {
        console.error("Error creating community:", communityError)
        throw new Error("Failed to create community: " + communityError.message)
      }
      
      if (!communityData || communityData.length === 0) {
        throw new Error("No data returned when creating community")
      }
      
      const communityId = communityData[0].id
      
      // Add the creator as a member
      const { error: memberError } = await supabase
        .from('community_members')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        }])
      
      if (memberError) {
        console.error("Error adding creator as member:", memberError)
        // Continue anyway - the community was created
      }
      
      toast.success("Community created successfully!")
      navigate(`/community/dashboard/${communityId}`)
    } catch (error) {
      console.error("Error in community creation:", error)
      toast.error(error.message || "Failed to create community. Please try again.")
    } finally {
      setIsCreatingCommunity(false)
      setShowCreateForm(false)
    }
  }
  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error("Please log in to join a community")
      navigate("/login")
      return
    }
    
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code")
      return
    }
    
    setIsJoiningCommunity(true)
    
    try {
      // Find the community with the invite code
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('invite_code', inviteCode.trim())
        .single()
      
      if (communityError) {
        if (communityError.code === 'PGRST116') {
          throw new Error("Invalid invite code. Please check and try again.")
        }
        throw new Error("Error finding community: " + communityError.message)
      }
      
      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('community_members')
        .select('*')
        .eq('community_id', communityData.id)
        .eq('user_id', user.id)
        .single()
      
      if (!memberCheckError && existingMember) {
        throw new Error("You are already a member of this community")
      }
      
      // Check if community is at member limit
      const { count, error: countError } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityData.id)
      
      if (countError) {
        console.error("Error checking member count:", countError)
      } else if (count >= communityData.member_limit) {
        throw new Error("This community has reached its member limit")
      }
      
      // Add user to community
      const { error: joinError } = await supabase
        .from('community_members')
        .insert([{
          community_id: communityData.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        }])
      
      if (joinError) {
        throw new Error("Failed to join community: " + joinError.message)
      }
      
      // Add system message about new member
      await supabase
        .from('community_messages')
        .insert([{
          community_id: communityData.id,
          user_id: user.id,
          content: `${user.user_metadata?.full_name || 'A new user'} has joined the community!`,
          type: 'system',
          created_at: new Date().toISOString()
        }])
      
      toast.success(`You've successfully joined "${communityData.name}"!`)
      navigate(`/community/dashboard/${communityData.id}`)
    } catch (error) {
      console.error("Error joining community:", error)
      toast.error(error.message || "Failed to join community. Please try again.")
    } finally {
      setIsJoiningCommunity(false)
      setShowJoinForm(false)
    }
  }
  
  // Get a random number within a range
  const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
  
  // Generate bubble elements for the animation
  const renderBubbles = () => {
    const bubbles = [];
    for (let i = 0; i < 15; i++) {
      const size = getRandomNumber(4, 18);
      const left = getRandomNumber(1, 99);
      const animationDuration = getRandomNumber(20, 40);
      const opacity = getRandomNumber(0.05, 0.2);
      
      bubbles.push(
        <div 
          key={i}
          className="absolute rounded-full bg-indigo-500"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            bottom: `-${size}px`,
            opacity: opacity,
            animation: `float ${animationDuration}s infinite ease-in-out`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      );
    }
    return bubbles;
  };
  
  return (
    <div className="pt-20 pb-24 bg-gray-900 min-h-screen relative overflow-hidden">
      {/* CSS for the floating animation */}
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-300px) translateX(${getRandomNumber(-30, 30)}px);
          }
          100% {
            transform: translateY(-600px) translateX(${getRandomNumber(-50, 50)}px);
            opacity: 0;
          }
        }
        
        @keyframes gradientBg {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .gradient-bg {
          background: linear-gradient(-45deg, #2a1d5880, #0f172a80, #1e1b4b80, #312e8180);
          background-size: 400% 400%;
          animation: gradientBg 15s ease infinite;
        }
        
        .community-card {
          transition: all 0.3s ease;
        }
        
        .community-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(88, 80, 236, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
        }
      `}</style>
      
      {/* Animated header background */}
      <div className="relative mb-16">
        <div className="absolute inset-0 overflow-hidden">
          {renderBubbles()}
        </div>
        
        <div className="gradient-bg absolute inset-0 opacity-70"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 shadow-text">Community Savings</h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Join existing communities or create your own to save together with friends, family, or colleagues.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <motion.button
              onClick={openCreateForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-lg border border-indigo-500 transition-all flex items-center justify-center group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Community
            </motion.button>
            
            <motion.button
              onClick={openJoinForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md shadow-lg border border-gray-700 hover:border-indigo-500 transition-all flex items-center justify-center group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Join Community
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* My Communities Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-white border-b-2 border-indigo-500 pb-1 inline-block">My Communities</h2>
            <div className="text-sm text-gray-500">
              {!isLoading && myCommunities.length > 0 && (
                <span>{myCommunities.length} communities joined</span>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 relative">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 opacity-20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : myCommunities.length === 0 ? (
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700 p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Communities Yet</h3>
              <p className="text-gray-400 mb-6">You haven't joined any communities yet. Create one or join with an invite code.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={openCreateForm}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center"
                >
                  Create Your First Community
                </button>
                <button
                  onClick={openJoinForm}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center"
                >
                  Join with Invite Code
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCommunities.map(community => (
                <motion.div 
                  key={community.id} 
                  className="community-card bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Admin badge at top right */}
                    <div className="flex justify-end mb-2">
                      {community.admin_id === user.id && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900 text-indigo-300 border border-indigo-800">
                          Admin
                        </span>
                      )}
                    </div>
                    
                    {/* Centered community name with larger typography */}
                    <div className="flex-grow flex flex-col items-center justify-center py-6 text-center">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                        {community.name}
                      </h3>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto">{community.description}</p>
                    </div>
                    
                    {/* Community details */}
                    <div className="bg-gray-750 rounded-md p-3 mb-4">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Members</span>
                        <span className="text-gray-300 font-medium">{community.member_limit} max</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Contribution</span>
                        <span className="text-gray-300 font-medium capitalize">{community.contribution_period}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Balance</span>
                        <span className="text-green-400 font-medium">${parseFloat(community.total_balance || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <Link
                        to={`/community/dashboard/${community.id}`}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center"
                      >
                        <span>View</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1"></div>
                  
                  <Link
                    to={`/community/dashboard/${community.id}`}
                    className="block py-3 text-center text-white font-medium border-t border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    Open Community
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Community Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-750 rounded-md p-4 flex items-start">
              <div className="bg-indigo-900 rounded-full p-2 mr-3 flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Collaborative Saving</h4>
                <p className="text-gray-400 text-sm">Save together with friends, family, or colleagues</p>
              </div>
            </div>
            
            <div className="bg-gray-750 rounded-md p-4 flex items-start">
              <div className="bg-indigo-900 rounded-full p-2 mr-3 flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Transaction Tracking</h4>
                <p className="text-gray-400 text-sm">Track contributions and withdrawals transparently</p>
              </div>
            </div>
            
            <div className="bg-gray-750 rounded-md p-4 flex items-start">
              <div className="bg-indigo-900 rounded-full p-2 mr-3 flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Community Chat</h4>
                <p className="text-gray-400 text-sm">Chat with members and manage community finances</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Community Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <motion.div 
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-700"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <h2 className="text-xl font-medium text-white mb-5">Create a Community</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                  Community Name*
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter community name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your community's purpose and goals"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contributionPeriod" className="block text-sm font-medium text-gray-400 mb-1">
                    Contribution Period*
                  </label>
                  <select
                    id="contributionPeriod"
                    value={contributionPeriod}
                    onChange={(e) => setContributionPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="memberLimit" className="block text-sm font-medium text-gray-400 mb-1">
                    Member Limit*
                  </label>
                  <input
                    id="memberLimit"
                    type="number"
                    value={memberLimit}
                    onChange={(e) => setMemberLimit(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="2"
                    max="1000"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="depositLimit" className="block text-sm font-medium text-gray-400 mb-1">
                  Deposit Limit (optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    id="depositLimit"
                    type="number"
                    value={depositLimit || ''}
                    onChange={(e) => setDepositLimit(e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full pl-7 pr-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="No limit"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                onClick={() => setShowCreateForm(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleCreateCommunity}
                disabled={isCreatingCommunity}
                whileHover={{ scale: isCreatingCommunity ? 1 : 1.05 }}
                whileTap={{ scale: isCreatingCommunity ? 1 : 0.95 }}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isCreatingCommunity ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : 'Create Community'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Join Community Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <motion.div 
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-700"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <h2 className="text-xl font-medium text-white mb-5">Join a Community</h2>
            
            <div className="space-y-4">
                    <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-400 mb-1">
                  Invite Code*
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter the community invite code"
                />
              </div>
              
              <div className="bg-indigo-900 bg-opacity-40 rounded-md px-4 py-3 text-sm text-indigo-200 flex items-start space-x-3 border border-indigo-800">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You need an invite code to join a community. Ask the community admin to share their code with you.</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                onClick={() => setShowJoinForm(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleJoinCommunity}
                disabled={isJoiningCommunity || !inviteCode.trim()}
                whileHover={{ scale: isJoiningCommunity || !inviteCode.trim() ? 1 : 1.05 }}
                whileTap={{ scale: isJoiningCommunity || !inviteCode.trim() ? 1 : 0.95 }}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
              {isJoiningCommunity ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Joining...
                  </>
                ) : 'Join Community'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
                    </div>
  )
}

export default JoinCommunity