import { useState, useEffect } from 'react';
import { MdColorLens } from 'react-icons/md';

interface ThemeIconProps {
  className?: string;
}

// Theme definitions with 300-shade colors for better visibility
const THEMES = [
  { id: 'violet', color: 'bg-violet-300' }, // Violet-300 - slightly darker than the bg
  { id: 'rose', color: 'bg-rose-300' },     // Rose-300
  { id: 'teal', color: 'bg-teal-300' },     // Teal-300
  { id: 'sky', color: 'bg-sky-300' },       // Sky-300
  { id: 'orange', color: 'bg-orange-300' }, // Orange-300
];

export default function ThemeIcon({ className = '' }: ThemeIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('violet');

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'violet';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
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
  const distance = mainRadius + 20; // 20px spacing from the main circle edge

  // Calculate position based on polar coordinates (angle in degrees)
  const getPosition = (angleDegrees: number) => {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    // Note: Y is negative because in CSS, top increases downward
    return {
      left: `${mainRadius + distance * Math.cos(angleRadians)}px`,
      top: `${mainRadius + distance * -Math.sin(angleRadians)}px`,
    };
  };

  // Positions for each circle based on angles
  const positions = [
    getPosition(180), // Left (west)
    getPosition(210), // Southwest
    getPosition(240), // South-southwest
    getPosition(270)  // Bottom (south)
  ];

  // Available themes (excluding current theme)
  const availableThemes = THEMES.filter(theme => theme.id !== currentTheme);

  return (
    <div className="relative inline-block">
      {/* Main button */}
      <button 
        onClick={toggleOpen}
        className={`relative z-10 rounded-full bg-black w-[50px] h-[50px] flex items-center justify-center cursor-pointer ${className}`}
        aria-label="Toggle theme options"
      >
        <MdColorLens className="text-white w-[30px] h-[30px]" />
      </button>

      {/* Circle container */}
      <div className="absolute top-0 left-0" style={{ width: '50px', height: '50px' }}>
        {/* Generate theme circles */}
        {availableThemes.slice(0, 4).map((theme, index) => {
          const position = positions[index];
          
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.id)}
              aria-label={`${theme.id} theme`}
              className={`absolute w-[15px] h-[15px] rounded-full ${theme.color} 
                        transition-all duration-300 ease-out cursor-pointer
                        focus:outline-none focus:ring-1 focus:ring-offset-1 hover:scale-110`}
              style={{
                left: position.left,
                top: position.top,
                marginLeft: '-7.5px', // Half of the circle width to center it
                marginTop: '-7.5px',  // Half of the circle height to center it
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'scale(1)' : 'scale(0)',
                transitionDelay: isOpen ? `${index * 50}ms` : `${(3 - index) * 50 + 100}ms`,
                pointerEvents: isOpen ? 'auto' : 'none'
              }}
            />
          );
        })}
      </div>
    </div>
  );
} 