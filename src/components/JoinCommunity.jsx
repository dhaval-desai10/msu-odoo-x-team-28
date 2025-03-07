import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { motion } from 'framer-motion'
import { nanoid } from 'nanoid'

const JoinCommunity = () => {
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contributionPeriod, setContributionPeriod] = useState('monthly')
  const [memberLimit, setMemberLimit] = useState(50)
  const [depositLimit, setDepositLimit] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  console.log("Current auth user:", user); // Debug log
  
  const openCreateForm = () => {
    console.log("Open form clicked, user state:", user); // Debug log
    
    if (!user) {
      toast.error("Please log in to create a community")
      navigate("/login")
          return
        }
    setShowCreateForm(true)
  }
  
  const handleCreateCommunity = async () => {
    console.log("Create community clicked, user state:", user); // Debug log
    
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
      
      console.log("Creating community with the following data:", {
        name: name.trim(),
        description: description.trim(),
        admin_id: user.id,
        member_limit: memberLimit,
        deposit_limit: depositLimit,
        contribution_period: contributionPeriod,
        invite_code: inviteCode,
        total_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      // Create community in database with ALL required fields
      const { data, error } = await supabase
        .from('communities')
        .insert([
          { 
            name: name.trim(),
            description: description.trim(),
            admin_id: user.id,
            member_limit: memberLimit,
            deposit_limit: depositLimit,
            contribution_period: contributionPeriod,
            invite_code: inviteCode,
            total_balance: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
      
      if (error) {
        console.error("Error creating community:", error)
        throw error
      }
      
      if (!data || data.length === 0) {
        throw new Error("Failed to create community: No data returned")
      }
      
      console.log("Community created successfully:", data[0])
      
      // Add the creator as a member of the community
      const { error: memberError } = await supabase
        .from('community_members')
        .insert([
          {
            community_id: data[0].id,
            user_id: user.id,
            joined_at: new Date().toISOString()
          }
        ])
      
      if (memberError) {
        console.error("Error adding user as community member:", memberError)
        // Continue anyway since the community was created
      } else {
        console.log("Added creator as community member")
      }
      
      toast.success("Community created successfully!")
      navigate(`/community/${data[0].id}`)
    } catch (error) {
      console.error("Detailed error creating community:", error)
      toast.error("Failed to create community. Please try again.")
    } finally {
      setIsCreatingCommunity(false)
      setShowCreateForm(false)
    }
  }
  
  return (
    <div className="pt-16 overflow-fix">
      {/* Create Community Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <motion.div 
            className="bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full mx-4 border border-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Create a Community</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Community Name*
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter community name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your community's purpose and goals"
                  rows="4"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="contributionPeriod" className="block text-sm font-medium text-gray-300 mb-2">
                  Contribution Period*
                </label>
                <select
                  id="contributionPeriod"
                  value={contributionPeriod}
                  onChange={(e) => setContributionPeriod(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="memberLimit" className="block text-sm font-medium text-gray-300 mb-2">
                  Member Limit*
                </label>
                <input
                  id="memberLimit"
                  type="number"
                  value={memberLimit}
                  onChange={(e) => setMemberLimit(parseInt(e.target.value) || 50)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  min="2"
                  max="1000"
                />
              </div>
              
              <div>
                <label htmlFor="depositLimit" className="block text-sm font-medium text-gray-300 mb-2">
                  Deposit Limit (optional)
                </label>
                <input
                  id="depositLimit"
                  type="number"
                  value={depositLimit || ''}
                  onChange={(e) => setDepositLimit(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Leave empty for no limit"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                disabled={isCreatingCommunity}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-indigo-500/30 transition-all flex items-center"
              >
                {isCreatingCommunity ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Community'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Create Community Section */}
      <section className="section section-light">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <span className="transparent-bg-accent text-accent-primary px-4 py-1 rounded-full text-sm font-bold">
                  Create Your Own
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-on-dark">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                  Create Your Own Community
                  </span>
                </h2>
                
                <p className="text-text-primary mb-8">
                  Start a community tailored to your interests or health needs. Set joining criteria, define contribution limits, and grow together.
                </p>
                
                <div className="space-y-6">
                  <div className="glass-effect p-4 border border-[rgba(99,102,241,0.2)]">
                    <div className="icon mr-4 inline-flex align-middle">🌱</div>
                    <div className="inline-block align-middle ml-2">
                      <h3 className="text-lg font-bold text-text-primary">Define Your Purpose</h3>
                      <p className="text-text-secondary">Create a community with a clear mission and goals that resonate with others.</p>
                    </div>
                  </div>
                  
                  <div className="glass-effect p-4 border border-[rgba(99,102,241,0.2)]">
                    <div className="icon mr-4 inline-flex align-middle">⚙️</div>
                    <div className="inline-block align-middle ml-2">
                      <h3 className="text-lg font-bold text-text-primary">Set Your Terms</h3>
                      <p className="text-text-secondary">Customize contribution amounts, withdrawal rules, and membership requirements.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button 
                    onClick={openCreateForm}
                    className="cta-button glow-effect"
                  >
                    Create a Community
                  </button>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="glass-effect p-1 rounded-2xl overflow-hidden shadow-glow border border-[rgba(99,102,241,0.3)]">
                  <img 
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2089&q=80" 
                    alt="People collaborating" 
                    className="rounded-2xl w-full transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Join Existing Section */}
      <section className="section section-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="transparent-bg-accent-secondary text-accent-secondary px-4 py-1 rounded-full text-sm font-bold">
                Join Others
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4 text-on-dark">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-secondary to-accent-tertiary">
                  Join an Existing Community
                </span>
              </h2>
              <p className="text-text-primary max-w-3xl mx-auto">
                Find communities that match your interests, values, and financial goals. Connect with like-minded savers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-8 hover:shadow-glow-secondary border border-[rgba(139,92,246,0.2)]">
                <div className="icon mb-4">🔍</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Browse Communities</h3>
                <p className="text-text-secondary">Explore communities based on interests, location, or savings goals.</p>
              </div>
              
              <div className="card p-8 hover:shadow-glow-secondary border border-[rgba(139,92,246,0.2)]">
                <div className="icon mb-4">🤝</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Apply to Join</h3>
                <p className="text-text-secondary">Request membership to communities that align with your goals.</p>
              </div>
              
              <div className="card p-8 hover:shadow-glow-secondary border border-[rgba(139,92,246,0.2)]">
                <div className="icon mb-4">🌟</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">Participate & Grow</h3>
                <p className="text-text-secondary">Contribute regularly and benefit from collective financial growth.</p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <a 
                href="/communities"
                className="cta-button secondary"
              >
                Browse Communities
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default JoinCommunity;