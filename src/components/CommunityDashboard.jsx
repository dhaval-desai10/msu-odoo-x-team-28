import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { supabase } from '../lib/supabase';

const CommunityDashboard = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawDocument, setWithdrawDocument] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Fetch community data
  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!user || !communityId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch community details
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('id', communityId)
          .single();
          
        if (communityError) {
          console.error('Error fetching community:', communityError);
          toast.error('Failed to load community data');
          navigate('/join');
          return;
        }
        
        setCommunity(communityData);
        
        // Check if user is admin
        setIsAdmin(communityData.admin_id === user.id);
        
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('community_members')
          .select('*, profiles(id, full_name, avatar_url)')
          .eq('community_id', communityId);
          
        if (membersError) {
          console.error('Error fetching members:', membersError);
        } else {
          setMembers(membersData || []);
        }
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('community_messages')
          .select('*, profiles(id, full_name, avatar_url)')
          .eq('community_id', communityId)
          .order('created_at', { ascending: true });
          
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
        } else {
          setMessages(messagesData || []);
        }
        
        // Fetch withdrawal requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('withdrawal_requests')
          .select('*, profiles(id, full_name, avatar_url)')
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });
          
        if (requestsError) {
          console.error('Error fetching withdrawal requests:', requestsError);
        } else {
          setWithdrawalRequests(requestsData || []);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchCommunityData:', error);
        toast.error('An unexpected error occurred');
        setIsLoading(false);
      }
    };
    
    fetchCommunityData();
    
    // Set up real-time subscriptions
    const messagesSubscription = supabase
      .channel('community_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `community_id=eq.${communityId}`
      }, (payload) => {
        // Fetch the user profile for the new message
        const fetchMessageWithProfile = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
            
          if (!error) {
            setMessages(prev => [...prev, { ...payload.new, profiles: data }]);
          }
        };
        
        fetchMessageWithProfile();
      })
      .subscribe();
      
    const requestsSubscription = supabase
      .channel('withdrawal_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests',
        filter: `community_id=eq.${communityId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch the user profile for the new request
          const fetchRequestWithProfile = async () => {
            const { data, error } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .eq('id', payload.new.user_id)
              .single();
              
            if (!error) {
              setWithdrawalRequests(prev => [{ ...payload.new, profiles: data }, ...prev]);
            }
          };
          
          fetchRequestWithProfile();
        } else if (payload.eventType === 'UPDATE') {
          setWithdrawalRequests(prev => 
            prev.map(req => req.id === payload.new.id ? { ...req, ...payload.new } : req)
          );
        }
      })
      .subscribe();
      
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(requestsSubscription);
    };
  }, [user, communityId, navigate]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }, [messages]);
  
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      const { error } = await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          content: newMessage,
          type: 'text',
          created_at: new Date().toISOString()
        }]);
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `community-files/${communityId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      // Add message with file link
      const { error: messageError } = await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          content: file.name,
          file_url: urlData.publicUrl,
          type: 'file',
          created_at: new Date().toISOString()
        }]);
        
      if (messageError) throw messageError;
      
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const amount = parseFloat(depositAmount);
      
      // Add transaction
      const { error: transactionError } = await supabase
        .from('community_transactions')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          amount: amount,
          type: 'deposit',
          created_at: new Date().toISOString()
        }]);
        
      if (transactionError) throw transactionError;
      
      // Update community balance
      const { error: updateError } = await supabase
        .from('communities')
        .update({ 
          total_balance: (community?.total_balance || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', communityId);
        
      if (updateError) throw updateError;
      
      // Update community in state
      setCommunity(prev => ({
        ...prev,
        total_balance: (prev?.total_balance || 0) + amount
      }));
      
      // Add system message
      await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          content: `deposited ${formatCurrency(amount)}`,
          type: 'system',
          created_at: new Date().toISOString()
        }]);
      
      setShowDepositModal(false);
      setDepositAmount('');
      toast.success('Deposit successful!');
    } catch (error) {
      console.error('Error depositing:', error);
      toast.error('Failed to deposit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWithdrawalRequest = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!withdrawReason.trim()) {
      toast.error('Please provide a reason for withdrawal');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    
    // Check if amount is less than 50% of total balance
    if (amount > (community?.total_balance || 0) * 0.5) {
      toast.error('Withdrawal amount cannot exceed 50% of total community funds');
      return;
    }
    
    try {
      setIsLoading(true);
      
      let documentUrl = null;
      
      // Upload document if provided
      if (withdrawDocument) {
        const fileExt = withdrawDocument.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `withdrawal-documents/${communityId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, withdrawDocument);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = await supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
          
        documentUrl = urlData.publicUrl;
      }
      
      // Create withdrawal request
      const { data: request, error: requestError } = await supabase
        .from('withdrawal_requests')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          amount: amount,
          reason: withdrawReason,
          document_url: documentUrl,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (requestError) throw requestError;
      
      // Add system message
      await supabase
        .from('community_messages')
        .insert([{
          community_id: communityId,
          user_id: user.id,
          content: `requested to withdraw ${formatCurrency(amount)}`,
          type: 'system',
          created_at: new Date().toISOString()
        }]);
      
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawReason('');
      setWithdrawDocument(null);
      toast.success('Withdrawal request submitted!');
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      toast.error('Failed to submit withdrawal request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVote = async (requestId, vote) => {
    try {
      setIsLoading(true);
      
      // Check if user already voted
      const { data: existingVote, error: voteCheckError } = await supabase
        .from('withdrawal_votes')
        .select('*')
        .eq('request_id', requestId)
        .eq('user_id', user.id)
        .single();
        
      if (voteCheckError && voteCheckError.code !== 'PGRST116') {
        throw voteCheckError;
      }
      
      if (existingVote) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from('withdrawal_votes')
          .update({ vote, updated_at: new Date().toISOString() })
          .eq('id', existingVote.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('withdrawal_votes')
          .insert([{
            request_id: requestId,
            user_id: user.id,
            vote,
            created_at: new Date().toISOString()
          }]);
          
        if (insertError) throw insertError;
      }
      
      // Get all votes for this request
      const { data: votes, error: votesError } = await supabase
        .from('withdrawal_votes')
        .select('vote')
        .eq('request_id', requestId);
        
      if (votesError) throw votesError;
      
      // Count approve/reject votes
      const approveCount = votes.filter(v => v.vote === 'approve').length;
      const rejectCount = votes.filter(v => v.vote === 'reject').length;
      
      // Check if majority has voted (more than 50% of members)
      const totalVotes = approveCount + rejectCount;
      const majorityThreshold = Math.ceil(members.length / 2);
      
      let newStatus = 'pending';
      
      if (totalVotes >= majorityThreshold) {
        if (approveCount > rejectCount) {
          newStatus = 'approved';
        } else {
          newStatus = 'rejected';
        }
      }
      
      // Update request status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // If approved, process the withdrawal
      if (newStatus === 'approved') {
        // Get request details
        const { data: request, error: requestError } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('id', requestId)
          .single();
          
        if (requestError) throw requestError;
        
        // Add transaction
        const { error: transactionError } = await supabase
          .from('community_transactions')
          .insert([{
            community_id: communityId,
            user_id: request.user_id,
            amount: request.amount,
            type: 'withdrawal',
            created_at: new Date().toISOString()
          }]);
          
        if (transactionError) throw transactionError;
        
        // Update community balance
        const { error: balanceError } = await supabase
          .from('communities')
          .update({ 
            total_balance: (community?.total_balance || 0) - request.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', communityId);
          
        if (balanceError) throw balanceError;
        
        // Update community in state
        setCommunity(prev => ({
          ...prev,
          total_balance: (prev?.total_balance || 0) - request.amount
        }));
        
        // Add system message
        await supabase
          .from('community_messages')
          .insert([{
            community_id: communityId,
            user_id: request.user_id,
            content: `withdrew ${formatCurrency(request.amount)} (approved by community)`,
            type: 'system',
            created_at: new Date().toISOString()
          }]);
      }
      
      // Update withdrawal requests in state
      setWithdrawalRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req)
      );
      
      toast.success(`Vote recorded: ${vote === 'approve' ? 'Approved' : 'Rejected'}`);
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  // Message List Animation Variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Message Component
  const Message = ({ message }) => {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={messageVariants}
        className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] p-3 rounded-lg ${
          message.user_id === user.id
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="flex items-center mb-1">
            {message.profiles?.avatar_url && (
              <img
                src={message.profiles.avatar_url}
                alt={message.profiles.full_name || 'User'}
                className="w-6 h-6 rounded-full mr-2"
              />
            )}
            <p className="font-medium text-sm">
              {message.profiles?.full_name || 'Anonymous User'}
            </p>
          </div>
          <p className="text-sm">{message.content}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(message.created_at)}
          </p>
        </div>
      </motion.div>
    );
  };
  
  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Not Logged In</h2>
          <p className="text-gray-600 mb-6">Please log in to view this community</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-primary hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading && !community) {
    return (
      <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Info Section */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center space-x-4 mb-6">
              {community.avatar_url ? (
                <img
                  src={community.avatar_url}
                  alt={community.name}
                  className="w-16 h-16 rounded-full"
                              />
                            ) : (
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  {community.name.charAt(0)}
                              </div>
                            )}
                            <div>
                <h1 className="text-2xl font-bold text-gray-800">{community.name}</h1>
                <p className="text-sm text-gray-500">{community.description}</p>
                            </div>
                          </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Balance:</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(community.total_balance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Members:</span>
                <span className="font-medium text-gray-800">
                  {members.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-800">
                  {formatDate(community.created_at)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Chat Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6"
          >
            <div className="h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <Message key={message.id} message={message} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 pt-4">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-md"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Deposit to Community</h2>
            
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Deposit
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 ${
                  isLoading || !depositAmount || parseFloat(depositAmount) <= 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Withdrawal</h2>
            
            <div className="mb-4">
              <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Withdraw
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="withdraw-amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
                  placeholder="0.00"
                  min="0.01"
                  max={community ? community.total_balance * 0.5 : 0}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum withdrawal: {formatCurrency(community ? community.total_balance * 0.5 : 0)} (50% of total funds)
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Withdrawal
              </label>
              <textarea
                id="reason"
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Explain why you need these funds..."
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Document (Optional)
              </label>
              <input
                type="file"
                id="document"
                onChange={(e) => setWithdrawDocument(e.target.files[0])}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-opacity-90"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload proof or documentation if available (max 5MB)
              </p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawalRequest}
                disabled={
                  isLoading || 
                  !withdrawAmount || 
                  parseFloat(withdrawAmount) <= 0 || 
                  !withdrawReason.trim()
                }
                className={`px-4 py-2 bg-secondary text-white rounded-md hover:bg-opacity-90 ${
                  isLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !withdrawReason.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CommunityDashboard;