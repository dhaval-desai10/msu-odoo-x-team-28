export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const isMobile = window.innerWidth < 768;
const animationProps = isMobile ? {} : {
  animate: { /* your animations */ }
}; 