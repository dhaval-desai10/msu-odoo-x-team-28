import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const formRef = useRef(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  return (
    <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <motion.div 
            className="bg-white rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Reset Your Password</h2>
              <p className="text-white text-opacity-90 mt-1">
                Enter your new password below
              </p>
            </div>
            
            {/* Form */}
            <motion.form 
              ref={formRef}
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* New Password Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your new password"
                />
              </motion.div>
              
              {/* Confirm Password Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your new password"
                />
              </motion.div>
              
              {/* Password Requirements */}
              <motion.div variants={itemVariants} className="text-sm text-gray-600">
                <p>Password must:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Be at least 6 characters long</li>
                  <li>Include at least one uppercase letter</li>
                  <li>Include at least one number</li>
                </ul>
              </motion.div>
              
              {/* Error Message */}
              {error && (
                <motion.div 
                  className="bg-red-50 text-red-500 p-3 rounded-md text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
              
              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-all duration-300 ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-accent hover:bg-opacity-90 transform hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Reset Password'}
              </motion.button>
              
              {/* Back to Login */}
              <motion.div variants={itemVariants} className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-primary hover:text-secondary font-medium focus:outline-none"
                >
                  Back to Login
                </button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;