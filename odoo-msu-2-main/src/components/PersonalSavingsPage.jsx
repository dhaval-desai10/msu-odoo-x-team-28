import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const PersonalSavingsPage = () => {
  const { user, profile } = useAuthStore();
  const [dailyGoal, setDailyGoal] = useState(1);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [lastSavedDate, setLastSavedDate] = useState(null);
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [coinsVisible, setCoinsVisible] = useState([]);
  
  const streakRef = useRef(null);
  const piggyRef = useRef(null);
  const isStreakInView = useInView(streakRef, { once: false, amount: 0.3 });
  
  // Fetch user savings data
  useEffect(() => {
    const fetchSavingsData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch user's savings profile
        const { data: savingsProfile, error: profileError } = await supabase
          .from('savings_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching savings profile:', profileError);
          toast.error('Failed to load savings data');
          setIsLoading(false);
          return;
        }
        
        // If profile doesn't exist, create one
        if (!savingsProfile) {
          const { data: newProfile, error: createError } = await supabase
            .from('savings_profiles')
            .insert([{
              user_id: user.id,
              daily_goal: 1,
              current_streak: 0,
              total_saved: 0,
              last_saved_date: null,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating savings profile:', createError);
            toast.error('Failed to initialize savings profile');
            setIsLoading(false);
            return;
          }
          
          setDailyGoal(newProfile.daily_goal);
          setCurrentStreak(newProfile.current_streak);
          setTotalSaved(newProfile.total_saved);
          setLastSavedDate(newProfile.last_saved_date);
        } else {
          setDailyGoal(savingsProfile.daily_goal);
          setCurrentStreak(savingsProfile.current_streak);
          setTotalSaved(savingsProfile.total_saved);
          setLastSavedDate(savingsProfile.last_saved_date);
        }
        
        // Fetch savings history
        const { data: history, error: historyError } = await supabase
          .from('savings_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (historyError) {
          console.error('Error fetching savings history:', historyError);
        } else {
          setSavingsHistory(history || []);
        }
        
        // Fetch badges
        const { data: userBadges, error: badgesError } = await supabase
          .from('user_badges')
          .select('*, badges(*)')
          .eq('user_id', user.id);
          
        if (badgesError) {
          console.error('Error fetching badges:', badgesError);
        } else {
          setBadges(userBadges?.map(ub => ub.badges) || []);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchSavingsData:', error);
        toast.error('An unexpected error occurred');
        setIsLoading(false);
      }
    };
    
    fetchSavingsData();
  }, [user]);
  
  // Coin animation for piggy bank
  useEffect(() => {
    if (!piggyRef.current || !user) return;
    
    const coinInterval = setInterval(() => {
      const newCoin = {
        id: Date.now(),
        left: Math.random() * 80 + 10, // 10-90% width
        delay: Math.random() * 0.5,
        duration: Math.random() * 1 + 1.5, // 1.5-2.5s
        rotation: Math.random() * 360,
        scale: Math.random() * 0.3 + 0.7, // 0.7-1.0 scale
      };
      
      setCoinsVisible(prev => [...prev, newCoin]);
      
      // Remove coin after animation completes
      setTimeout(() => {
        setCoinsVisible(prev => prev.filter(coin => coin.id !== newCoin.id));
      }, (newCoin.duration + newCoin.delay + 0.5) * 1000);
    }, 2000); // New coin every 2 seconds
    
    return () => clearInterval(coinInterval);
  }, [user]);
  
  const handleSaveToday = async () => {
    if (!user) {
      toast.error('Please log in to save');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check if already saved today
      const today = new Date().toISOString().split('T')[0];
      if (lastSavedDate && lastSavedDate.split('T')[0] === today) {
        toast.error('You have already saved today!');
        setIsLoading(false);
        return;
      }
      
      // Add transaction
      const { error: transactionError } = await supabase
        .from('savings_transactions')
        .insert([{
          user_id: user.id,
          amount: dailyGoal,
          type: 'deposit',
          created_at: new Date().toISOString()
        }]);
        
      if (transactionError) {
        throw transactionError;
      }
      
      // Update profile
      const newStreak = lastSavedDate ? 
        (new Date(today) - new Date(lastSavedDate.split('T')[0]) <= 86400000 ? currentStreak + 1 : 1) : 
        1;
      
      const newTotal = totalSaved + dailyGoal;
      
      const { error: updateError } = await supabase
        .from('savings_profiles')
        .update({
          current_streak: newStreak,
          total_saved: newTotal,
          last_saved_date: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Check for badges
      if (newStreak === 7) {
        await awardBadge('weekly_streak');
        toast.success('🏆 You earned the Weekly Streak badge!');
      } else if (newStreak === 30) {
        await awardBadge('monthly_streak');
        toast.success('🏆 You earned the Monthly Streak badge!');
      }
      
      if (newTotal >= 100) {
        await awardBadge('savings_100');
        toast.success('🏆 You earned the $100 Saver badge!');
      }
      
      // Update state
      setCurrentStreak(newStreak);
      setTotalSaved(newTotal);
      setLastSavedDate(new Date().toISOString());
      
      // Refresh history
      const { data: history } = await supabase
        .from('savings_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      setSavingsHistory(history || []);
      
      toast.success('Saved successfully! Keep up the streak!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCustomDeposit = async () => {
    if (!user) {
      toast.error('Please log in to deposit');
      return;
    }
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const amount = parseFloat(depositAmount);
      
      // Add transaction
      const { error: transactionError } = await supabase
        .from('savings_transactions')
        .insert([{
          user_id: user.id,
          amount: amount,
          type: 'deposit',
          created_at: new Date().toISOString()
        }]);
        
      if (transactionError) {
        throw transactionError;
      }
      
      // Update profile
      const newTotal = totalSaved + amount;
      
      const { error: updateError } = await supabase
        .from('savings_profiles')
        .update({
          total_saved: newTotal
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Check for badges
      if (newTotal >= 100 && !badges.some(b => b.code === 'savings_100')) {
        await awardBadge('savings_100');
        toast.success('🏆 You earned the $100 Saver badge!');
      }
      
      // Update state
      setTotalSaved(newTotal);
      setShowDepositModal(false);
      setDepositAmount('');
      
      // Refresh history
      const { data: history } = await supabase
        .from('savings_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      setSavingsHistory(history || []);
      
      toast.success('Deposit successful!');
    } catch (error) {
      console.error('Error depositing:', error);
      toast.error('Failed to deposit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const awardBadge = async (badgeCode) => {
    try {
      // Get badge ID
      const { data: badge, error: badgeError } = await supabase
        .from('badges')
        .select('id')
        .eq('code', badgeCode)
        .single();
        
      if (badgeError) {
        console.error('Error fetching badge:', badgeError);
        return;
      }
      
      // Award badge to user
      const { error: awardError } = await supabase
        .from('user_badges')
        .insert([{
          user_id: user.id,
          badge_id: badge.id,
          awarded_at: new Date().toISOString()
        }]);
        
      if (awardError) {
        console.error('Error awarding badge:', awardError);
      }
      
      // Refresh badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id);
        
      setBadges(userBadges?.map(ub => ub.badges) || []);
    } catch (error) {
      console.error('Error in awardBadge:', error);
    }
  };
  
  const updateDailyGoal = async (newGoal) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('savings_profiles')
        .update({ daily_goal: newGoal })
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setDailyGoal(newGoal);
      toast.success('Daily goal updated!');
    } catch (error) {
      console.error('Error updating daily goal:', error);
      toast.error('Failed to update daily goal');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl">💰</span>
                </div>
                <motion.div 
                  className="absolute -top-2 -right-2 bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0] 
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  $
                </motion.div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Track Your Savings</h2>
            <p className="text-gray-300 mb-8">Log in to view and manage your personal savings goals</p>
            
            <div className="space-y-4">
              <Link 
                to="/login"
                className="block w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
              >
                Log In
              </Link>
              <Link 
                to="/signup"
                className="block w-full py-3 px-6 bg-transparent border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">Start saving today for a better tomorrow!</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-16 min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4">
              Personal Savings
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Build your financial safety net one day at a time. Small, consistent savings add up to big results!
            </p>
          </motion.div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Savings Summary */}
              <motion.div 
                className="md:col-span-2 bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Your Savings Summary</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Total Saved */}
                  <div className="bg-gray-700 rounded-lg p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold text-gray-200 mb-2">Total Saved</h3>
                      <p className="text-3xl font-bold text-white">{formatCurrency(totalSaved)}</p>
                    </div>
                  </div>
                  
                  {/* Current Streak */}
                  <div 
                    ref={streakRef}
                    className="bg-gray-700 rounded-lg p-6 text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-red-600/20"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold text-gray-200 mb-2">Current Streak</h3>
                      <div className="flex items-center justify-center">
                        <p className="text-3xl font-bold text-white">{currentStreak}</p>
                        <motion.div 
                          className="ml-2 text-2xl"
                          animate={isStreakInView ? { 
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                          } : {}}
                          transition={{ 
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          🔥
                        </motion.div>
                      </div>
                      <p className="text-sm text-gray-300 mt-2">days in a row</p>
                    </div>
                    
                    {/* Animated background flame */}
                    {currentStreak > 5 && (
                      <motion.div 
                        className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-6xl opacity-10"
                        animate={{ 
                          y: [0, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity
                        }}
                      >
                        🔥
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Daily Goal */}
                  <div className="bg-gray-700 rounded-lg p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold text-gray-200 mb-2">Daily Goal</h3>
                      <p className="text-3xl font-bold text-white">{formatCurrency(dailyGoal)}</p>
                      <button 
                        onClick={() => {
                          const newGoal = prompt('Enter new daily goal:', dailyGoal);
                          if (newGoal && !isNaN(newGoal) && parseFloat(newGoal) > 0) {
                            updateDailyGoal(parseFloat(newGoal));
                          }
                        }}
                        className="text-sm text-indigo-400 hover:text-indigo-300 mt-2 underline"
                      >
                        Change Goal
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <p className="text-gray-300">
                      Last saved: <span className="font-medium text-white">{formatDate(lastSavedDate)}</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Save daily to maintain your streak and earn badges!
                    </p>
                  </div>
                  
                  <div className="flex gap-4 mt-4 md:mt-0">
                    <button
                      onClick={handleSaveToday}
                      disabled={isLoading || (lastSavedDate && lastSavedDate.split('T')[0] === new Date().toISOString().split('T')[0])}
                      className={`bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center ${
                        isLoading || (lastSavedDate && lastSavedDate.split('T')[0] === new Date().toISOString().split('T')[0]) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">💰</span>
                          Save Today ({formatCurrency(dailyGoal)})
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowDepositModal(true)}
                      disabled={isLoading}
                      className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Custom Deposit
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Badges */}
              <motion.div 
                className="bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700 relative overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                ref={piggyRef}
              >
                <div className="absolute top-0 right-0 w-full h-16 overflow-hidden">
                  {/* Coin slot */}
                  <div className="absolute top-6 right-10 w-12 h-2 bg-gray-900 rounded-full transform -rotate-12"></div>
                </div>
                
                {/* Falling coins animation */}
                {coinsVisible.map(coin => (
                  <motion.div
                    key={coin.id}
                    className="absolute top-0 text-2xl z-10"
                    initial={{ 
                      top: -30, 
                      left: `${coin.left}%`,
                      rotate: coin.rotation,
                      scale: coin.scale
                    }}
                    animate={{ 
                      top: '100%',
                      rotate: coin.rotation + 360
                    }}
                    transition={{ 
                      duration: coin.duration,
                      delay: coin.delay,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                  >
                    💰
                  </motion.div>
                ))}
                
                <h2 className="text-2xl font-bold text-white mb-6">Your Achievements</h2>
                
                <div className="space-y-4">
                  {badges.length > 0 ? (
                    badges.map((badge, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center p-3 bg-gray-700 rounded-lg border border-gray-600"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + (index * 0.1) }}
                      >
                        <div className="text-3xl mr-3">{badge.icon}</div>
                        <div>
                          <h3 className="font-semibold text-white">{badge.name}</h3>
                          <p className="text-sm text-gray-300">{badge.description}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">No badges earned yet</p>
                      <div className="text-5xl mb-4">🏆</div>
                      <p className="text-sm text-gray-400">
                        Save consistently to earn badges and rewards!
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="font-semibold text-white mb-3">Badges to Earn</h3>
                  
                  <div className="space-y-3">
                    {!badges.some(b => b.code === 'weekly_streak') && (
                      <div className="flex items-center p-2 bg-gray-700 bg-opacity-60 rounded-lg border border-gray-600 opacity-70">
                        <div className="text-2xl mr-3">🔥</div>
                        <div>
                          <h4 className="font-medium text-gray-200">Weekly Streak</h4>
                          <p className="text-xs text-gray-400">Save for 7 days in a row</p>
                        </div>
                      </div>
                    )}
                    
                    {!badges.some(b => b.code === 'monthly_streak') && (
                      <div className="flex items-center p-2 bg-gray-700 bg-opacity-60 rounded-lg border border-gray-600 opacity-70">
                        <div className="text-2xl mr-3">🌟</div>
                        <div>
                          <h4 className="font-medium text-gray-200">Monthly Master</h4>
                          <p className="text-xs text-gray-400">Save for 30 days in a row</p>
                        </div>
                      </div>
                    )}
                    
                    {!badges.some(b => b.code === 'savings_100') && (
                      <div className="flex items-center p-2 bg-gray-700 bg-opacity-60 rounded-lg border border-gray-600 opacity-70">
                        <div className="text-2xl mr-3">💯</div>
                        <div>
                          <h4 className="font-medium text-gray-200">$100 Saver</h4>
                          <p className="text-xs text-gray-400">Save a total of $100</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Transaction History */}
              <motion.div 
                className="md:col-span-3 bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
                
                {savingsHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {savingsHistory.map((transaction, index) => (
                          <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.type === 'deposit' 
                                  ? 'bg-emerald-900/70 text-emerald-300' 
                                  : 'bg-red-900/70 text-red-300'
                              }`}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {formatCurrency(transaction.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No transactions yet</p>
                  </div>
                )}
              </motion.div>
              
              {/* Savings Tips */}
              <motion.div 
                className="md:col-span-3 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-white rounded-xl shadow-xl p-8 mt-8 border border-indigo-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-6">Savings Tips</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                    <div className="text-3xl mb-3">💡</div>
                    <h3 className="text-xl font-semibold mb-2">Start Small</h3>
                    <p className="text-gray-300">
                      Even small daily savings add up over time. Consistency is more important than amount.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                    <p className="text-gray-300">
                      Regularly check your savings growth to stay motivated and adjust your goals.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="text-xl font-semibold mb-2">Set Clear Goals</h3>
                    <p className="text-gray-300">
                      Define what you're saving for to give purpose to your daily savings habit.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full mx-4 border border-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Custom Deposit</h2>
            
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Deposit
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="pl-8 block w-full rounded-lg bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDeposit}
                disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                className={`px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-indigo-500/30 transition-all ${
                  isLoading || !depositAmount || parseFloat(depositAmount) <= 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-lg'
                }`}
              >
                {isLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PersonalSavingsPage;