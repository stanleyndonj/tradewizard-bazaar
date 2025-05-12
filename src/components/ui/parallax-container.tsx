
import React, { useEffect, ReactNode } from 'react';

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // 0-1, with 1 being stronger effect
}

const ParallaxContainer: React.FC<ParallaxContainerProps> = ({ 
  children, 
  className = '',
  intensity = 0.5
}) => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const parallaxLayers = document.querySelectorAll('.parallax-layer');
      
      parallaxLayers.forEach((layer: Element) => {
        const htmlLayer = layer as HTMLElement;
        
        // Get data attribute for speed or use default based on class
        const dataSpeed = htmlLayer.getAttribute('data-parallax-speed');
        
        let speed: number;
        if (dataSpeed) {
          speed = parseFloat(dataSpeed) * intensity;
        } else {
          speed = htmlLayer.classList.contains('parallax-layer-back') ? 0.5 * intensity : 
                 htmlLayer.classList.contains('parallax-layer-front') ? -0.2 * intensity : 0;
        }
        
        if (speed !== 0) {
          const yPos = scrollY * speed;
          htmlLayer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [intensity]);

  return (
    <div className={`parallax-container ${className}`}>
      {children}
    </div>
  );
};

export default ParallaxContainer;
