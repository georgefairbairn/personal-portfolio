import React, { useEffect, useState } from 'react';

// Mobile card size - percentage of screen width, clamped
export const getMobileCardSize = (screenWidth: number) => {
  const isSmallMobile = screenWidth <= 480;
  const screenPercentage = isSmallMobile ? 0.45 : 0.48;
  const minSize = isSmallMobile ? 80 : 95;
  return Math.min(150, Math.max(minSize, Math.floor(screenWidth * screenPercentage)));
};

// Mobile grid layout shared by Card (positioning) and CardGroup (container height)
export const getMobileGridMetrics = (screenWidth: number, totalCards: number) => {
  const isSmallMobile = screenWidth <= 480;
  const cardSize = getMobileCardSize(screenWidth);
  const horizontalSpacing = isSmallMobile ? 12 : 20;
  const verticalSpacing = isSmallMobile ? 70 : 90; // room for the label under each card
  const labelHeight = isSmallMobile ? 28 : 32; // label line-height + top margin
  const cols = Math.min(2, totalCards);
  const rows = Math.ceil(totalCards / cols);
  const height = cardSize * rows + verticalSpacing * (rows - 1) + labelHeight;
  return { cardSize, horizontalSpacing, verticalSpacing, cols, rows, height };
};

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
  backTitle?: string;
  backSubtitle?: string;
  href?: string;
  linkText?: string;
  isGroupHovered?: boolean;
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
  hoverText,
  backTitle,
  backSubtitle,
  href,
  linkText,
  isGroupHovered
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  useEffect(() => {
    if (!useGridLayout && isGroupHovered === false) {
      setIsFlipped(false);
    }
  }, [isGroupHovered, useGridLayout]);

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

    const cardWidth = getMobileCardSize(screenWidth);
    return { width: cardWidth, height: cardWidth };
  };

  // Calculate grid layout position (mobile)
  // Each card container's top sits on the group's vertical centre line, so
  // y is the offset of the card's top edge from that line
  const gridPosition = () => {
    const { cardSize, horizontalSpacing, verticalSpacing, cols, height } = getMobileGridMetrics(screenWidth, totalCards);
    const row = Math.floor(index / cols);
    const col = index % cols;
    const gridWidth = cardSize * cols + horizontalSpacing * (cols - 1);

    const xPos = (col * (cardSize + horizontalSpacing)) - (gridWidth / 2) + (cardSize / 2);
    const yPos = (row * (cardSize + verticalSpacing)) - (height / 2);

    return { x: xPos, y: yPos };
  };

  // Determine z-index based on position
  const zIndex = expanded ? (10 - index) : (10 + index * 10);
  
  // Calculate transition delay for staggered animation
  const transitionDelay = `${index * 50}ms`;

  // Create dynamic class name for this specific card
  const cardClassName = `card-${index}`;
  
  const { width: cardWidth, height: cardHeight } = getCardSize();

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
      cardTransform = `translate(${initialTranslate()}px, ${-cardHeight / 2}px) rotate(${isMobile ? mobileRotate : rotate}deg)`;
    }
  } else {
    // Desktop horizontal layout
    cardTransform = expanded
      ? `translateX(${expandedTranslate()}px) rotate(0deg)`
      : `translateX(${initialTranslate()}px) rotate(${rotate}deg)`;
  }

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
      {!useGridLayout && (
        <style>
          {`.group:hover .${cardClassName}-container {
            transform: translateX(${expandedTranslate()}px) rotate(0deg) !important;
          }`}
        </style>
      )}
      {/* Container for card and its text */}
      <div 
        className={`absolute ${cardClassName}-container`}
        style={{
          transform: cardTransform,
          zIndex: zIndex,
          transitionDelay: transitionDelay,
          transition: 'transform 0.5s',
          width: `${cardWidth}px`, // Set width to match card
          perspective: '1000px'
        }}
      >
        {/* The card itself (flip wrapper with front/back faces) */}
        <div
          className={`relative ${cardClassName} cursor-pointer transform duration-500 transition-all`}
          style={{
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s ease',
            willChange: 'transform',
            transform: `${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}${!isMobile ? (isHovered ? ' scale(1.05)' : ' scale(1)') : ''}`
          }}
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Front face */}
          <div
            className={`${borderRadius} bg-white absolute inset-0 flex items-center justify-center`}
            style={{
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              backfaceVisibility: 'hidden'
            }}
          >
            {image ? (
              <img 
                src={image}
                alt={alt || "Card image"}
                className={`${imageSize} object-contain`}
              />
            ) : children}
          </div>

          {/* Back face */}
          <div
            className={`${borderRadius} bg-white absolute inset-0 flex items-center justify-center`}
            style={{
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="flex flex-col items-center justify-center text-center px-3">
              {backTitle && (
                <div className={`font-heading uppercase ${isSmallMobile ? 'text-sm' : isMobile ? 'text-base' : 'text-xl'}`}>
                  {backTitle}
                </div>
              )}
              {backSubtitle && (
                <div className={`${isSmallMobile ? 'text-xs' : isMobile ? 'text-sm' : 'text-base'} opacity-70 mt-1`}>
                  {backSubtitle}
                </div>
              )}
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={isFlipped ? 0 : -1}
                  className={`font-heading uppercase underline underline-offset-4 ${isSmallMobile ? 'text-sm mt-2' : isMobile ? 'text-base mt-2' : 'text-lg mt-3'}`}
                >
                  {linkText || 'View'}
                </a>
              )}
            </div>
          </div>
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