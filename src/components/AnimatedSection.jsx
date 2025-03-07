import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const childVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 120 }
  }
}

export default function AnimatedSection() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.h2 variants={childVariants} className="text-4xl font-bold">
        Modern Animations
      </motion.h2>
      
      <motion.p 
        variants={childVariants}
        className="text-lg text-gray-600"
      >
        Experience smooth, performant animations powered by Framer Motion
      </motion.p>
      
      <motion.button
        variants={childVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="cta-button bg-accent text-white px-8 py-3 rounded-lg"
      >
        Explore More
      </motion.button>
    </motion.div>
  )
} 