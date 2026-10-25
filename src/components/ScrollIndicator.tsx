import { motion } from 'framer-motion';
import { TbArrowDownDashed } from 'react-icons/tb';

const ScrollIndicator = () => {
  const scrollToCareer = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('career')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <motion.button
      type="button"
      onClick={scrollToCareer}
      aria-label="Scroll to career"
      className="absolute bottom-6 flex flex-col items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1,
        delay: 2.5
      }}
    >
      <p className="text-xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>SCROLL</p>
      <motion.div
        animate={{
          y: [0, -5, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }}
      >
        <TbArrowDownDashed size={24} />
      </motion.div>
    </motion.button>
  );
};

export default ScrollIndicator;
