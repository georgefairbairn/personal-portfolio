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
    
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    return Math.abs(elementCenter - viewportCenter) < windowHeight * 0.15;
  };

  // Auto-expand when the group snaps into view on mobile
  useEffect(() => {
    if (!isMobile || !groupRef.current || autoTriggered) return;

    const rootElement = document.querySelector('main');

    let rafId: number | null = null;
    let cleanedUp = false;

    const triggerExpand = () => {
      if (cleanedUp) return;
      setIsExpanded(true);
      setAutoTriggered(true);
      cleanup();
    };

    const tryTrigger = () => {
      if (!groupRef.current) return;
      if (isElementInMiddleOfViewport(groupRef.current)) {
        triggerExpand();
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        tryTrigger();
      });
    };

    const cleanup = () => {
      cleanedUp = true;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (rootElement) {
        rootElement.removeEventListener('scroll', onScroll as EventListener);
      }
      window.removeEventListener('resize', tryTrigger);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    // IntersectionObserver on the snapping container for reliable iOS behavior
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
              // slight delay to allow snap to settle
              setTimeout(triggerExpand, 120);
            }
          });
        },
        { root: (rootElement as Element) || null, threshold: [0.2, 0.4, 0.6], rootMargin: '0px 0px -20% 0px' }
      );

      if (groupRef.current) {
        observer.observe(groupRef.current);
        observerRef.current = observer;
      }
    }

    // Fallback: listen to scroll and resize to detect when centered
    if (rootElement) {
      rootElement.addEventListener('scroll', onScroll as EventListener, { passive: true } as AddEventListenerOptions);
    }
    window.addEventListener('resize', tryTrigger);

    // Initial check (in case already centered after snap on mount)
    setTimeout(tryTrigger, 50);

    return cleanup;
  }, [isMobile, autoTriggered]);
  
  // Reset expanded state if switching between mobile and desktop
  useEffect(() => {
    setIsExpanded(false);
    setAutoTriggered(false);
    
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [isMobile]);
  
  const handleClick = () => {
    if (isMobile && !isExpanded) {
      setIsExpanded(true);
    }
  };

  // Calculate height for grid layout (mobile only), clamped to viewport so title is visible
  const calculateGridHeight = () => {
    if (!isMobile) return 0; 

    // Desired grid height based on card sizing
    const baseCardSize = isSmallMobile ? 95 : 115;
    const textHeight = 40;
    const verticalSpacing = isSmallMobile ? 70 : 90;
    const desiredExpandedHeight = (baseCardSize + textHeight) + verticalSpacing + (baseCardSize + textHeight) + 40; // +bottom padding

    if (!isExpanded) {
      return Math.min(140, desiredExpandedHeight); // collapsed height
    }

    // Reserve space for section title and some breathing room
    const reservedHeaderHeight = isSmallMobile ? 120 : 140;
    const verticalPadding = 32; // padding/margins in section
    const available = Math.max(160, window.innerHeight - reservedHeaderHeight - verticalPadding);

    return Math.min(desiredExpandedHeight, available);
  };

  const gridHeight = calculateGridHeight();

  return (
    <div 
      ref={groupRef}
      onClick={handleClick}
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
      className={`relative w-full overflow-visible transition-all duration-700 group flex justify-center md:h-[480px] mb-6 md:mb-0`}
      style={{ height: isMobile ? `${gridHeight}px` : undefined }}
    >
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