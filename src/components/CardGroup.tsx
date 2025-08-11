import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';

export interface CardItem {
  id: string;
  image?: string;
  alt?: string;
  rotate?: number;
  children?: React.ReactNode;
  hoverText?: string;
  backTitle?: string;
  backSubtitle?: string;
}

interface CardGroupProps {
  cards: CardItem[];
}

export const CardGroup: React.FC<CardGroupProps> = ({ cards }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [isGroupHovered, setIsGroupHovered] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check if device is mobile and how small
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsSmallMobile(width <= 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Check if element is in middle of viewport
  const isElementInMiddleOfViewport = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // The center point of the element
    const elementCenter = rect.top + rect.height / 2;
    
    // The center point of the viewport
    const viewportCenter = windowHeight / 2;
    
    // Check if the element's center is near the viewport's center
    // We consider "middle" to be within 15% of the center
    return Math.abs(elementCenter - viewportCenter) < windowHeight * 0.15;
  };

  // Set up scroll monitoring for middle-of-viewport detection
  useEffect(() => {
    if (!isMobile || !groupRef.current || autoTriggered) return;

    const handleScroll = () => {
      if (groupRef.current && isElementInMiddleOfViewport(groupRef.current)) {
        setTimeout(() => {
          setIsExpanded(true);
          setAutoTriggered(true);
        }, 300);
        
        // Remove scroll listener once triggered
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Check initial position
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, autoTriggered]);
  
  // Reset expanded state if switching between mobile and desktop
  useEffect(() => {
    setIsExpanded(false);
    setAutoTriggered(false);
    
    // Clean up previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [isMobile]);
  
  // Handle manual tap/click to toggle expanded state
  const handleClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  // Calculate height for grid layout (mobile only)
  const calculateGridHeight = () => {
    if (!isMobile) return 0; 
    
    // For mobile grid layout
    if (!isExpanded) return 140; // Initial collapsed height (reduced)
    
    // Define base card size and spacing
    const baseCardSize = isSmallMobile ? 95 : 115; // Increased to match Card.tsx
    const textHeight = 40; // Increased height for text
    const verticalSpacing = isSmallMobile ? 70 : 90; // Further reduced vertical spacing
    
    // For a 2x2 grid of 4 cards
    // First row height + vertical spacing + second row height
    const totalHeight = (baseCardSize + textHeight) + verticalSpacing + (baseCardSize + textHeight);
    
    // Add extra padding at the bottom
    const bottomPadding = 40;
    
    return totalHeight + bottomPadding;
  };

  const gridHeight = calculateGridHeight();

  return (
    <div 
      ref={groupRef}
      onClick={handleClick}
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
      className={`relative w-full overflow-visible transition-all duration-700 group flex justify-center md:h-[480px]`}
      style={{ height: isMobile ? `${gridHeight}px` : undefined }}
    >
      {/* Full width/height interactive area to prevent hover flicker between gaps */}
      <div className="relative h-full w-full md:overflow-visible">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              index={index}
              image={card.image}
              alt={card.alt}
              rotate={card.rotate}
              totalCards={cards.length}
              expanded={isMobile && isExpanded}
              useGridLayout={isMobile}
              hoverText={card.hoverText}
              backTitle={card.backTitle}
              backSubtitle={card.backSubtitle}
              isGroupHovered={isGroupHovered}
            >
              {card.children}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}; 