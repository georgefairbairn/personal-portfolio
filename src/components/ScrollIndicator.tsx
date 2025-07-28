import { motion } from 'framer-motion';
import { TbArrowDownDashed } from 'react-icons/tb';

const ScrollIndicator = () => {
  return (
    <motion.div 
      className="absolute bottom-6 flex flex-col items-center"
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
    </motion.div>
  );
};

export default ScrollIndicator; 