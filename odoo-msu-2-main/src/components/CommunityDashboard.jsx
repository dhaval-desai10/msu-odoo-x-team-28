import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const CommunityDashboard = () => {
  const { communityId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const messagesEndRef = useRef(null)
  
  // State
  const [community, setCommunity] = useState(null)
  const [members, setMembers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [withdrawalReason, setWithdrawalReason] = useState('')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [withdrawalRequests, setWithdrawalRequests] = useState([])
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false)
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const fileInputRef = useRef(null)
  
  // Subscription cleanup references
  const messageSubscriptionRef = useRef(null)
  const withdrawalSubscriptionRef = useRef(null)
  const transactionSubscriptionRef = useRef(null)
  
  // Add this state for tracking refresh operation
  const [isRefreshingTransactions, setIsRefreshingTransactions] = useState(false)
  
  // Fetch data on component mount
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to view this community")
      navigate("/login")
      return
    }
    
    fetchCommunityData()
    
    // Cleanup function for subscriptions
    return () => {
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current.unsubscribe()
      }
      
      if (withdrawalSubscriptionRef.current) {
        withdrawalSubscriptionRef.current.unsubscribe()
      }
      
      if (transactionSubscriptionRef.current) {
        transactionSubscriptionRef.current.unsubscribe()
      }
    }
  }, [communityId, user])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  const fetchCommunityData = async () => {
    if (!user || !communityId) return
    
    try {
      setIsLoading(true)
      
      // Fetch community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single()
      
      if (communityError) {
        throw new Error("Failed to fetch community: " + communityError.message)
      }
      
      setCommunity(communityData)
      
      // Check if user is admin
      setIsAdmin(communityData.admin_id === user.id)
      
      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('community_members')
        .select(`
          *,
          profiles:user_id(id, full_name, avatar_url, email)
        `)
        .eq('community_id', communityId)
      
      if (membersError) {
        console.error("Error fetching members:", membersError)
        
        // Fallback to simpler query if the join fails
        const { data: simpleMembersData, error: simpleMembersError } = await supabase
          .from('community_members')
          .select('*')
          .eq('community_id', communityId)
        
        if (simpleMembersError) {
          throw new Error("Failed to fetch members: " + simpleMembersError.message)
        }
        
        setMembers(simpleMembersData || [])
      } else {
        setMembers(membersData || [])
      }
      
      // Fetch messages with user profiles
      const fetchMessageWithProfile = async () => {
        const { data: messagesData, error: messagesError } = await supabase
          .from('community_messages')
          .select(`
            *,
            profiles:user_id(id, full_name, avatar_url)
          `)
          .eq('community_id', communityId)
          .order('created_at', { ascending: true })
        
        if (messagesError) {
          console.error("Error fetching messages with profiles:", messagesError)
          
          // Fallback to simpler query
          const { data: simpleMessagesData, error: simpleMessagesError } = await supabase
            .from('community_messages')
            .select('*')
            .eq('community_id', communityId)
            .order('created_at', { ascending: true })
          
          if (simpleMessagesError) {
            throw new Error("Failed to fetch messages: " + simpleMessagesError.message)
          }
          
          setMessages(simpleMessagesData || [])
        } else {
          setMessages(messagesData || [])
        }
      }
      
      await fetchMessageWithProfile()
      
      // Fetch transactions with better error handling
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('community_transactions')
        .select(`
          *,
          profiles:user_id(id, full_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
      
      if (transactionsError) {
        console.error("Error fetching transactions with profiles:", transactionsError)
        
        // Try simpler query as fallback
        const { data: simpleTransactions, error: simpleError } = await supabase
          .from('community_transactions')
          .select('*')
          .eq('community_id', communityId)
          .order('created_at', { ascending: false })
          
        if (simpleError) {
          console.error("Error with fallback transaction query:", simpleError)
        } else {
          // If we got transactions but without profile data, let's manually attach basic profile data
          if (simpleTransactions && simpleTransactions.length > 0) {
            // Get list of unique user IDs
            const userIds = [...new Set(simpleTransactions.map(t => t.user_id))];
            
            // Fetch profiles for these users
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', userIds);
              
            // Create a lookup map of profiles by ID
            const profileMap = {};
            if (profiles) {
              profiles.forEach(profile => {
                profileMap[profile.id] = profile;
              });
            }
            
            // Attach profiles to transactions
            const transactionsWithProfiles = simpleTransactions.map(transaction => ({
              ...transaction,
              profiles: profileMap[transaction.user_id] || null
            }));
            
            setTransactions(transactionsWithProfiles);
          } else {
            setTransactions(simpleTransactions || []);
          }
        }
      } else {
        setTransactions(transactionsData || []);
      }
      
      // Fetch withdrawal requests
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles:user_id(id, full_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
      
      if (withdrawalError) {
        console.error("Error fetching withdrawal requests:", withdrawalError)
      } else {
        setWithdrawalRequests(withdrawalData || [])
      }
      
      // Set up message subscription
      messageSubscriptionRef.current = supabase
        .channel(`messages-${communityId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`
        }, async (payload) => {
          console.log("New message received via subscription:", payload);
          
          // Skip messages we already added optimistically
          // Check if we have a temporary message with similar content
          const existingOptimisticMsg = messages.find(m => 
            (m.id && m.id.toString().startsWith('temp-')) && 
            m.content === payload.new.content && 
            m.user_id === payload.new.user_id &&
            Math.abs(new Date(m.created_at) - new Date(payload.new.created_at)) < 10000
          );
          
          if (existingOptimisticMsg) {
            // Replace the optimistic message with the real one
            setMessages(prev => prev.map(m => 
              m.id === existingOptimisticMsg.id ? payload.new : m
            ));
            return;
          }
          
          // For system messages, we can just add them directly
          if (payload.new.type === 'system') {
            setMessages(prev => [...prev, payload.new]);
            setTimeout(scrollToBottom, 50);
            return;
          }
          
          // For regular messages, fetch the user profile
          try {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', payload.new.user_id)
              .single();
            
            if (userError) {
              console.warn("Error fetching user profile for new message:", userError);
              setMessages(prev => [...prev, payload.new]);
            } else {
              setMessages(prev => [...prev, { ...payload.new, profiles: userData }]);
            }
            
            setTimeout(scrollToBottom, 50);
          } catch (error) {
            console.error("Error handling new message:", error);
            setMessages(prev => [...prev, payload.new]);
            setTimeout(scrollToBottom, 50);
          }
        })
        .subscribe();
      
    } catch (error) {
      console.error("Error in fetchCommunityData:", error)
      toast.error(error.message || "Failed to load community data")
      navigate("/community/join")
    } finally {
      setIsLoading(false)
    }
  }
  
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      // Create message data object
      const messageData = {
        community_id: communityId,
        user_id: user.id,
        content: newMessage.trim(),
        type: 'text',
        created_at: new Date().toISOString()
      };
      
      // Optimistically add message to UI first (before database saves it)
      const optimisticMessage = {
        ...messageData,
        id: `temp-${Date.now()}`, // Temporary ID
        profiles: {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'You',
          avatar_url: user.user_metadata?.avatar_url
        }
      };
      
      // Update UI immediately
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Clear input right away for better UX
      setNewMessage('');
      
      // Scroll to bottom after adding the new message
      setTimeout(scrollToBottom, 50);
      
      // Now save to database
      const { data, error } = await supabase
        .from('community_messages')
        .insert([messageData])
        .select();
      
      if (error) {
        throw new Error("Failed to send message: " + error.message);
      }
      
      // If we have the real ID, update the optimistic message
      if (data && data.length > 0) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === optimisticMessage.id ? { ...msg, id: data[0].id } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
      
      // Remove the optimistic message if there was an error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== `temp-${Date.now()}`)
      );
    }
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }
    
    setUploading(true)
    
    try {
      // Upload file to storage
      const fileName = `${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('community_files')
        .upload(`community_${communityId}/${fileName}`, file)
      
      if (uploadError) {
        throw new Error("Failed to upload file: " + uploadError.message)
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('community_files')
        .getPublicUrl(`community_${communityId}/${fileName}`)
      
      // Add message with file
      const { error: messageError } = await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          content: file.name,
          file_url: publicUrl,
          type: 'file'
        }])
      
      if (messageError) {
        throw new Error("Failed to send file: " + messageError.message)
      }
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = null
      }
      
      toast.success("File uploaded successfully")
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error(error.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }
  
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }
    
    setIsProcessingDeposit(true);
    
    try {
      const amount = parseFloat(depositAmount);
      
      // Update community balance
      const newBalance = parseFloat(community.total_balance || 0) + amount;
      
      const { error: updateError } = await supabase
        .from('communities')
        .update({ total_balance: newBalance })
        .eq('id', communityId);
      
      if (updateError) {
        throw new Error("Failed to update community balance: " + updateError.message);
      }
      
      // Try to record the transaction (but don't fail if it doesn't work)
      try {
        await supabase
          .from('community_transactions')
          .insert([{
            community_id: communityId,
            user_id: user.id,
            amount: amount,
            type: 'deposit',
            created_at: new Date().toISOString()
          }]);
      } catch (transactionError) {
        console.warn("Could not record transaction, but balance was updated:", transactionError);
        // Continue anyway - the deposit succeeded even if the transaction record failed
      }
      
      // Create the system message content
      const systemMessageContent = `${user.user_metadata?.full_name || 'A member'} deposited $${amount.toFixed(2)}`;
      
      // 1. First add the system message to the UI immediately
      const optimisticSystemMessage = {
        id: `temp-${Date.now()}`,
        community_id: communityId,
        user_id: user.id,
        content: systemMessageContent,
        type: 'system',
        created_at: new Date().toISOString()
      };
      
      // Update messages state with the new system message
      setMessages(prevMessages => [...prevMessages, optimisticSystemMessage]);
      
      // Scroll to show the new message
      setTimeout(scrollToBottom, 50);
      
      // 2. Then save the system message to the database
      await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          content: systemMessageContent,
          type: 'system',
          created_at: new Date().toISOString()
        }]);
      
      // Update UI state
      setCommunity(prev => ({
        ...prev,
        total_balance: newBalance
      }));
      
      setDepositAmount('');
      setShowDepositModal(false);
      toast.success(`Successfully deposited $${amount.toFixed(2)}`);
    } catch (error) {
      console.error("Error processing deposit:", error);
      toast.error(error.message || "Failed to process deposit");
    } finally {
      setIsProcessingDeposit(false);
    }
  };
  
  const handleWithdrawalRequest = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      toast.error("Please enter a valid withdrawal amount")
      return
    }
    
    if (parseFloat(withdrawalAmount) > parseFloat(community.total_balance)) {
      toast.error("Withdrawal amount exceeds community balance")
      return
    }
    
    if (!withdrawalReason.trim()) {
      toast.error("Please provide a reason for withdrawal")
      return
    }
    
    setIsProcessingWithdrawal(true)
    
    try {
      const amount = parseFloat(withdrawalAmount)
      
      // Add withdrawal request
      const { error: requestError } = await supabase
        .from('withdrawal_requests')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          amount: amount,
          reason: withdrawalReason.trim(),
          status: 'pending',
          created_at: new Date().toISOString()
        }])
      
      if (requestError) {
        throw new Error("Failed to submit withdrawal request: " + requestError.message)
      }
      
      // Create system message content
      const systemMessageContent = `${user.user_metadata?.full_name || 'A member'} requested a withdrawal of $${amount.toFixed(2)}`;
      
      // 1. Add system message to UI immediately
      const optimisticSystemMessage = {
        id: `temp-${Date.now()}`,
        community_id: communityId,
        user_id: user.id,
        content: systemMessageContent,
        type: 'system',
        created_at: new Date().toISOString()
      };
      
      // Update messages state
      setMessages(prevMessages => [...prevMessages, optimisticSystemMessage]);
      
      // Scroll to show the new message
      setTimeout(scrollToBottom, 50);
      
      // 2. Then save to database
      await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          content: systemMessageContent,
          type: 'system',
          created_at: new Date().toISOString()
        }]);
      
      setWithdrawalAmount('')
      setWithdrawalReason('')
      setShowWithdrawalModal(false)
      toast.success("Withdrawal request submitted")
    } catch (error) {
      console.error("Error processing withdrawal request:", error)
      toast.error(error.message || "Failed to submit withdrawal request")
    } finally {
      setIsProcessingWithdrawal(false)
    }
  }
  
  const approveWithdrawal = async (requestId) => {
    try {
      // Get the request details
      const request = withdrawalRequests.find(r => r.id === requestId)
      if (!request) {
        throw new Error("Withdrawal request not found")
      }
      
      // Update request status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', requestId)
      
      if (updateError) {
        throw new Error("Failed to approve withdrawal: " + updateError.message)
      }
      
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('community_transactions')
        .insert([{
          community_id: communityId,
          user_id: request.user_id,
          amount: request.amount,
          type: 'withdrawal',
          status: 'completed',
          description: request.reason,
          created_at: new Date().toISOString()
        }])
      
      if (transactionError) {
        throw new Error("Failed to record transaction: " + transactionError.message)
      }
      
      // Update community balance
      const newBalance = parseFloat(community.total_balance) - parseFloat(request.amount)
      
      const { error: balanceError } = await supabase
        .from('communities')
        .update({ total_balance: newBalance })
        .eq('id', communityId)
      
      if (balanceError) {
        throw new Error("Failed to update community balance: " + balanceError.message)
      }
      
      // Add system message
      const userName = request.profiles?.full_name || 'A member'
      
      await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          content: `Admin approved ${userName}'s withdrawal request for $${parseFloat(request.amount).toFixed(2)}`,
          type: 'system',
          created_at: new Date().toISOString()
        }])
      
      // Update UI
      setCommunity({ ...community, total_balance: newBalance })
      setWithdrawalRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'approved', approved_at: new Date().toISOString() } : r)
      )
      
      toast.success("Withdrawal request approved")
    } catch (error) {
      console.error("Error approving withdrawal:", error)
      toast.error(error.message || "Failed to approve withdrawal")
    }
  }
  
  const rejectWithdrawal = async (requestId) => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'rejected', approved_at: new Date().toISOString() })
        .eq('id', requestId)
      
      if (updateError) {
        throw new Error("Failed to reject withdrawal: " + updateError.message)
      }
      
      // Get the request details
      const request = withdrawalRequests.find(r => r.id === requestId)
      
      // Add system message
      if (request) {
        const userName = request.profiles?.full_name || 'A member'
        
        await supabase
          .from('community_messages')
          .insert([{
            community_id: communityId,
            user_id: user.id,
            content: `Admin rejected ${userName}'s withdrawal request for $${parseFloat(request.amount).toFixed(2)}`,
            type: 'system',
            created_at: new Date().toISOString()
          }])
      }
      
      // Update UI
      setWithdrawalRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status: 'rejected', approved_at: new Date().toISOString() } : r)
      )
      
      toast.success("Withdrawal request rejected")
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
      toast.error(error.message || "Failed to reject withdrawal")
    }
  }
  
  const copyInviteCode = () => {
    if (!community) return
    
    navigator.clipboard.writeText(community.invite_code)
      .then(() => {
        toast.success("Invite code copied to clipboard")
      })
      .catch((error) => {
        console.error("Error copying invite code:", error)
        toast.error("Failed to copy invite code")
      })
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00'
    return `$${parseFloat(amount).toFixed(2)}`
  }
  
  const Message = ({ message }) => {
    const isCurrentUser = message.user_id === user?.id
    const isSystemMessage = message.type === 'system'
    
    if (isSystemMessage) {
      return (
        <div className="flex justify-center my-2">
          <div className="bg-gray-800 bg-opacity-60 rounded-full px-4 py-1 text-xs text-gray-400">
            {message.content}
          </div>
        </div>
      )
    }
    
    return (
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[75%]`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {message.profiles?.avatar_url ? (
                <img 
                  src={message.profiles.avatar_url} 
                  alt={message.profiles?.full_name || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 font-medium text-sm">
                  {(message.profiles?.full_name || 'User').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          {/* Message content */}
          <div>
            <div className={`text-xs text-gray-500 mb-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
              {message.profiles?.full_name || 'User'} • {formatDate(message.created_at)}
            </div>
            
            {message.type === 'file' ? (
              <div className={`rounded-lg p-3 ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                <a 
                  href={message.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="truncate">{message.content}</span>
                </a>
              </div>
            ) : (
              <div className={`rounded-lg p-3 ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                {message.content}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  const TransactionItem = ({ transaction }) => {
    const isDeposit = transaction.type === 'deposit';
    
    // Get user name with fallbacks
    const userName = transaction.profiles?.full_name || 
                    (transaction.user_id === user?.id ? (user.user_metadata?.full_name || 'You') : 'Unknown User');
    
    return (
      <div className="border-b border-gray-700 py-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isDeposit ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
              {isDeposit ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0-16l-4 4m4-4l4 4" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </div>
            <div>
              <div className="font-medium text-white">
                {isDeposit ? 'Deposit' : 'Withdrawal'}
              </div>
              <div className="text-xs text-gray-400">
                By {userName}
              </div>
            </div>
          </div>
          <div className={`text-right ${isDeposit ? 'text-green-400' : 'text-red-400'}`}>
            <div className="font-medium">
              {isDeposit ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
            <div className="text-xs text-gray-400">
              {formatDate(transaction.created_at)}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const WithdrawalRequestItem = ({ request }) => {
    const isPending = request.status === 'pending'
    const isApproved = request.status === 'approved'
    const isRejected = request.status === 'rejected'
    
    return (
      <div className="border-b border-gray-700 py-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 
              ${isPending ? 'bg-yellow-900 text-yellow-400' : isApproved ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
              {isPending ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isApproved ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <div className="font-medium text-white flex items-center">
                Withdrawal Request
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full
                  ${isPending ? 'bg-yellow-900 text-yellow-400' : isApproved ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                  {isPending ? 'Pending' : isApproved ? 'Approved' : 'Rejected'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                By {request.profiles?.full_name || 'Unknown User'} • {formatDate(request.created_at)}
              </div>
            </div>
          </div>
          <div className="text-right text-red-400">
            <div className="font-medium">
              -{formatCurrency(request.amount)}
            </div>
          </div>
        </div>
        
        <div className="pl-11 mb-2">
          <div className="text-sm text-gray-300 mb-1">Reason:</div>
          <div className="text-sm bg-gray-800 rounded p-2 text-gray-300">
            {request.reason}
          </div>
        </div>
        
        {isPending && isAdmin && (
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => rejectWithdrawal(request.id)}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              Reject
            </button>
            <button
              onClick={() => approveWithdrawal(request.id)}
              className="px-3 py-1 text-xs bg-green-700 hover:bg-green-600 text-white rounded"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    )
  }
  
  // Add this function for manual refreshing of transactions
  const refreshTransactions = async () => {
    setIsRefreshingTransactions(true);
    try {
      const { data, error } = await supabase
        .from('community_transactions')
        .select(`
          *,
          profiles:user_id(id, full_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error refreshing transactions:", error);
        toast.error("Could not refresh transactions");
      } else {
        setTransactions(data || []);
        toast.success("Transactions refreshed");
      }
    } catch (error) {
      console.error("Error in refreshTransactions:", error);
      toast.error("Failed to refresh transactions");
    } finally {
      setIsRefreshingTransactions(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 pb-12 flex items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 opacity-20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }
  
  if (!community) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 pb-12 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-white mb-4">Community Not Found</div>
        <p className="text-gray-400 mb-8">This community may have been deleted or you don't have access to it.</p>
        <Link to="/community/join" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">
          Go to Communities
        </Link>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Community Header */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-white mb-1">{community.name}</h1>
                <p className="text-gray-400">{community.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Deposit
                </button>
                
                <button
                  onClick={() => setShowWithdrawalModal(true)}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-medium rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Withdraw
                </button>
                
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Invite
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-750 rounded-lg p-4 h-full">
                <div className="text-sm text-gray-400 mb-1">Total Balance</div>
                <div className="text-xl font-bold text-green-400">{formatCurrency(community.total_balance)}</div>
              </div>
              
              <div className="bg-gray-750 rounded-lg p-4 h-full">
                <div className="text-sm text-gray-400 mb-1">Members</div>
                <div className="text-xl font-bold text-white">{members.length} / {community.member_limit}</div>
              </div>
              
              <div className="bg-gray-750 rounded-lg p-4 h-full">
                <div className="text-sm text-gray-400 mb-1">Contribution Period</div>
                <div className="text-xl font-bold text-white capitalize">{community.contribution_period}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6 h-auto">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-medium text-white">Members</h2>
              </div>
              
              <div className="p-4">
                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                        {member.profiles?.avatar_url ? (
                          <img 
                            src={member.profiles.avatar_url} 
                            alt={member.profiles?.full_name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 font-medium text-sm">
                            {/* Show first letter of name with better fallbacks */}
                            {member.user_id === user?.id 
                              ? (user.user_metadata?.full_name || 'You').charAt(0).toUpperCase()
                              : (member.profiles?.full_name || 'User').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {/* Show proper name with better fallbacks */}
                          {member.user_id === user?.id 
                            ? (user.user_metadata?.full_name || 'You') 
                            : (member.profiles?.full_name || 'User')}
                            
                          {community.admin_id === member.user_id && (
                            <span className="ml-2 text-xs bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded">Admin</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {members.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-gray-500">No members found</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Invite Members
                  </button>
                </div>
              </div>
            </div>
            
            {isAdmin && withdrawalRequests.filter(r => r.status === 'pending').length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-white">Pending Withdrawals</h2>
                  <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs font-medium rounded-full">
                    {withdrawalRequests.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {withdrawalRequests
                    .filter(r => r.status === 'pending')
                    .map(request => (
                      <WithdrawalRequestItem key={request.id} request={request} />
                    ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-6 py-3 text-sm font-medium flex-1 ${
                    activeTab === 'chat' 
                      ? 'text-white border-b-2 border-indigo-500 bg-gray-750' 
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-750'
                  }`}
                >
                  Group Chat
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-6 py-3 text-sm font-medium flex-1 ${
                    activeTab === 'transactions' 
                      ? 'text-white border-b-2 border-indigo-500 bg-gray-750' 
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-750'
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`px-6 py-3 text-sm font-medium flex-1 ${
                    activeTab === 'withdrawals' 
                      ? 'text-white border-b-2 border-indigo-500 bg-gray-750' 
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-750'
                  }`}
                >
                  Withdrawals
                </button>
              </div>
              
              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-[600px]">
                  {/* Messages Area */}
                  <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 bg-gray-750 rounded-full flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
                        <p className="text-gray-400 max-w-sm">
                          Be the first to send a message to this community!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {messages.map((message) => (
                          <Message key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-700">
                    <form onSubmit={sendMessage} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-300 rounded-full"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </button>
                      
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow mx-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Type a message..."
                      />
                      
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="flex-shrink-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              )}
              
              {/* Transactions Tab with debugging */}
              {activeTab === 'transactions' && (
                <div className="p-4 h-[600px] overflow-y-auto custom-scrollbar">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Transaction History</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={refreshTransactions}
                        disabled={isRefreshingTransactions}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        {isRefreshingTransactions ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                        )}
                      </button>
                      <div className="text-sm text-gray-400">
                        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {transactions.map((transaction) => (
                      <TransactionItem key={transaction.id || transaction.created_at} transaction={transaction} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Withdrawals Tab */}
              {activeTab === 'withdrawals' && (
                <div className="p-4 h-[600px] overflow-y-auto custom-scrollbar">
                  {withdrawalRequests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="w-16 h-16 bg-gray-750 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No withdrawal requests</h3>
                      <p className="text-gray-400 max-w-sm mb-6">
                        Need to withdraw funds from the community? Create a withdrawal request.
                      </p>
                      <button
                        onClick={() => setShowWithdrawalModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded"
                      >
                        Request Withdrawal
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {withdrawalRequests.map((request) => (
                        <WithdrawalRequestItem key={request.id} request={request} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <motion.div 
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-700"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <h2 className="text-xl font-medium text-white mb-5">Make a Deposit</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-400 mb-1">
                  Amount*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    id="depositAmount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="bg-indigo-900 bg-opacity-40 rounded-md px-4 py-3 text-sm text-indigo-200 flex items-start space-x-3 border border-indigo-800">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This is a simulated deposit. In a real application, this would connect to a payment provider.</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                onClick={() => setShowDepositModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleDeposit}
                disabled={isProcessingDeposit || !depositAmount || parseFloat(depositAmount) <= 0}
                whileHover={{ scale: isProcessingDeposit ? 1 : 1.05 }}
                whileTap={{ scale: isProcessingDeposit ? 1 : 0.95 }}
                className="px-4 py-2 text-sm bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessingDeposit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : 'Make Deposit'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <motion.div 
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-700"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <h2 className="text-xl font-medium text-white mb-5">Request Withdrawal</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="withdrawalAmount" className="block text-sm font-medium text-gray-400 mb-1">
                  Amount*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    id="withdrawalAmount"
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                    min="0.01"
                    max={community.total_balance}
                    step="0.01"
                  />
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Available balance: {formatCurrency(community.total_balance)}
                </div>
              </div>
              
              <div>
                <label htmlFor="withdrawalReason" className="block text-sm font-medium text-gray-400 mb-1">
                  Reason*
                </label>
                <textarea
                  id="withdrawalReason"
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Why are you requesting this withdrawal?"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="bg-yellow-900 bg-opacity-40 rounded-md px-4 py-3 text-sm text-yellow-200 flex items-start space-x-3 border border-yellow-800">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Withdrawal requests need approval from the community admin. Please provide a clear reason.</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <motion.button
                onClick={() => setShowWithdrawalModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleWithdrawalRequest}
                disabled={
                  isProcessingWithdrawal || 
                  !withdrawalAmount || 
                  parseFloat(withdrawalAmount) <= 0 ||
                  parseFloat(withdrawalAmount) > parseFloat(community.total_balance) ||
                  !withdrawalReason.trim()
                }
                whileHover={{ scale: isProcessingWithdrawal ? 1 : 1.05 }}
                whileTap={{ scale: isProcessingWithdrawal ? 1 : 0.95 }}
                className="px-4 py-2 text-sm bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessingWithdrawal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : 'Request Withdrawal'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <motion.div 
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-700"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <h2 className="text-xl font-medium text-white mb-5">Invite Members</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-750 rounded-md p-4">
                <div className="text-sm text-gray-400 mb-2">Invite Code</div>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={community.invite_code}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-l focus:outline-none"
                  />
                  <button
                    onClick={copyInviteCode}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r border border-indigo-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Share this invite code with friends</div>
                <p className="text-sm text-gray-500">
                  Members can join your community by entering this code on the "Join Community" page.
                </p>
              </div>
              
              <div className="bg-indigo-900 bg-opacity-40 rounded-md px-4 py-3 text-sm text-indigo-200 flex items-start space-x-3 border border-indigo-800">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your community has a limit of {community.member_limit} members. Currently {members.length} have joined.</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <motion.button
                onClick={() => setShowInviteModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default CommunityDashboard