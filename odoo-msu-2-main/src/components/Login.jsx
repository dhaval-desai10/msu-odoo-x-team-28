import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, user } = useAuthStore();
  
  const formRef = useRef(null);
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      // Redirect to home or dashboard
      toast.success('You are already logged in!');
    }
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Simple validation
      if (!email || !password) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
      
      if (!isLogin && !name) {
        setError('Please enter your name');
        setIsLoading(false);
        return;
      }
      
      let result;
      
      if (isLogin) {
        // Sign in
        result = await signIn({ email, password });
      } else {
        // Sign up
        result = await signUp({ email, password, fullName: name });
      }
      
      if (!result.success) {
        setError(result.error || 'Authentication failed');
        setIsLoading(false);
        return;
      }
      
      // Success
      toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
      
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setIsLoading(false);
      
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { resetPassword } = useAuthStore.getState();
      const result = await resetPassword(email);
      
      if (result.success) {
        toast.success('Password reset instructions sent to your email');
      } else {
        setError('Failed to send reset instructions');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
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
    <div className="pt-16 min-h-screen bg-background-primary flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <motion.div 
            className="bg-background-secondary rounded-xl shadow-lg overflow-hidden border border-[rgba(255,255,255,0.05)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-primary to-accent-secondary p-6 text-white text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-white text-opacity-90 mt-1">
                  {isLogin 
                    ? 'Sign in to access your account' 
                    : 'Join our community of financial wellness'
                  }
                </p>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white opacity-10"></div>
              <div className="absolute bottom-[-40px] left-[-20px] w-60 h-60 rounded-full bg-white opacity-5"></div>
            </div>
            
            {/* Form */}
            <motion.form 
              ref={formRef}
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Name Field (Sign Up only) */}
              {!isLogin && (
                <motion.div variants={itemVariants} className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-background-tertiary border border-[rgba(255,255,255,0.1)] rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </motion.div>
              )}
              
              {/* Email Field */}
              <motion.div variants={itemVariants} className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-background-tertiary border border-[rgba(255,255,255,0.1)] rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all duration-300"
                  placeholder="Enter your email"
                />
              </motion.div>
              
              {/* Password Field */}
              <motion.div variants={itemVariants} className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-background-tertiary border border-[rgba(255,255,255,0.1)] rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent text-text-primary placeholder-text-secondary transition-all duration-300"
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                />
              </motion.div>
              
              {/* Remember Me & Forgot Password (Login only) */}
              {isLogin && (
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-accent-primary focus:ring-accent-primary bg-background-tertiary border-[rgba(255,255,255,0.2)] rounded transition-colors duration-300"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="font-medium text-accent-primary hover:text-accent-secondary transition-colors duration-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Terms & Conditions (Sign Up only) */}
              {!isLogin && (
                <motion.div variants={itemVariants} className="text-sm text-text-secondary">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-accent-primary hover:text-accent-secondary transition-colors duration-300">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-accent-primary hover:text-accent-secondary transition-colors duration-300">Privacy Policy</a>.
                </motion.div>
              )}
              
              {/* Error Message */}
              {error && (
                <motion.div 
                  className="bg-[rgba(236,72,153,0.1)] text-accent-tertiary border border-[rgba(236,72,153,0.3)] p-3 rounded-lg text-sm"
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
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 ${
                  isLoading 
                    ? 'bg-background-tertiary cursor-not-allowed' 
                    : 'bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-glow'
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
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </motion.button>
              
              {/* Toggle Auth Mode */}
              <motion.div variants={itemVariants} className="text-center mt-4">
                <p className="text-sm text-text-secondary">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="ml-1 text-accent-primary hover:text-accent-secondary font-medium focus:outline-none transition-colors duration-300"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
          
          {/* Social Login Options */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-sm text-text-secondary mb-4">Or continue with</p>
            <div className="flex justify-center space-x-4">
              <button className="flex items-center justify-center w-12 h-12 rounded-full bg-background-secondary border border-[rgba(255,255,255,0.05)] shadow-md hover:shadow-glow transition-all duration-300 transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                </svg>
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-full bg-background-secondary border border-[rgba(255,255,255,0.05)] shadow-md hover:shadow-glow transition-all duration-300 transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-full bg-background-secondary border border-[rgba(255,255,255,0.05)] shadow-md hover:shadow-glow transition-all duration-300 transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-full bg-background-secondary border border-[rgba(255,255,255,0.05)] shadow-md hover:shadow-glow transition-all duration-300 transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm-2.426 14.741h-3.574v-.202l1.261-1.529c.134-.159.179-.338.134-.536v-5.304c0-.137-.067-.238-.201-.301-.201-.101-.469-.101-.671.034l-1.125.637v-.637l4.030-1.529h.267v7.639c0 .137.067.238.201.301.201.101.469.101.671-.034l1.007-.57v.57l-2.02 1.461h-.267zm.993-10.117c-.671 0-1.215-.544-1.215-1.214 0-.671.544-1.214 1.215-1.214s1.214.544 1.214 1.214c0 .67-.544 1.214-1.214 1.214z"/>
                </svg>
              </button>
            </div>
          </motion.div>
          
          {/* Back to Home */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <a 
              href="/"
              className="inline-flex items-center text-accent-primary hover:text-accent-secondary transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;