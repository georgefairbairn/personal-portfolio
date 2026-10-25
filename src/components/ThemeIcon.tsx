import { useState, useEffect } from 'react';
import { MdColorLens } from 'react-icons/md';

interface ThemeIconProps {
  className?: string;
}

// Theme definitions with 300-shade colors for better visibility
const THEMES = [
  { id: 'violet', color: 'bg-violet-300', ring: 'outline-violet-400' },
  { id: 'rose', color: 'bg-rose-300', ring: 'outline-rose-400' },
  { id: 'teal', color: 'bg-teal-300', ring: 'outline-teal-400' },
  { id: 'sky', color: 'bg-sky-300', ring: 'outline-sky-400' },
  { id: 'orange', color: 'bg-orange-300', ring: 'outline-orange-400' },
];

// Swatch size, tap target size and arc radius for touch vs mouse.
// Touch targets meet the 44px minimum; the arc radius keeps neighbouring targets from overlapping.
const SIZES = {
  touch: { swatch: 28, target: 44, distance: 120 },
  mouse: { swatch: 22, target: 30, distance: 80 },
};

export default function ThemeIcon({ className = '' }: ThemeIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('violet');
  const [isTouch, setIsTouch] = useState(false);

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'violet';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Size swatches for the primary input rather than screen width, so tablets get touch sizes
  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setIsTouch(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeClick = (themeId: string) => {
    // Set theme using data-theme attribute
    document.documentElement.setAttribute('data-theme', themeId);

    // Save to localStorage
    localStorage.setItem('theme', themeId);

    // Update state
    setCurrentTheme(themeId);

    // Close the menu
    setIsOpen(false);
  };

  // Constants for positioning
  const mainRadius = 25; // 50px diameter / 2
  const { swatch, target, distance } = isTouch ? SIZES.touch : SIZES.mouse;

  // Calculate position based on polar coordinates (angle in degrees)
  const getPosition = (angleDegrees: number) => {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    // Note: Y is negative because in CSS, top increases downward
    return {
      left: `${mainRadius + distance * Math.cos(angleRadians)}px`,
      top: `${mainRadius + distance * -Math.sin(angleRadians)}px`,
    };
  };

  // Spread every theme evenly from left (180°) to straight down (270°)
  const angleStep = 90 / (THEMES.length - 1);

  return (
    <div className="relative inline-block">
      {/* Main button */}
      <button
        onClick={toggleOpen}
        className={`relative z-10 rounded-full bg-black w-[50px] h-[50px] flex items-center justify-center cursor-pointer ${className}`}
        aria-label="Toggle theme options"
        aria-expanded={isOpen}
      >
        <MdColorLens className="text-white w-[30px] h-[30px]" />
      </button>

      {/* Circle container */}
      <div className="absolute top-0 left-0" style={{ width: '50px', height: '50px' }}>
        {/* Generate theme circles - the current theme is ringed in its own color */}
        {THEMES.map((theme, index) => {
          const position = getPosition(180 + index * angleStep);
          const isCurrent = theme.id === currentTheme;

          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.id)}
              aria-label={`${theme.id} theme`}
              aria-pressed={isCurrent}
              tabIndex={isOpen ? 0 : -1}
              className="absolute flex items-center justify-center rounded-full cursor-pointer
                        transition-all duration-300 ease-out group/swatch
                        focus:outline-none"
              style={{
                left: position.left,
                top: position.top,
                width: `${target}px`,
                height: `${target}px`,
                marginLeft: `${-target / 2}px`, // Center the tap target on the arc position
                marginTop: `${-target / 2}px`,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'scale(1)' : 'scale(0)',
                transitionDelay: isOpen ? `${index * 50}ms` : `${(THEMES.length - 1 - index) * 50 + 100}ms`,
                pointerEvents: isOpen ? 'auto' : 'none'
              }}
            >
              <span
                className={`block rounded-full ${theme.color} shadow-sm transition-transform duration-200
                          group-hover/swatch:scale-110
                          ${isCurrent ? `outline-2 outline-offset-[3px] ${theme.ring}` : ''}
                          group-focus-visible/swatch:outline-2 group-focus-visible/swatch:outline-offset-[3px] group-focus-visible/swatch:outline-current`}
                style={{ width: `${swatch}px`, height: `${swatch}px` }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
