const ScrollAnimatedSection = ({ children, className = "" }) => {
  return (
    <div className={`py-20 ${className}`}>
      {children}
    </div>
  );
};

export default ScrollAnimatedSection; 