import { motion, MotionConfig } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import AnimatedText from './AnimatedText';
import AnimatedImage from './AnimatedImage';
import ScrollIndicator from './ScrollIndicator';

const PROFILE_IMAGE = "https://res.cloudinary.com/neon-flights/image/upload/c_crop,g_south,h_0.9/c_limit,w_480/f_auto,q_auto/v1753641264/personal-website/profilepiccolor_g4p5t3.png";

const CONTACT_LINKS = [
  { href: "https://github.com/georgefairbairn", label: "GitHub", Icon: FaGithub },
  { href: "https://www.linkedin.com/in/george-fairbairn", label: "LinkedIn", Icon: FaLinkedin },
];

const ellipseTransition = { duration: 0.5, delay: 0.8, ease: "easeOut" } as const;

export default function Hero() {
  return (
    // "user" drops transform animations for visitors with Reduce Motion enabled
    <MotionConfig reducedMotion="user">
      <div className="max-w-[80%] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {/* Container for positioning with height that accounts for image */}
          <div className="relative w-[360px] h-[250px] flex justify-center">
            {/* Bottom ellipse (behind image) */}
            <motion.div
              className="bg-black w-[360px] h-[38px] absolute bottom-0 z-[5]"
              style={{ borderRadius: "50% / 100%" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={ellipseTransition}
            />

            {/* Image container with overflow hidden to hide image until it reaches the ellipse */}
            <div className="absolute bottom-0 w-[240px] h-[240px] overflow-hidden z-10">
              {/* Profile image rising from bottom */}
              <AnimatedImage
                src={PROFILE_IMAGE}
                alt="George Fairbairn profile picture"
                className="w-[240px] h-[240px] absolute left-1/2 -translate-x-1/2 bottom-0"
                delay={1.2}
              />
            </div>

            {/* Clipping mask for the top half of ellipse (in front of image) */}
            <motion.div
              className="absolute bottom-0 w-[360px] h-[19px] overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={ellipseTransition}
            >
              {/* Top half of ellipse using negative margin to position it correctly */}
              <div className="bg-black w-[360px] h-[38px] mt-[-19px]" style={{ borderRadius: "50% / 100%" }} />
            </motion.div>
          </div>
          <div className="flex flex-col items-center md:items-start gap-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-hero text-center md:text-left">
              <AnimatedText text="George" />
              <AnimatedText text="Fairbairn" delay={0.2} />
            </h1>
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              {CONTACT_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:opacity-70 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded"
                >
                  <Icon size={28} />
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      <ScrollIndicator />
    </MotionConfig>
  );
}
