import { motion } from 'framer-motion';

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function AnimatedImage({ src, alt, className = "" }: AnimatedImageProps) {
  return (
    <motion.img 
      src={src}
      alt={alt}
      className={className}
      initial={{ y: 240 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2
      }}
    />
  );
} 