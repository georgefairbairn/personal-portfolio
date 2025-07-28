import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
}

export default function AnimatedImage({ src, alt, className = "", delay = 0.2 }: AnimatedImageProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end start"]
  });
  
  // Transform scrollYProgress to y position
  // Accelerate the receding effect by using a smaller scroll range (0 to 0.15)
  // This means the image will fully recede by 15% of the scroll, before the element is out of view
  const y = useTransform(scrollYProgress, [0, 0.15], [0, 240]);

  return (
    <motion.img 
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      initial={{ y: 240 }}
      animate={{ y: 0 }}
      style={{ y }} // Apply the scroll-based animation
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay
      }}
    />
  );
} 