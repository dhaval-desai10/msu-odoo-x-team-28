// Animation utility file with reusable bouncy animations

// Basic bounce animation for buttons, cards, and UI elements
export const bounceAnimation = {
  tap: { 
    scale: 0.95, 
    transition: { type: "spring", stiffness: 400, damping: 17 } 
  },
  hover: { 
    scale: 1.05, 
    transition: { type: "spring", stiffness: 400, damping: 10 } 
  },
  initial: { 
    scale: 1 
  }
};

// More pronounced bounce for important elements like CTAs
export const strongBounce = {
  tap: { 
    scale: 0.9, 
    transition: { type: "spring", stiffness: 500, damping: 15 } 
  },
  hover: { 
    scale: 1.1, 
    transition: { type: "spring", stiffness: 300, damping: 8 } 
  },
  initial: { 
    scale: 1 
  }
};

// Subtle bounce for smaller elements
export const subtleBounce = {
  tap: { 
    scale: 0.97, 
    transition: { type: "spring", stiffness: 500, damping: 20 } 
  },
  hover: { 
    scale: 1.03, 
    transition: { type: "spring", stiffness: 500, damping: 15 } 
  },
  initial: { 
    scale: 1 
  }
};

// Bounce effect for page entry animations
export const pageEntryBounce = {
  initial: { 
    opacity: 0, 
    y: 50, 
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      mass: 1.2,
      delay: 0.1
    } 
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 15 
    } 
  }
};

// Staggered bounce for lists of items (children)
export const staggeredBounceContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggeredBounceItem = {
  hidden: { 
    y: 20, 
    opacity: 0,
    scale: 0.8 
  },
  show: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

// Bounce with rotation for more playful elements
export const bouncyRotate = {
  initial: { rotate: 0, scale: 1 },
  hover: { 
    rotate: [0, -5, 5, -3, 3, 0], 
    scale: 1.1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 10,
      duration: 0.8
    } 
  },
  tap: { 
    scale: 0.9, 
    rotate: 0,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    } 
  }
};

// Subtle float animation (continuous)
export const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

// Pulse animation (continuous)
export const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
}; 