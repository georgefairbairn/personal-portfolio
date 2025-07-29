import React, { useEffect, useState } from 'react';

interface CardProps {
  index: number;
  image?: string;
  alt?: string;
  rotate?: number;
  totalCards?: number;
  expanded?: boolean;
  useGridLayout?: boolean;
  children?: React.ReactNode;
  hoverText?: string;
}

export const Card: React.FC<CardProps> = ({
  index,
  image,
  alt,
  rotate = 0,
  totalCards = 4,
  expanded = false,
  useGridLayout = false,
  children,
  hoverText
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Check if device is mobile and how small
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width <= 768);
      setIsSmallMobile(width <= 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Calculate initial translate value for overlap effect
  const initialTranslate = () => {
    const cardWidth = getCardSize().width;
    
    // More aggressive overlap on mobile to ensure cards stay centered
    const overlapFactor = isMobile ? 0.75 : 0.25;
    const overlap = cardWidth * overlapFactor;
    
    // Calculate center offset
    // For mobile we want a tighter stack
    const centerOffset = (index - (totalCards - 1) / 2) * (cardWidth - overlap);
    
    // Adjust the offset for mobile to ensure it's more centered
    return isMobile ? centerOffset * 0.7 : centerOffset;
  };

  // Calculate expanded translate value for equal spacing (desktop)
  const expandedTranslate = () => {
    const cardWidth = getCardSize().width;
    const spacing = isSmallMobile ? 5 : (isMobile ? 10 : 40);
    const totalWidth = cardWidth * totalCards + spacing * (totalCards - 1);
    const startPosition = -totalWidth / 2 + cardWidth / 2;
    return startPosition + index * (cardWidth + spacing);
  };

  // Get card dimensions based on screen size
  const getCardSize = () => {
    if (!isMobile) {
      return { width: 200, height: 200 };
    }

    // For mobile - calculate based on screen width with more reasonable padding
    // Use percentage-based sizing for a more balanced approach
    const screenPercentage = isSmallMobile ? 0.45 : 0.48; // Increased percentage for wider cards
    
    // Calculate width based on percentage, ensuring we don't get too large
    let cardWidth = Math.floor(screenWidth * screenPercentage);
    
    // Add some reasonable limits
    const maxSize = 150; // Increased maximum card size on mobile
    const minSize = isSmallMobile ? 80 : 95; // Slightly increased minimum card size
    
    cardWidth = Math.min(maxSize, Math.max(minSize, cardWidth));
    
    return {
      width: cardWidth,
      height: cardWidth // Keep it square
    };
  };

  // Calculate grid layout position (mobile)
  const gridPosition = () => {
    const { width: cardSize, height: cardHeight } = getCardSize();
    
    // Use more spacing for better visibility
    const horizontalSpacing = isSmallMobile ? 12 : 20;
    const verticalSpacing = isSmallMobile ? 70 : 90; // Further reduced vertical spacing (matching CardGroup)
    
    // Calculate rows and columns based on total cards
    // For 4 cards, we want a 2x2 grid
    const cols = Math.min(2, totalCards);
    const rows = Math.ceil(totalCards / cols);
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // Calculate total dimensions of the grid
    const gridWidth = cardSize * cols + horizontalSpacing * (cols - 1);
    const gridHeight = cardHeight * rows + verticalSpacing * (rows - 1);
    
    // Center the grid and calculate positions within it
    const xPos = (col * (cardSize + horizontalSpacing)) - (gridWidth / 2) + (cardSize / 2);
    const yPos = (row * (cardHeight + verticalSpacing)) - (gridHeight / 2) + (cardHeight / 2);
    
    return { x: xPos, y: yPos };
  };

  // Determine z-index based on position
  const zIndex = expanded ? (10 - index) : (10 + index * 10);
  
  // Calculate transition delay for staggered animation
  const transitionDelay = `${index * 50}ms`;

  // Create dynamic class name for this specific card
  const cardClassName = `card-${index}`;
  
  // Calculate transform based on expanded state and layout type
  let cardTransform;
  
  if (useGridLayout) {
    // Mobile grid layout
    if (expanded) {
      const { x, y } = gridPosition();
      cardTransform = `translate(${x}px, ${y}px) rotate(0deg)`;
    } else {
      // For stacked cards, use less rotation on mobile for better appearance
      const mobileRotate = rotate * 0.6;
      cardTransform = `translateX(${initialTranslate()}px) rotate(${isMobile ? mobileRotate : rotate}deg)`;
    }
  } else {
    // Desktop horizontal layout
    cardTransform = expanded
      ? `translateX(${expandedTranslate()}px) rotate(0deg)`
      : `translateX(${initialTranslate()}px) rotate(${rotate}deg)`;
  }

  // Get card size dimensions
  const { width: cardWidth, height: cardHeight } = getCardSize();
  
  // Card and image sizes based on screen size
  let imageSize, borderRadius;
  
  if (isSmallMobile) {
    imageSize = 'max-w-[70%] max-h-[70%]';
    borderRadius = 'rounded-xl';
  } else if (isMobile) {
    imageSize = 'max-w-[70%] max-h-[70%]';
    borderRadius = 'rounded-2xl';
  } else {
    imageSize = 'max-w-[140px] max-h-[140px]';
    borderRadius = 'rounded-3xl';
  }

  return (
    <>
      <style>
        {`.group:hover .${cardClassName}-container {
          transform: translateX(${expandedTranslate()}px) rotate(0deg) !important;
        }`}
      </style>
      {/* Container for card and its text */}
      <div 
        className={`absolute ${cardClassName}-container`}
        style={{
          transform: cardTransform,
          zIndex: zIndex,
          transitionDelay: transitionDelay,
          transition: 'transform 0.5s',
          width: `${cardWidth}px` // Set width to match card
        }}
      >
        {/* The card itself */}
        <div
          className={`${borderRadius} bg-white flex items-center justify-center transform duration-500 transition-all hover:scale-105 ${cardClassName}`}
          style={{
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            width: `${cardWidth}px`,
            height: `${cardHeight}px`
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {image ? (
            <img 
              src={image}
              alt={alt || "Card image"}
              className={`${imageSize} object-contain`}
            />
          ) : children}
        </div>
        
        {/* Text positioned below each card - only visible when expanded or hovered */}
        {hoverText && (
          <div 
            className={`relative text-center transform transition-all duration-300 font-heading 
              ${isSmallMobile ? 'text-sm mt-2' : isMobile ? 'text-base mt-2' : 'text-xl mt-4'} 
              uppercase ${(isMobile && expanded) || (!isMobile && isHovered) ? 'opacity-100' : 'opacity-0'} 
              break-words w-full px-1`}
            style={{
              transitionDelay: expanded ? `${300 + index * 50}ms` : '0ms', // Extra delay to ensure text appears after animation completes
            }}
          >
            {hoverText}
          </div>
        )}
      </div>
    </>
  );
}; 