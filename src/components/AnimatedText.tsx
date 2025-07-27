import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function AnimatedText({ text, delay = 0, className = "" }: AnimatedTextProps) {
  return (
    <motion.span 
      className={`block ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        delay, 
        ease: "easeOut" 
      }}
    >
      {text}
    </motion.span>
  );
} 